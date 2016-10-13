var config = require('config');
var User = require('./models/users');
var Battleship = require('./models/battleship');

var jwt = require('jsonwebtoken');

// var mailgun = require('mailgun');
// var mg = new mailgun.Mailgun(config.get('mailgun.apikey'));

var express = require('express');        // call express
var app = express();                 // define our app using express
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
mongoose.connect(config.get('database'));

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

// TODO: this should update last login
// TODO: If we save it, it'll weird out updatedOn. Maybe find a fix.
router.post('/authenticate', (req, res) => {
	User.findOne({ _id: req.body.email.toLowerCase() }, (err, user) => {
		if (err) throw err;
		if (!user)
			return res.status(404).json({ success: false, message: "User not found" });
		user.checkpass(req.body.password, (err2, ismatch) => {
			if (err2) throw err2;
			if (ismatch)
				return res.json({
					success: true, message: "Auth is good",
					token: jwt.sign({ email: req.body.email.toLowerCase(), admin: user.admin }, config.get('jwtSecret'), {})
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
	User.findOne({ _id: req.params.user.toLowerCase() }, (err, user) => {
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
				token: jwt.sign({ email: req.params.user.toLowerCase(), admin: false }, config.get('jwtSecret'), {})
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

/*
Not yet ready for implementation
router.post('/users/:user/reset', (req, res) => {
	User.findOne({ _id: req.params.user }, (err, user) => {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: "User not found" });
		} else {
			const token = jwt.sign({ email: req.params.user.toLowerCase(), admin: user.admin }, config.get('jwtSecret'), {});
			mg.sendText(config.get('mailgun.sender'), req.params.user, "Reset your password",
				"Yes hello\n" +
				"You asked for a password reset.\n" +
				"Your password reset token is:\n" +
				token);
		}
	})
})
*/

/* ***BEGIN AUTHORIZATION MIDDLEWARE*** */
router.use(function (req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) return jwt.verify(token, config.get('jwtSecret'), (err, decoded) => {
		if (err) return res.status(403).json({ success: false, message: 'Bad auth.' });
		req.auth = decoded;
		return next();
	});
	return res.status(403).json({ success: false, message: 'Auth first.' });
});
/* ***END AUTHORIZATION MIDDLEWARE*** */

// All subsequent routes are automatically denied without a confirmed token.

/* ***HELPER MIDDLEWARE*** */
const requireAdmin = function (req, res, next) {
	if (req.auth.admin)	return next();
	return res.status(403).json({ success: false, message: "Admin permissions required" });
}

const _getgame = function(req, res, next, pop) {
	if (!req.params.id)
		return res.status(404).json({ success: false, message: "No id specified!" });
	Battleship.findOne({ _id: req.params.id }).populate(pop).exec(function (err, game) {
		if ((err instanceof mongoose.CastError) || !game) {
			return res.status(404).json({ success: false, message: "Invalid id!" });
		} else if (err)
			throw err;

		req.game = game;
// changing this so that anyone has view-access to all games, because why not?		
//		if ( req.auth.admin || game.team1.players.id(req.auth.email) || game.team2.players.id(req.auth.email)	)
		next();
//		return res.status(403).json({ success: false, message: "Authorization failed in _getgame" });
	});
}
const getpropgame = function (req, res, next) { return _getgame(req, res, next, 'team1.players._id team2.players._id'); };
const getgame = function (req, res, next) {	return _getgame(req, res, next, ''); };

const getboard = function (req, res, next) {
	switch(parseInt(req.params.team, 10)) {
		case 1:
			req.gameboard = req.game.team1;
			req.otherboard = req.game.team2;
			return next();
		case 2:
			req.gameboard = req.game.team2;
			req.otherboard = req.game.team1;
			return next();
		default:
			return res.status(404).json({ success: false, message: "Bad team number" });
	}
}

const getplayer = function (req, res, next) {
	if (!req.params.player) return res.status(400).json({ success: false, message: "How did you find this?" });
	req.player = req.gameboard.players.id(req.params.player.toLowerCase());
	if (!req.player) return res.status(404).json({ success: false, message: "Couldn't find player" });
	next();
}

router.route('/users/:user')
	.get( (req, res) => {
		User.findOne( { _id: req.params.user.toLowerCase() }, (err, user) => {
			if (err) throw err;
			if (!user) return res.status(404).json({success: false, message: "User not found"});
			return res.json({ success: true, user: user });
		});
	})
	.delete( requireAdmin, (req, res) => {
		User.remove({ _id: req.params.user.toLowerCase() }, err => {
			if (err) throw err;
			return res.json({success: true, message: "User deleted"});
		});
	})
	.patch( (req, res) => {
		if (!req.auth.admin && (req.auth.email !== req.params.user.toLowerCase()))
			return res.json({ success: false, message: "You're not allowed to change their settings." });
		if (!req.auth.admin && req.body.admin)
			return res.json({ success: false, message: "You can't make yourself an admin" })
		User.findOne({ _id: req.params.user.toLowerCase() }, (err, user) => {
			if (err) throw err;
			if (!user) return res.json({ success: false, message: "User doesn't exist" })
			if (req.body.password) user.password = req.body.password;
			if (req.body.firstName) user.firstName = req.body.firstName;
			if (req.body.lastName) user.lastName = req.body.lastName;
			if (req.body.supervisor) user.supervisor = req.body.supervisor;
			if (req.body.admin !== false) user.admin = req.body.admin;

			user.save(err2 => {
				if (err2) throw err2;
				return res.json({ success: true, message: "User modified!" });
			});
		});
	});

router.get('/battleship', (req, res) => {
	Battleship.find({}, 'creator name started finished createdAt updatedAt', (err, games) => {
		if (err) throw err;
		res.json({ success: true, games: games });
	});	
});

router.post('/battleship', requireAdmin, (req, res) => {
	var newgame = new Battleship({ creator: req.auth.email });
	newgame.save((err) => {
		if (err) throw err;
		res.json({ success: true, id: newgame._id });
	});
});

router.route('/battleship/:id')
	.get(getpropgame, (req, res) => {
		const ret = { 
			creator: req.game.creator,
			name: req.game.name,
			started: req.game.started,
			finished: req.game.finished,
			team1: {
				name: req.game.team1.name,
				ships: req.game.team1.ships,
				board: req.game.team1.board,
				players: req.game.team1.players
			},
			team2: {
				name: req.game.team2.name,
				ships: req.game.team2.ships,
				board: req.game.team2.board,
				players: req.game.team2.players
			}
		};
		res.json({ success: true, data: ret });
	})
	.delete( requireAdmin, (req, res) => {
		Battleship.remove({ _id: req.params.id }, err => {
			if (err) throw err;
			return res.json({success: true, message: "Game deleted"});
		});
	})

router.route('/battleship/:id/name')
	.all( getgame )
	.get( (req, res) => {
		res.json({ success: true, name: req.game.name });
	})
	.put( requireAdmin, (req, res) => {
		req.game.name = req.body.name;
		req.game.save(err => {
			if (err) throw err;
			res.json({ success: true, name: req.game.name })
		});
	});

router.route('/battleship/:id/team/:team/player')
	.all( getpropgame, getboard )
	.get( (req, res) => {
		res.json({success: true, players: req.gameboard.players});
	});

router.route('/battleship/:id/team/:team/board')
	.all( getgame, getboard )
	.get( (req, res) => {
		res.json({success: true, team: req.params.team, board: req.gameboard.board});
	});

router.route('/battleship/:id/team/:team/ships')
	.all( getgame, getboard )
	.get( (req, res) => {
		res.json({success: true, ships: req.gameboard.ships});
	});

router.route('/battleship/:id/team/:team/player/:player')
	.all( requireAdmin, getgame, getboard )
	.post( (req, res) => {
		if (req.gameboard.players.id(req.params.player.toLowerCase()))
			return res.status(400).json({ success: false, message: "Player already exists" });
		req.gameboard.players.push({ _id: req.params.player.toLowerCase() });
		req.game.save(err => {
			if (err) throw err;
			return res.json({ success: true });
		});
	})
	.delete( (req, res) => {
		req.gameboard.players.id(req.params.player.toLowerCase()).remove();
		req.game.save(err => {
			if (err) throw err;
			res.json({ success: true, players: req.gameboard.players});
		});
	});

router.route('/battleship/:id/team/:team/player/:player/:weapon/:dir')
	.all(requireAdmin, getgame, getboard, getplayer)
	.patch( (req, res) => {
		if ((req.params.weapon !== 'shots') && (req.params.weapon !== 'nukes')) {
			res.json({ success: false, message: "Invalid weapon type specified" });
		} else if ((req.params.dir !== 'inc') && (req.params.dir !== 'dec')) {
			res.json({ success: false, message: "Invalid direction specified!" });
		} else {
			let direction = 1;
			if (req.params.dir === 'dec') { direction = -1; }
			req.player[req.params.weapon] = req.player[req.params.weapon] + direction;
			if (req.player[req.params.weapon] < 0)
				req.player[req.params.weapon] = 0;
			req.game.save(err => {
				if (err) throw err;
				res.json({ success: true, result: req.player[req.params.weapon] });
			});
		}
	});

function updateWounded(ships, shipint, direction) {
	switch(parseInt(shipint, 10)) {
		case 1:
			ships.destroyer.wounded += direction; break;
		case 2:
			ships.submarine.wounded += direction; break;
		case 3:
			ships.cruiser.wounded += direction; break;
		case 4:
			ships.battleship.wounded += direction; break;
		case 5:
			ships.carrier.wounded += direction; break;
		default:
	}
}

router.post('/battleship/:id/team/:team/fire/:x/:y', getgame, getboard,	(req, res) => {
		const x = req.params.x, y = req.params.y,
			player = req.gameboard.players.id(req.auth.email), shadowcell = req.otherboard.shadowboard[y][x];
		if ((x < 0) || (y < 0) || (x > 9) || (y > 9))
			return res.json({ success: false, message: "That's outside of the board!" })
		if (!req.auth.admin) {
			if (!player) return res.json({ success: false, message: "You're not the opposing team!" });
			if (player.shots) player.shots--;
			else return res.json({ success: false, message: "You doesn't have any shots" });
			if (req.gameboard.board[y][x])
				return res.json({ success: false, message: "Your team has already fired there!" });
		}
		if (req.gameboard.board[y][x]) {
			req.gameboard.board[y][x] = 0;
			updateWounded(req.gameboard.ships, shadowcell, -1)
		} else if (shadowcell) {
			req.gameboard.board[y][x] = shadowcell;
			updateWounded(req.gameboard.ships, shadowcell, 1)
		} else {
			req.gameboard.board[y][x] = 6;
		}
		req.game.markModified('team1.board');
		req.game.markModified('team2.board');
		req.game.save(err => {
			if (err) throw err; 
			res.json({ success: true, hit: req.gameboard.board[y][x], ship: shadowcell });
		})
	}
)

function validateShipPlacement(board) {
	// HAPPY DEBUGGING BEST OF LUCK
	// This function is not perfect. It will validate, e.g.:
	// 50555
	// 50000
	const shipcount = Array(5).fill(0);
	for (let i=1; i <= 5; i++) {
		let foundship = 0;
		for (let y = 0; (y < 10) && !foundship; y++) {
			for (let x = 0; (x < 10) && !foundship; x++) {
				if (board[y][x] === i) foundship = board[y][x];
				for (let c = (foundship > 2) ? foundship - 1 : foundship; (c >= 0) && foundship; c--) {
					if ((board[y][x+c] !== foundship) && ((board[y+c]) && (board[y+c][x] !== foundship))) return false;
					shipcount[i-1]++;
				}
				
			}
		}
	}
	return ( shipcount.join(',') === [2, 3, 3, 4, 5].join(',') );
}

router.route('/battleship/:id/team/:team/shadowboard')
	.all(requireAdmin, getgame, getboard)
	.get( (req, res) => {
		res.json({success: true, board: req.gameboard.shadowboard});
	})
	.put( (req, res) => {
		for (let y = 0; y < 10; y++) {
			for (let x = 0; x < 10; x++) {
				req.body.board[y][x] = parseInt(req.body.board[y][x], 10);
				if (req.otherboard.board[y][x])
					return res.json({ success: false, message: "Can't update the shadowboard for a board that has shots!"}); 
			}
		}
		if ( !validateShipPlacement(req.body.board) )
			return res.json({success: false, message: "Board validation failed!"});
		req.gameboard.shadowboard = req.body.board
		req.game.save(err => {
			if (err) throw err;
			res.json({ success: true, message: "Board updated"});
		})
	})

router.route('/battleship/:id/team/:team/name')
	.all(getgame, getboard)
	.get( (req, res) => {
		res.json({success: true, name: req.gameboard.name });
	})
	.put( requireAdmin, (req, res) => {
		req.gameboard.name = req.body.name;
		req.game.save(err => {
			if (err) throw err;
			res.json({ success: true, name: req.gameboard.name });
		});
	});

app.use('/api', router);
app.use('/', express.static('src/client/public'))
app.listen(config.get('port'));