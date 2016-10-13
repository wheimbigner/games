import axios from 'axios';
import store from '../store.js';
import {
    getGameSuccess,
    getPlayerListSuccess,
    getTeamNameSuccess, setTeamNameSuccess,
    getGridSuccess,
    getShipsSuccess,
    fireSuccess,
    shotsChanged,
    getGameNameSuccess, setGameNameSuccess,
    getGameDescSuccess, setGameDescSuccess,
    getShadowBoardSuccess, setShadowBoardSuccess
} from '../actions/battleboats.js';

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

export function getGame(game) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game, config)
        .then(response => { store.dispatch(getGameSuccess(response.data.data)); return response; });
}

export function deleteGame(game) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.delete(api.baseurl + '/battleship/' + game, config)    
}

export function getGrid(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/board', config)
        .then(response => { store.dispatch(getGridSuccess(team, response.data.board)); return response; });
}

export function getShips(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token} };
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/ships', config)
        .then(response => {store.dispatch(getShipsSuccess(team, response.data.ships)); return response; });
}

export function fire(game, team, x, y) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/battleship/' + game + '/team/' + team + '/fire/' + x + '/' + y, {}, config)
        .then(response => {
            if (response.data.success) store.dispatch(fireSuccess(team, x, y, response.data.hit));
            return response;
        }).then(function() {
            return Promise.all([
                getShips(game, team),
                getPlayerList(game, team)
            ]);
        })
}

export function changeShots(game, team, player, direction) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.patch(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player + '/shots/' + direction,
    {}, config)
        .then(response => {store.dispatch(shotsChanged(team, player, response.data.result)); return response});
}

export function getPlayerList(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/player', config)
        .then(response => {store.dispatch(getPlayerListSuccess(team, response.data.players)); return response});
}

// FIXME this should update the store's list of players
export function addPlayer(game, team, player) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.post(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player, {}, config)
}

// FIXME this should update the store's list of players
export function deletePlayer(game, team, player) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.delete(api.baseurl + '/battleship/' + game + '/team/' + team + '/player/' + player, config)
}

export function getGameName(game) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/name', config)
        .then(response => {store.dispatch(getGameNameSuccess(response.data.name)); return response});    
}

export function setGameName(game, name) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/name', { name }, config)
        .then(response => {store.dispatch(setGameNameSuccess(response.data.name)); return response});    
}

export function getGameDesc(game) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/desc', config)
        .then(response => {store.dispatch(getGameDescSuccess(response.data.desc)); return response});    
}

export function setGameDesc(game, desc) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/desc', { desc }, config)
        .then(response => {store.dispatch(setGameDescSuccess(response.data.desc)); return response});    
}

export function getTeamName(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/name', config)
        .then(response => {store.dispatch(getTeamNameSuccess(team, response.data.name)); return response});
}

export function setTeamName(game, team, name) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/team/' + team + '/name', {name}, config)
        .then(response => {store.dispatch(setTeamNameSuccess(team, response.data.name)); return response});
}

export function getShadowBoard(game, team) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.get(api.baseurl + '/battleship/' + game + '/team/' + team + '/shadowboard', config)
        .then(response => {store.dispatch(getShadowBoardSuccess(team, response.data.board)); return response;})
}

export function setShadowBoard(game, team, board) {
    const api = store.getState().api;
    const config = { headers: {'x-access-token': api.token}};
    return axios.put(api.baseurl + '/battleship/' + game + '/team/' + team + '/shadowboard', {board}, config);
}