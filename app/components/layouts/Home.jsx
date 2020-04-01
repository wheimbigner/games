import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

import Ackbar from '../containers/Ackbar.jsx';
import About from '../views/About.jsx';
import AuthError from '../views/AuthError.jsx';
import * as api from '../../api/api.js';

class Home extends React.Component {
	constructor(props) {
		super(props);
		const auth = (Cookies.get('token') ? jwt_decode(Cookies.get('token')) : false )
		this.state = { title: 'Sign in', drawerOpen: false, auth: auth }
		this.toggleDrawer = () => { this.setState({ drawerOpen: !this.state.drawerOpen }) }
		this.closeDrawer = () => { this.setState({ drawerOpen: false }); }
	}
	render() {
		return (
			<MuiThemeProvider>
				<div>
					<AppBar
						title={(
							<div style={{display: 'flex', justifyContent: 'space-between'}}>
								<div style={{flex: true}}>{this.props.title}</div>
								<div style={{flex: true}}>{this.props.email}&nbsp;&nbsp;</div>
							</div>
						)}
						onLeftIconButtonClick={this.toggleDrawer.bind(this)}
						iconElementRight={(<RaisedButton label='About / Feedback' onClick={() => {this.refs.about.open()}} />)}
					/>
					{this.props.children}
					<Drawer open={this.state.drawerOpen} docked={false} onRequestChange={(open) => this.setState({ drawerOpen: open }) }>
						<Link to="/games"><MenuItem onClick={() => { this.closeDrawer(); } }>Battleship games</MenuItem></Link>
						<Link to="/users"><MenuItem onClick={() => { this.closeDrawer(); } }>Users</MenuItem></Link>
						<Link to={'/users/' +  (this.state.auth.email ? this.state.auth.email : 'new')}>
							<MenuItem onClick={() => { this.closeDrawer(); } }>My Profile</MenuItem>
						</Link>
						<Link to="/"><MenuItem onClick={() => { api.logout(); this.closeDrawer(); } }>Log Out</MenuItem></Link>
					</Drawer>
					<About ref="about" />
					<AuthError ref="autherror" />
					<Ackbar />
				</div>
			</MuiThemeProvider>
		);
	}
}
Home.propTypes = {
	children: PropTypes.array.isRequired
}
const mapStateToProps = function (store) {
    return {
		email: store.api.email,
		admin: store.api.admin,
		title: store.api.title
	}
}
export default connect(mapStateToProps)(Home);
