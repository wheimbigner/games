var config = require('config');
var User = require('./models/users');

var jwt = require('jsonwebtoken');
var jwksClient = require('jwks-rsa');
var nonce = require('nonce-str');

var googleKeyClient = jwksClient({
	jwksUri: 'https://www.googleapis.com/oauth2/v3/certs'
});

function getKey(header, callback) {
	googleKeyClient.getSigningKey(header.kid, function(err, key) {
		var signingKey = key.publicKey || key.rsaPublicKey;
		callback(null, signingKey);
	});
}

var mg = require('mailgun-js')({apiKey: config.get('mailgun.apikey'), domain: config.get('mailgun.domain')});;
const url = require('url');

var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
if (config.get('debug')) app.use(require('morgan')('dev'));

var mongoose = require('mongoose');
if(config.get('debug')) {
	mongoose.set('debug', true, function (coll, method, query, doc) {
		console.log.debug('query executed:', coll, method, query, doc);
	});
}
mongoose.connect(config.get('database'), {useNewUrlParser: true, useUnifiedTopology: true});

var server = require('http').createServer(app);
var battleshipRouter = require('./battleship.js')(server);

router.get('/init', (req, res) => {
	User.findOne({ _id: config.get('masterUser._id') }, function (err, user) {
		if (err) throw err;
		if (user)
			return res.json({ success: false, message: 'User already initialized!' });
		var master = new User(config.get('masterUser'));
		master.save(err2 => {
			if (err2) throw err2;
			res.json({ success: true });
		});
	});
});

router.use(function (req, res, next) {
	if (req.params.user)
		req.params.user = req.params.user.toLowerCase();
	if (req.params.player)
		req.params.player = req.params.player.toLowerCase();
	if (req.body.email)
		req.body.email = req.body.email.toLowerCase();
	return next();
});

router.get('/oauthredirect', (req, res) => {
	res.redirect(url.format({
		pathname: 'https://accounts.google.com/o/oauth2/v2/auth',
		query: {
			"client_id": config.get('client_id'),
			"redirect_uri": config.get('url') + 'callback',
			"response_type": "id_token",
			"scope": "openid profile email",
//			"prompt": "consent",
			"nonce": nonce(32)
		}
	}));
})
router.get('/forceoauthredirect', (req, res) => {
	res.redirect(url.format({
		pathname: 'https://accounts.google.com/o/oauth2/v2/auth',
		query: {
			"client_id": config.get('client_id'),
			"redirect_uri": config.get('url') + 'callback',
			"response_type": "id_token",
			"scope": "openid profile email",
			"prompt": "consent",
			"nonce": nonce(32)
		}
	}));
})
// TODO: this should update last login
// TODO: If we save it, it'll weird out updatedOn. Maybe find a fix.
router.post('/authenticate', (req, res) => {
	if ( req.body.oauth ) { // FIXME options should verify nonce probably
		const opts = {
			audience: config.get('client_id')
		}
		jwt.verify(req.body.oauth, getKey, {}, function(err, decoded) {
			if (err) throw err;
			if (!decoded.email || !decoded.given_name || !decoded.family_name ) {
				return res.json({ success: false, message: "Weird token" });
			}
			const email = decoded.email.toLowerCase();
			User.findOne({ _id: email }, (err, user) => {
				if (!user) {
					user = new User({
						_id: email,
						firstName: decoded.given_name,
						lastName: decoded.family_name,
						supervisor: '',
						password: '', // need random string here probably
						parttime: false,
						admin: false,
						picture: decoded.picture || ''
					});
				} else {
					user.firstName = decoded.given_name;
					user.lastName = decoded.family_name;
					user.picture = decoded.picture || user.picture;
				}
				user.save(err2 => {
					if (err2) throw err2;
					return res.json({
						success: true, message: "Auth is good!",
						token: jwt.sign(
							{ email: email },
							config.get('jwtSecret'),
							{ algorithm: 'HS512', expiresIn: '30d' }
						),
						admin: user.admin
					});
				});
			});
		});
	} else User.findOne({ _id: req.body.email }, (err, user) => {
		if (err) throw err;
		if (!user)
			return res.status(404).json({ success: false, message: "User not found" });
		user.checkpass(req.body.password, (err2, ismatch) => {
			if (err2) throw err2;
			if (ismatch)
				return res.json({
					success: true, message: "Auth is good",
					token: jwt.sign({ email: req.body.email }, config.get('jwtSecret'),
					{ algorithm: 'HS512', expiresIn: '30d' }),
					admin: user.admin
				});
			return res.status(403).json({ success: false, message: "Password's not good" });
		});
	});
});

/**
 * @api {get} /users/:user Initiate request to create a user
 *
 * @apiParam {String} user Email address of the user to create.
 */
router.post('/users/:user', (req, res) => {
	User.findOne({ _id: req.params.user }, (err, user) => {
		if (err) throw err;
		if (user) return res.status(400).json({ success: false, message: "User already exists" });
		var newuser = new User({
			_id: req.params.user,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			supervisor: req.body.supervisor,
			password: req.body.password,
			parttime: req.body.parttime,
			admin: false
		});
		newuser.save(err2 => {
			if (err2) throw err2;
			res.json({
				success: true, message: "User created!",
				token: jwt.sign(
					{ email: req.params.user },
					config.get('jwtSecret'),
					{ algorithm: 'HS512', expiresIn: '30d' }
				),
				admin: false
			});
		});
	})
})

router.get('/users', (req, res) => {
	const filter = {};
	if (req.query.admin) filter['admin'] = true;
	User.find( filter, (err, users) => {
		if (err) throw err;
		res.json({ success: true, users: users });
	});
});

router.post('/users/:user/reset', (req, res) => {
	User.findOne({ _id: req.params.user }, (err, user) => {
		if (err) throw err;
		if (!(user))
			return res.status(404).json({ success: false, message: "User not found" });
		if (user.lastReset > (Date.now() - (1000*60*45))) // force 45 minutes between resets
			return res.status(403).json({ success: false, message: "A reset link was already sent recently"});
		const token = jwt.sign({ email: req.params.user }, config.get('jwtSecret'),
			{ algorithm: 'HS512', expiresIn: '60m' });
		mg.messages().send({
			from: config.get('mailgun.sender'),
			to: req.params.user,
			subject: "Password Reset for heisenberg.games",
			text: "You asked for a password reset.\n" +
			"Your password reset url is:\n" +
			config.get('url') + 'reset?token=' + token + "\n" +
			"This link is only good for 1 hour after being requested."
		}, (err, body) => {
			if (err) throw err;
			user.lastReset = Date.now();
			user.save(err2 => {
				if (err2) throw err2;
				return res.json({ success: true, message: "Reset email sent" });
			});
		});
	})
})

/* ***BEGIN AUTHORIZATION MIDDLEWARE*** */
router.use(function (req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) return jwt.verify(token, config.get('jwtSecret'), (err, decoded) => {
		if (err) return res.status(401).json({ success: false, message: 'Bad auth.' });
		req.auth = decoded;
		if (!req.auth.email) return res.status(401).json({ success: false, message: 'Auth first.' });
		User.findOne( { _id: req.auth.email }, (err, user) => {
			if (err) throw err;
			if (!user) return res.status(404).json({success: false, message: "User not found"});
			if (user.passwordChanged - 30000 > (req.auth.iat * 1000)) {
				return res.status(401).json({ success: false, message: 'Authorization expired' });
			}
			req.auth.admin = user.admin;
			return next();
		});
	});
	return res.status(401).json({ success: false, message: 'Auth first.' });
});
/* ***END AUTHORIZATION MIDDLEWARE*** */

// All subsequent routes are automatically denied without a confirmed token.

/* ***HELPER MIDDLEWARE*** */
const requireAdmin = function (req, res, next) {
	if (req.auth.admin)	return next();
	return res.status(403).json({ success: false, message: "Admin permissions required" });
}

router.route('/users/:user')
	.get( (req, res) => {
		User.findOne( { _id: req.params.user }, (err, user) => {
			if (err) throw err;
			if (!user) return res.status(404).json({success: false, message: "User not found"});
			return res.json({ success: true, user: user });
		});
	})
	.delete( requireAdmin, (req, res) => {
		User.remove({ _id: req.params.user }, err => {
			if (err) throw err;
			return res.json({success: true, message: "User deleted"});
		});
	})
	.patch( (req, res) => {
		if (!req.auth.admin && (req.auth.email !== req.params.user))
			return res.json({ success: false, message: "You're not allowed to change their settings." });
		if (!req.auth.admin && req.body.admin)
			return res.json({ success: false, message: "You can't make yourself an admin" })
		User.findOne({ _id: req.params.user }, (err, user) => {
			if (err) throw err;
			if (!user) return res.json({ success: false, message: "User doesn't exist" })
			if (req.body.password) user.password = req.body.password;
			if (req.body.firstName) user.firstName = req.body.firstName;
			if (req.body.lastName) user.lastName = req.body.lastName;
			if (req.body.supervisor) user.supervisor = req.body.supervisor;
			if ('parttime' in req.body) user.parttime = req.body.parttime;
			user.admin = req.body.admin;

			user.save(err2 => {
				if (err2) throw err2;
				return res.json({ success: true, message: "User modified!" });
			});
		});
	});

app.use('/api', router);
app.use('/api', battleshipRouter);

app.use('/', express.static('src/client/public'))
server.listen(config.get('port'), 'localhost');
