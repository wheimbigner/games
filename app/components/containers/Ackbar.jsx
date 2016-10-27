import React from 'react';
import { connect } from 'react-redux';

import Snackbar from 'material-ui/Snackbar';

class Ackbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false, message: props.message };
        this.close = () => {
            this.setState({open: false})
        }
    }
    componentWillReceiveProps(newprops) {
        if (newprops.message && (this.state.message !== newprops.message))
            this.setState({open: true, message: newprops.message});
    }
    render() {
        return (
            <Snackbar
                open={this.state.open}
                message={this.state.message}
                autoHideDuration={5000}
                onRequestClose={this.close}
            />
        )
    }
}

const mapStateToProps = function (store) {
    return {
        message: store.api.message
    }
};

export default connect(mapStateToProps)(Ackbar);