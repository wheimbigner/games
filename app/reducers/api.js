import * as types from '../actions/action-types.js';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

const tokencookie = Cookies.get('token');

const initialState = {
    baseurl: '/api',
    token: tokencookie,
    title: 'Games!',
    email: tokencookie ? jwt_decode(tokencookie).email : '',
    admin: tokencookie ? jwt_decode(tokencookie).admin : false,
    message: ''
};

const apiReducer = function (state = initialState, action) {
    switch (action.type) {
        case types.UPDATE_TITLE:
            return Object.assign({}, state, {title: action.title});
        case types.AUTH_SUCCESS:
            Cookies.set('token', action.token);
            return Object.assign({}, state, {
                token: action.token,
                email: jwt_decode(action.token).email,
                admin: jwt_decode(action.token).admin
            });
        case types.AUTH_LOGOUT:
            Cookies.remove('token');
            return Object.assign({}, state, {
                token: '',
                admin: false,
                email: ''
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
