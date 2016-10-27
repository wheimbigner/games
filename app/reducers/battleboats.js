import * as types from '../actions/action-types.js';

const initialState = {
    name: '',
    desc: '',
    team1: {
        name: '',
        players: [],
        board: Array(10).fill(Array(10).fill(0)),
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
    switch (action.type) {
        case types.GET_GAME_SUCCESS:
            return Object.assign({}, state, action.game);
        default:
            return state;
    }
}

export default battleboatReducer;