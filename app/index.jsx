import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import App from './router.jsx';
import store from './store.js';

import './index.css';

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>, document.getElementById('root'));
