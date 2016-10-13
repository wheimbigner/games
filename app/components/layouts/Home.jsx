import React from 'react';
import { Link } from 'react-router';

import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import Ackbar from '../containers/Ackbar.jsx';

export default class Home extends React.Component {
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
					<AppBar title="Games!" onLeftIconButtonTouchTap={this.toggleDrawer} />
					{this.props.children}
					<Drawer open={this.state.drawerOpen} docked={false} onRequestChange={(open) => this.setState({ drawerOpen: open }) }>
						<Link to="/games"><MenuItem onTouchTap={() => { this.closeDrawer(); } }>Battleship games</MenuItem></Link>
						<Link to="/users"><MenuItem onTouchTap={() => { this.closeDrawer(); } }>Users</MenuItem></Link>
						<Link to={'/users/' +  (this.state.auth.email ? this.state.auth.email : 'new')}>
							<MenuItem onTouchTap={() => { this.closeDrawer(); } }>My Profile</MenuItem>
						</Link>
					</Drawer>
					<Ackbar />
				</div>
			</MuiThemeProvider>
		);
	}
}
Home.propTypes = {
	children: React.PropTypes.element.isRequired
}
Home.contextTypes = {
    router: React.PropTypes.object.isRequired
}