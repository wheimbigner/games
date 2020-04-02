import React from "react";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

import * as api from '../../api/api.js';
import RaisedButton from 'material-ui/RaisedButton';

export class OAuthForm extends React.Component {
    constructor(props) {
        super(props);
    };
    onLoginButtonClick(event) {
        event.preventDefault();
        window.location.href="/api/oauthredirect"
    }
    render() {
        return (<div><br /><br /><br />
            <RaisedButton label="Login with Google" primary={true} type="submit" onClick={this.onLoginButtonClick} />
            <br /><br /><br /><br />
            <Link to="/signin">or use legacy login</Link>
            </div>
        );
    }
}

export class OAuthCallback extends React.Component {
	constructor(props) {
        super(props);
        this.state = { message: 'Authorizing...' };
    }
    componentDidMount() {
        const params = new URLSearchParams(this.props.location.hash.substring(1));
        api.oauth(params.get('id_token'))
            .then(response => {
                if (response.data.success) {
                    Cookies.set('token', response.data.token, { expires: 7 });
                    this.props.history.push('/games');
                } else {
                    this.setState({ message: response.data.message });
                }
            })
            .catch(error => {
                this.setState({ message: error.response.data.message });
            });
    }

    render () {
        return (
            <p>{this.state.message}</p>
        );
    }
}