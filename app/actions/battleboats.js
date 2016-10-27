import * as types from '../actions/action-types';

export function getGameSuccess(game) {
    return {
        type: types.GET_GAME_SUCCESS,
        game
    };
}

export function getShadowBoardSuccess(team, shadowboard) {
    return {
        type: types.GET_SHADOWBOARD_SUCCESS,
        shadowboard
    }
}
