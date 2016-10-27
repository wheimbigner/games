import * as types from '../actions/action-types.js';
import _ from 'lodash';

const initialState = {
    name: '',
    desc: '',
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
        case types.GET_SHADOWBOARD_SUCCESS:
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