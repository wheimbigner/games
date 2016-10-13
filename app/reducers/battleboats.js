import * as types from '../actions/action-types.js';
import _ from 'lodash';

const initialState = {
    name: '',
    team1: {
        name: '',
        players: [],
        board: Array(10).fill(Array(10).fill(0)),
        shadowboard: Array(10).fill(Array(10).fill(0)),
        ships: {
            carrier: { slots: 5, wounded: 0 },
            battleship: { slots: 4, wounded: 0 },
            cruiser: { slots: 3, wounded: 0 },
            submarine: { slots: 3, wounded: 0 },
            destroyer: { slots: 2, wounded: 0 },
        }        
    },
    team2: {
        name: '',
        players: [],
        board: Array(10).fill(Array(10).fill(0)),
        shadowboard: Array(10).fill(Array(10).fill(0)),
        ships: {
            carrier: { slots: 5, wounded: 0 },
            battleship: { slots: 4, wounded: 0 },
            cruiser: { slots: 3, wounded: 0 },
            submarine: { slots: 3, wounded: 0 },
            destroyer: { slots: 2, wounded: 0 },
        }
    }
};

const battleboatReducer = function (state = initialState, action) {

    const newState={};
    let team = 'team1';
    if (action.team === 2) {
        team = 'team2';
    }
    switch (action.type) {
        case types.GET_GAME_SUCCESS:
            return Object.assign({}, state, action.game);
        case types.GET_GAMENAME_SUCCESS:
        case types.SET_GAMENAME_SUCCESS:
            return Object.assign({}, state, {name: action.name});
        case types.SHOTS_CHANGED:
            var players = state[team].players;
            players[_.findIndex(players, function (o) { return o._id._id === action.player; })].shots = action.shots;
            newState[team] = {
                board: state[team].board,
                shadowboard: state[team].shadowboard,
                players: players,
                ships: state[team].ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        case types.GET_PLAYERLIST_SUCCESS:
            newState[team] = {
                board: state[team].board,
                shadowboard: state[team].shadowboard,
                players: action.players,
                ships: state[team].ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        case types.GET_TEAMNAME_SUCCESS:
        case types.SET_TEAMNAME_SUCCESS:
            newState[team] = {
                board: state[team].board,
                shadowboard: state[team].shadowboard,
                players: state[team].players,
                ships: state[team].ships,
                name: action.name
            }
            return Object.assign({}, state, newState)
        case types.GET_SHIPS_SUCCESS:
            newState[team] = {
                board: state[team].board,
                shadowboard: state[team].shadowboard,
                players: state[team].players,
                ships: action.ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        case types.FIRE_SUCCESS:
            var board = state[team].board;
            board[action.y][action.x] = action.hit;
            newState[team] = {
                board: board,
                shadowboard: state[team].shadowboard,
                players: state[team].players,
                ships: state[team].ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        case types.GET_GRID_SUCCESS:
            newState[team] = {
                board: action.board,
                shadowboard: state[team].shadowboard,
                players: state[team].players,
                ships: state[team].ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        case types.GET_SHADOWBOARD_SUCCESS:
        case types.SET_SHADOWBOARD_SUCCESS:
			var shadowboard = action.shadowboard.map(row => { return row.map(cell => { return (cell ? cell : ''); }) })
            newState[team] = {
                board: state[team].board,
                shadowboard: shadowboard,
                players: state[team].players,
                ships: state[team].ships,
                name: state[team].name
            }
            return Object.assign({}, state, newState)
        default:
            return state;
    }
}

export default battleboatReducer;