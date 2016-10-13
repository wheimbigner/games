import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

// Layouts
import Home from './components/layouts/Home.jsx';

// Pages
import UserListForm  from './components/layouts/Users.jsx';
import SigninForm    from './components/layouts/Users/Login.jsx';
import EditUserForm  from './components/layouts/Users/Edit.jsx';
import GameListForm  from './components/layouts/Games.jsx';
import Battleboats   from './components/layouts/battleboats/Home.jsx';
import ManagePlayers from './components/layouts/battleboats/EditPlayers.jsx';
import EditBoard     from './components/layouts/battleboats/EditBoard.jsx';

export default 	(
    <Router history={hashHistory}>
        <Route path="/" component={Home}>
            <IndexRoute component={SigninForm} />
            <Route path="/users" component={UserListForm} />
            <Route path="/users/:user" component={EditUserForm} />
            <Route path="/games" component={GameListForm} />
            <Route path="/games/:game" component={Battleboats} />
            <Route path="/games/:game/team/:team/players" component={ManagePlayers} />
            <Route path="/games/:game/team/:team/board" component={EditBoard} />
        </Route>
    </Router>
);