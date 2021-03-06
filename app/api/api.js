import axios from 'axios';
import store from '../store.js';
import {
    authSuccess,
    snackbar,
    updateTitle,
    _logout
} from '../actions/api.js';

export function message(_message) {
    store.dispatch(snackbar(_message));
}

export function title(_title) {
    store.dispatch(updateTitle(_title));
}

export function auth(email, password) {
    const api = store.getState().api;
    return axios.post(api.baseurl + '/authenticate', {email, password})
        .then(response => {
            store.dispatch(authSuccess(response.data.token, response.data.admin));
            return response;
        });
}

export function oauth(token) {
    const api = store.getState().api;
    return axios.post(api.baseurl + '/authenticate', {oauth: token})
        .then(response => {
            store.dispatch(authSuccess(response.data.token, response.data.admin));
            return response;
        });
}

export function reset(email) {
    const api = store.getState().api;
    return axios.post(api.baseurl + '/users/' + email + '/reset', {});
}

export function logout() {
    store.dispatch(_logout());
}

export function getUsers(params = {}) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/users' + (params.admin ? '?admin=true' : ''), config)    
}

export function getUser(user) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/users/' + user, config)    
}

export function addUser(user, data) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/users/' + user, data, config)
        .then(response => {
            if (!store.getState().api.token)
                store.dispatch(authSuccess(response.data.token, response.data.admin));
            return response;
        });
}

export function updateUser(user, data, token='') {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': (token ? token : api.token)}};
    return axios.patch(api.baseurl + '/users/' + user, data, config);   
}

export function deleteUser(user) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.delete(api.baseurl + '/users/' + user, config);    
}