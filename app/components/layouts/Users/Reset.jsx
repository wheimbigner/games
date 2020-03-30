import React from 'react';
import { connect } from 'react-redux';

import jwt_decode from 'jwt-decode';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import * as api from '../../../api/api.js';

class ResetPasswordForm extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = (event) => {
			let newState = { message: '' };
			newState[event.target.name] = event.target.value;
			this.setState(newState);
		}
		this.onClick_submit = () => {
			api.updateUser(this.state.email, {password: this.state.password}, this.state.token)
			    .then(response => {
                    if (response.data.success) {
						this.context.router.push('/');                        
                    }
				    this.setState({ message: response.data.message });
	    		})
		}
		this.state = {
			email: jwt_decode(this.props.location.query['token']).email, password: '', message: '',
            token: this.props.location.query['token']
		};
	}
	render() {
		return (
			<div>
				<TextField name="email"	floatingLabelText="Email address" value={(this.state.email)} disabled={true} /><br />
				<TextField floatingLabelText="Password" type="password" name="password" onChange={this.onChange} /><br />
				<p>There are no password requirements - don't use an important password here.</p>
				<RaisedButton label="Save" primary={true} onClick={this.onClick_submit} />
				<span style={{ color: 'red', fontWeight: 'bold', marginLeft: 10 }}>{this.state.message}</span>
			</div>
		);
	}
}
ResetPasswordForm.propTypes = {
	params: React.PropTypes.object.isRequired,
	location: React.PropTypes.object.isRequired,
}
ResetPasswordForm.contextTypes = {
	router: React.PropTypes.object.isRequired
}
const mapStateToProps = function (store) {
    return {
        admin: store.api.admin
    };
};
export default connect(mapStateToProps)(ResetPasswordForm);