import React from 'react';
import { Link } from 'react-router';
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
						onLeftIconButtonTouchTap={this.toggleDrawer}
						iconElementRight={(<RaisedButton label='About / Feedback' onClick={() => {this.refs.about.open()}} />)}
					/>
					{this.props.children}
					<Drawer open={this.state.drawerOpen} docked={false} onRequestChange={(open) => this.setState({ drawerOpen: open }) }>
						<Link to="/games"><MenuItem onTouchTap={() => { this.closeDrawer(); } }>Battleship games</MenuItem></Link>
						<Link to="/users"><MenuItem onTouchTap={() => { this.closeDrawer(); } }>Users</MenuItem></Link>
						<Link to={'/users/' +  (this.state.auth.email ? this.state.auth.email : 'new')}>
							<MenuItem onTouchTap={() => { this.closeDrawer(); } }>My Profile</MenuItem>
						</Link>
					</Drawer>
					<About ref="about" />
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
const mapStateToProps = function (store) {
    return {
		email: store.api.email,
		admin: store.api.admin,
		title: store.api.title
	}
}
export default connect(mapStateToProps)(Home);