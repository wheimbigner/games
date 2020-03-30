import * as types from '../actions/action-types';

export function authSuccess(token, admin) {
    return {
        type: types.AUTH_SUCCESS,
        token,
        admin
    };
}
export function _logout() {
    return {
        type: types.AUTH_LOGOUT
    };
}
export function snackbar(message) {
    return {
        type: types.SNACKBAR_MESSAGE,
        message
    }
}
export function updateTitle(title) {
    return {
        type: types.UPDATE_TITLE,
        title
    }
}