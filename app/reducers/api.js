import * as types from '../actions/action-types.js';
import _ from 'lodash';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

const tokencookie = Cookies.get('token');

const initialState = {
    baseurl: '/api',
    token: tokencookie,
    admin: tokencookie ? jwt_decode(tokencookie).admin : false,
    message: ''
};

const apiReducer = function (state = initialState, action) {
    switch (action.type) {
        case types.AUTH_SUCCESS:
            Cookies.set('token', action.token);
            return Object.assign({}, state, {
                token: action.token,
                admin: jwt_decode(action.token).admin
            });
        case types.AUTH_LOGOUT:
            return Object.assign({}, state, {
                token: '',
                admin: false
            })
        case types.SNACKBAR_MESSAGE:
            return Object.assign({}, state, {
                message: action.message
            });
        default:
            return state;
    }
}

export default apiReducer;
