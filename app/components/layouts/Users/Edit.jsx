import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import AutoComplete from 'material-ui/AutoComplete';

import * as api from '../../../api/api.js';

class EditUserForm extends React.Component {
	constructor(props) {
		super(props);
		// You know you're working with an ex-perl programmer when they spit out tons of awful oneliners like this
		this.onChange = (event) => {
			let newState = { message: '' };
			newState[event.target.name] = event.target.value;
			this.setState(newState);
		}
		this.onCheck = (event, checked) => {
			let newState = { message: '' };
			newState[event.target.name] = checked;
			this.setState(newState);
		}
		this.onClick_submit = () => {
			const userdata = {
				password: this.state.password, firstName: this.state.firstName, lastName: this.state.lastName,
				parttime: this.state.parttime, supervisor: this.state.supervisor, admin: this.state.admin
			}
			let userPromise;
			if (this.state.mode === 'edit') {
				userPromise = api.updateUser(this.state.email, userdata)
			} else {
				userPromise = api.addUser(this.state.email, userdata)
			}
			userPromise.then(response => {
				this.setState({ message: response.data.message, messageColor: (response.data.success ? 'green' : 'red') });
				if (response.data.success) this.setState({ mode: 'edit' });
			})
		}
		this.onClick_delete = () => {
			api.deleteUser(this.props.params.user)
				.then(response => {
					if (response.data.success) this.context.router.goBack();
					else this.setState({ message: response.data.message, messageColor: 'red' });
				})
		}
		this.state = {
			email: (this.props.params.user === 'new') ? '' : this.props.params.user,
			firstName: '', lastName: '', supervisor: '', parttime: false, admin: false, password: '',
			message: '', messageColor: 'green',
			mode: (this.props.location.query['new']) ? 'create' : 'edit',
			sups: []
		};
	}
	mapUsersForAutocomplete(users) {
		return users.map(sup => {
			return ({
				text: sup.firstName + ' ' + sup.lastName + ' <' + sup._id + '>',
				value: sup._id
			})
		})
	}
	componentWillMount() {
		this.setState({
			mode: (this.props.location.query['new']) ? 'create' : 'edit'
		})
		if (this.state.mode === 'edit') {
			api.getUser(this.props.params.user)
				.then(response => {
					this.setState({
						firstName: response.data.user.firstName,
						lastName: response.data.user.lastName,
//						parttime: response.data.user.parttime,
//						supervisor: response.data.user.supervisor,
						admin: response.data.user.admin
					})
				})
		}
		api.getUsers({ admin: true })
			.then(response => {
				this.setState({ sups: this.mapUsersForAutocomplete(response.data.users) })
			});
	}
	render() {
		return (
			<div>
				<TextField name="email"
					floatingLabelText="Email address" hintText="william@heimbigner.email"
					value={(this.state.email)} onChange={this.onChange} disabled={(this.state.mode === 'edit')} />
				{(this.props.admin && (this.state.mode === 'edit')) ? (
					<FlatButton label="DELETE USER" onClick={this.onClick_delete} secondary={true} />
				) : ''}
				<br />
				<TextField name="firstName"
					floatingLabelText="First Name" hintText="John"
					onChange={this.onChange} value={this.state.firstName} />
				<TextField name="lastName"
					floatingLabelText="Last Name" hintText="Doe"
					onChange={this.onChange} value={this.state.lastName} /><br />
{ /*				<Checkbox label="Part-time" name="parttime" onCheck={this.onCheck} checked={this.state.parttime} />
				<AutoComplete floatingLabelText="Supervisor" hintText="type to search" dataSource={this.state.sups}
					filter={AutoComplete.fuzzyFilter} maxSearchResults={10} openOnFocus={false}
					fullWidth={true} searchText={this.state.supervisor}
					onUpdateInput={input => { this.setState({ supervisor: input}) }}
				onNewRequest={sup => { this.setState({ supervisor: (sup.value ? sup.value : sup) }); } } /> */ }
				{this.props.admin ? (
					<Checkbox label="Administrator" name="admin" onCheck={this.onCheck} checked={this.state.admin} />
				) : (<br />)}
				<TextField hintText="" floatingLabelText="Password" type="password" name="password" onChange={this.onChange} /><br />
				<p>There are no password requirements - don't use an important password here.</p>
				<RaisedButton label="Save" primary={true} onClick={this.onClick_submit} />
				<span style={{ color: this.state.messageColor, fontWeight: 'bold', marginLeft: 10 }}>{this.state.message}</span>
			</div>
		);
	}
}
EditUserForm.propTypes = {
	params: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
	admin: PropTypes.bool.isRequired
}
EditUserForm.contextTypes = {
	router: PropTypes.object.isRequired
}
const mapStateToProps = function (store) {
    return {
        admin: store.api.admin
    };
};
export default connect(mapStateToProps)(EditUserForm);
