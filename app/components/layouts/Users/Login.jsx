import React from 'react';
import PropTypes from 'prop-types';

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
						Cookies.set('token', response.data.token, { expires: 7 });
						this.context.router.push('/games');
					} else {
						this.setState({ message: response.data.message });
					}
				})
				.catch(error => {
					this.setState({ message: error.response.data.message });
				});
			e.preventDefault();
			return false;
		}
		this.onClick_reset = this.onClick_reset.bind(this);
	}
	onClick_reset() {
		api.reset(this.state.email)
			.then(response => {
				if (response.data.success) {
					this.setState({ message: 'Password reset sent, check your junk folder' });
				} else {
					this.setState({ message: 'Something went catastrophically wrong' });
				}
			})
			.catch(error => {
				this.setState({ message: error.response.data.message });
			});
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
				{this.state.message ? (
				<div style={{ color: 'red', fontWeight: 'bold', margin: 10 }}>
					<div>{this.state.message}</div>
					<FlatButton label="Reset password" secondary={true} onClick={this.onClick_reset} />
				</div>
				):null}
			</form>
		);
	}
}
SigninForm.contextTypes = {
    router: PropTypes.object.isRequired
}

export default SigninForm;