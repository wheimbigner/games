import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Layouts
import Home from './components/layouts/Home.jsx';

// Pages
import UserListForm  from './components/layouts/Users.jsx';
import SigninForm    from './components/layouts/Users/Login.jsx';
import EditUserForm  from './components/layouts/Users/Edit.jsx';
import ResetPasswordForm  from './components/layouts/Users/Reset.jsx';
import GameListForm  from './components/layouts/Games.jsx';
import Battleboats   from './components/layouts/battleboats/Home.jsx';
import { OAuthForm, OAuthCallback } from './components/layouts/OAuth.jsx';

export default class extends React.Component {
    render () {
        return (
            <Router>
                <Home>
                    <Route path="/" exact component={OAuthForm} />
                    <Route path="/signin" component={SigninForm} />
                    <Route path="/users" exact component={UserListForm} />
                    <Route path="/users/:user" component={EditUserForm} />
                    <Route path="/reset" component={ResetPasswordForm} />
                    <Route path="/games" exact component={GameListForm} />
                    <Route path="/games/:game" component={Battleboats} />
                    <Route path="/callback" component={OAuthCallback} />
                </Home>
            </Router>
        );
    }
};