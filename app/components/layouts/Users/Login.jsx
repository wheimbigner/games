import React from 'react';

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import Cookies from 'js-cookie';

import * as api from '../../../api/api.js';

class SigninForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { email: '', password: '', message: '' };
		this.onChange_email = event => { this.setState({ email: event.target.value, message: '' }) };
		this.onChange_password = event => { this.setState({ password: event.target.value, message: '' }) };
		this.onClick_signup = () => {
			this.context.router.push({
				pathname: '/users/' + (this.state.email ? this.state.email : 'new'),
				query: { new: true }
			});
		}
		this.onClick_login = (e) => {
			api.auth(this.state.email, this.state.password)
				.then(response => {
					if (response.data.success) {
						Cookies.set('token', response.data.token);
						this.context.router.push('/games');
					} else {
						api.message("Login failed");
					}
				})
				.catch(error => {
					this.setState({ message: error.response.data.message, messageColor: 'red' });
				});
			e.preventDefault();
			return false;
		}
	}
	componentWillMount() {
		api.title('Sign in');
	}
	render() {
		return (
			<form onSubmit={this.onClick_login} action="" >
				<TextField hintText="Email address" onChange={this.onChange_email} /><br />
				<TextField hintText="Password" onChange={this.onChange_password} type="password" /><br />
				<RaisedButton label="Login" primary={true} type="submit" onClick={this.onClick_login} />
				<FlatButton label="Sign up" primary={true} onClick={this.onClick_signup} />
				<div style={{ color: 'red', fontWeight: 'bold', margin: 10 }}>{this.state.message}</div>
			</form>
		);
	}
}
SigninForm.contextTypes = {
    router: React.PropTypes.object.isRequired
}

export default SigninForm;