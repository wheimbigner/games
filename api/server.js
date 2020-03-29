var config = require('config');
var User = require('./models/users');

var jwt = require('jsonwebtoken');

var mg = require('mailgun-js')({apiKey: config.get('mailgun.apikey'), domain: config.get('mailgun.domain')});;

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

// TODO: this should update last login
// TODO: If we save it, it'll weird out updatedOn. Maybe find a fix.
router.post('/authenticate', (req, res) => {
	User.findOne({ _id: req.body.email }, (err, user) => {
		if (err) throw err;
		if (!user)
			return res.status(404).json({ success: false, message: "User not found" });
		user.checkpass(req.body.password, (err2, ismatch) => {
			if (err2) throw err2;
			if (ismatch)
				return res.json({
					success: true, message: "Auth is good",
					token: jwt.sign({ email: req.body.email, admin: user.admin }, config.get('jwtSecret'),
					{ algorithm: 'HS512', expiresIn: '7d' })
				});
			res.status(403).json({ success: false, message: "Password's not good" });
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
				token: jwt.sign({ email: req.params.user, admin: false }, config.get('jwtSecret'),
					{ algorithm: 'HS512', expiresIn: '7d' }
				)
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
			config.get('url') + '#/reset?token=' + token + "\n" +
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
		return next();
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
