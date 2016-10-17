var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var TeamPlayer = new Schema({
    _id: {
        type: String,
        ref: 'User'
    },
    captain: {
        type: Boolean,
        default: false
    },
    shots: {
        type: Number,
        min: 0,
        default: 0
    },
    nukes: {
        type: Number,
        min: 0,
        default: 0
    },
});

var Ship = new Schema({
        slots: {
            type: Number,
            min: 2,
            max: 5,
            required: true
        },
        wounded: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
});

var Ships = new Schema({
    destroyer: {
        type: Ship,
        default: {slots: 2}
    },
    submarine: {
        type: Ship,
        default: {slots: 3}
    },
    cruiser: {
        type: Ship,
        default: {slots: 3}
    },
    battleship: {
        type: Ship,
        default: {slots: 4}
    },
    carrier: {
        type: Ship,
        default: {slots: 5}
    }
});

var Team = new Schema({
    name: { type: String, default: "Untitled team" },
    board: {
        type: Schema.Types.Array,
        default: Array(10).fill(Array(10).fill(0))
    },
    ships: { type: Ships, default: {} },
    shadowboard: {
        type: Schema.Types.Array,
        default: Array(10).fill(Array(10).fill(0))
    },
    players: [TeamPlayer]
});

module.exports = mongoose.model('Battleship', new Schema({
	creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, default: "Untitled game" },
    started: { type: Boolean, default: false },
    finished: { type: Boolean, default: false },
    desc: { type: String, default: '' },
    team1: { 
        type: Team,
        default: {
            board: Array(10).fill(Array(10).fill(0)),
            shadowboard: Array(10).fill(Array(10).fill(0)),
            players: []            
        } 
    },
    team2: { 
        type: Team,
        default: {
            board: Array(10).fill(Array(10).fill(0)),
            shadowboard: Array(10).fill(Array(10).fill(0)),
            players: []            
        } 
    }
},{
    timestamps: true
}));