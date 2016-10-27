var Battleship = require('./models/battleship');

var express = require('express');
var mongoose = require('mongoose');
var config = require('config');
var jwt = require('jsonwebtoken');

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
        next();
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
    req.player = req.gameboard.players.id(req.params.player);
    if (!req.player) return res.status(404).json({ success: false, message: "Couldn't find player" });
    next();
}

function findAndEmit(socket, id) {
    // Unless there's a cleaner way... I know we have the doc in hand but doc.populate('blah').exec doesn't work
    Battleship.findOne({ _id: id }).populate('team1.players._id team2.players._id').exec( (err, game) => {
        if (err) throw err;
        const ret = { 
            creator: game.creator,
            name: game.name,
            started: game.started,
            finished: game.finished,
            desc: game.desc,
            team1: {
                name: game.team1.name,
                ships: game.team1.ships,
                board: game.team1.board,
                players: game.team1.players
            },
            team2: {
                name: game.team2.name,
                ships: game.team2.ships,
                board: game.team2.board,
                players: game.team2.players
            }
        };
        socket.emit('update', ret);
    })    
}
function init(server) {
    var router = express.Router();

    var io = require('socket.io')(server);
    io.on('connection', function(socket) {
        socket.emit('status', {connected: 'connected'});
    })
    Battleship.find({}, (err, games) => {
        if (err) throw err;
        games.forEach(game => {
            io.of('/battleship/' + game._id).on('connection', function(socket) {
                findAndEmit(socket, game._id);
            });
        });
    })
    Battleship.schema.post('save', function(doc) {
        findAndEmit(io.of('/battleship/' + doc._id), doc._id);
    })

    router.use(function (req, res, next) {
        if (req.params.user)
            req.params.user = req.params.user.toLowerCase();
        if (req.params.player)
            req.params.player = req.params.player.toLowerCase();
        if (req.body.email)
            req.body.email = req.body.email.toLowerCase();
        return next();
    });

    router.use(function (req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) return jwt.verify(token, config.get('jwtSecret'), (err, decoded) => {
            if (err) return res.status(401).json({ success: false, message: 'Bad auth.' });
            req.auth = decoded;
            return next();
        });
        return res.status(401).json({ success: false, message: 'Auth first.' });
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
            io.of('/battleship/' + newgame._id).on('connection', function(socket) {
                findAndEmit(socket, newgame._id);
            });
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
                desc: req.game.desc,
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

    router.route('/battleship/:id/desc')
        .all( getgame )
        .get( (req, res) => {
            res.json({ success: true, name: req.game.desc });
        })
        .put( requireAdmin, (req, res) => {
            req.game.desc = req.body.desc;
            req.game.save(err => {
                if (err) throw err;
                res.json({ success: true, name: req.game.desc })
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
            if (req.gameboard.players.id(req.params.player))
                return res.status(400).json({ success: false, message: "Player already exists" });
            req.gameboard.players.push({ _id: req.params.player });
            req.game.save(err => {
                if (err) throw err;
                return res.json({ success: true });
            });
        })
        .delete( (req, res) => {
            req.gameboard.players.id(req.params.player).remove();
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
        for (let y = 0; (y < 10); y++) {
            for (let x = 0; (x < 10); x++) {
                if (board[y][x]) shipcount[board[y][x]-1]++;
            }
        }
        for (let i=1; i <= 5; i++) {
            let foundship = 0;
            for (let y = 0; (y < 10) && !foundship; y++) {
                for (let x = 0; (x < 10) && !foundship; x++) {
                    if (board[y][x] === i) foundship = board[y][x];
                    for (let c = (foundship > 2) ? foundship - 1 : foundship; (c >= 0) && foundship; c--) {
                        if ((board[y][x+c] !== foundship) && ((board[y+c]) && (board[y+c][x] !== foundship))) return false;
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
            if (req.game.started) {
                return res.json({ success: false, message: "Can't update the shadowboard for a game that's in progress!"});
            } 
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
    return router;
}

module.exports = init;