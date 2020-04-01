import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class AuthError extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.open = () => { this.setState({open: true}) }
        this.close = () => { this.setState({open: false}) }
    }
    componentWillReceiveProps(newprops) {
        if (newprops.showautherror)
            this.setState({open: true});
    }
	render() {
        const actions = [
            (<FlatButton label="close" primary={true} keyboardFocused={true} onClick={this.close} />)
        ];
		return (
            <Dialog actions={actions} modal={false} autoScrollBodyContent={true} 
                open={this.state.open} onRequestClose={this.close}
                title='Authentication Error'>
                <p>
                    The server denied you access to whatever you tried to do.
                </p>
                <p>
                    This is almost always fixed by <Link to="/">signing in again</Link>
                </p>
            </Dialog>);
	}
}

const mapStateToProps = function (store) {
    return {
        showautherror: store.api.showautherror
    }
};

export default connect(mapStateToProps)(AuthError);