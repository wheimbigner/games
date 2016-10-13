import { combineReducers } from 'redux';

// Reducers
import apiReducer from './api.js';
import battleboatReducer from './battleboats.js';

// Combine Reducers
var reducers = combineReducers({
    api: apiReducer,
    battleboatState: battleboatReducer
});

export default reducers;