import * as types from '../actions/action-types';

export function getGameSuccess(game) {
    return {
        type: types.GET_GAME_SUCCESS,
        game
    };
}

export function getPlayerListSuccess(team, players) {
    return {
        type: types.GET_PLAYERLIST_SUCCESS,
        team, players
    };
}

export function getTeamNameSuccess(team, name) {
    return {
        type: types.GET_TEAMNAME_SUCCESS,
        team, name
    };
}

export function setTeamNameSuccess(team, name) {
    return {
        type: types.SET_TEAMNAME_SUCCESS,
        team, name
    };
}

export function getGridSuccess(team, board) {
    return {
        type: types.GET_GRID_SUCCESS,
        team, board
    };
}

export function getShipsSuccess(team, ships) {
    return {
        type: types.GET_SHIPS_SUCCESS,
        team, ships
    };
}

export function fireSuccess(team, x, y, hit) {
    return {
        type: types.FIRE_SUCCESS,
        team, x, y, hit
    };
}

export function shotsChanged(team, player, shots) {
    return {
        type: types.SHOTS_CHANGED,
        team, player, shots
    };
}

export function getGameNameSuccess(name) {
    return {
        type: types.GET_GAMENAME_SUCCESS,
        name
    }
}

export function setGameNameSuccess(name) {
    return {
        type: types.SET_GAMENAME_SUCCESS,
        name
    }
}

export function getGameDescSuccess(desc) {
    return {
        type: types.GET_GAMEDESC_SUCCESS,
        desc
    }
}

export function setGameDescSuccess(desc) {
    return {
        type: types.SET_GAMEDESC_SUCCESS,
        desc
    }
}

export function getShadowBoardSuccess(team, shadowboard) {
    return {
        type: types.GET_SHADOWBOARD_SUCCESS,
        shadowboard
    }
}

export function setShadowBoardSuccess(team, shadowboard) {
    return {
        type: types.SET_SHADOWBOARD_SUCCESS,
        shadowboard
    }
}




