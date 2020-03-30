import * as types from '../actions/action-types.js';
import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';

const tokencookie = Cookies.get('token');
const admincookie = Cookies.get('admin');

const initialState = {
    baseurl: '/api',
    token: tokencookie,
    title: 'Games!',
    email: tokencookie ? jwt_decode(tokencookie).email : 'Not Logged In',
    admin: admincookie ? (admincookie == 'true') : false,
    message: ''
};

const apiReducer = function (state = initialState, action) {
    switch (action.type) {
        case types.UPDATE_TITLE:
            return Object.assign({}, state, {title: action.title});
        case types.AUTH_SUCCESS:
            Cookies.set('token', action.token, new Date(action.token.exp*1000));
            Cookies.set('admin', action.admin, new Date(action.token.exp*1000));
            return Object.assign({}, state, {
                token: action.token,
                email: jwt_decode(action.token).email,
                admin: action.admin
            });
        case types.AUTH_LOGOUT:
            Cookies.remove('token');
            Cookies.remove('admin');
            return Object.assign({}, state, {
                token: '',
                admin: false,
                email: 'Not Logged In'
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
