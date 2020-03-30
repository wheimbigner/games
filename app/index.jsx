import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin'; // Needed for onTouchTap, http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

import { Provider } from 'react-redux';

import router from './router.jsx';
import store from './store.js';

import './index.css';

ReactDOM.render(
	<Provider store={store}>{router}</Provider>, document.getElementById('root'));
