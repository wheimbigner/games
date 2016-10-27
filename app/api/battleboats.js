import axios from 'axios';
import store from '../store.js';

export function createGame() {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/battleship', {}, config);        
}

export function getGames() {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship', config);    
}

export function deleteGame(game) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.delete(api.baseurl + '/battleship/' + game, config)    
}

export function fire(game, team, x, y) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/battleship/' + game + '/team/' + team + '/fire/' + x + '/' + y, {}, config);
}

export function changeShots(game, team, player, direction) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.patch(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player + '/shots/' + direction,
    {}, config);
}

export function addPlayer(game, team, player) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player, {}, config)
}

export function deletePlayer(game, team, player) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.delete(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player, config);
}

export function setGameName(game, name) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/name', { name }, config);
}

export function setGameDesc(game, desc) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/desc', { desc }, config);
}

export function setTeamName(game, team, name) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/team/' + team + '/name', {name}, config);
}

export function getShadowBoard(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/shadowboard', config);
}

export function setShadowBoard(game, team, board) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/team/' + team + '/shadowboard', {board}, config);
}