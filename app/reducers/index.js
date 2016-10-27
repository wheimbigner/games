import { combineReducers } from 'redux';

// Reducers
import apiReducer from './api.js';

// Combine Reducers
var reducers = combineReducers({
    api: apiReducer,
});

export default reducers;