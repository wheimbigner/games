import * as types from '../actions/action-types';

export function authSuccess(token) {
    return {
        type: types.AUTH_SUCCESS,
        token
    };
}
export function snackbar(message) {
    return {
        type: types.SNACKBAR_MESSAGE,
        message
    }
}