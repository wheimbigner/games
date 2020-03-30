import React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import License from './License.jsx';

export default class About extends React.Component {
    constructor(props) {
        super(props);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.state = {open: false};
    }
    open() {
        this.setState({open: true});
    }
    close() {
        this.setState({open: false});
    }
	render() {
        const actions = [
            (<FlatButton label="view license" secondary={true} onClick={() => {this.close(); this.refs.license.open()}} />),
            (<FlatButton label="close" primary={true} keyboardFocused={true} onClick={this.close} />)
        ];
		return (<div>
            <License ref="license" />

            <Dialog actions={actions} modal={false} autoScrollBodyContent={true} 
                open={this.state.open} onRequestClose={this.close}
                title='About heisenberg.games'>
                <p>
                    heisenberg.games - Copyright &copy; 2020 William Heimbigner.&nbsp;
                    <a target="_blank" href="https://github.com/wheimbigner/games">Source code</a> 
                </p>
                <p>
                    Dedicated to every manager/supervisor/SCRUM master who I've caused to lose their sanity.
                </p>
                <p>
                    Questions? Comments? Concerns?
                    Contact William Heimbigner &lt;<a href="mailto:william.heimbigner@gmail.com">william.heimbigner@gmail.com</a>&gt;
                </p>
                <p>
                    This game was developed entirely on personal free time, is "free as in freedom", and is licensed under 
                    the <a target="_blank" href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU General Public License</a>
                </p>
                <blockquote>
                    The licenses for most software and other practical works are designed to take away your freedom to
                    share and change the works. By contrast, the GNU General Public License is intended to guarantee your freedom
                    to share and change all versions of a program&mdash;to make sure it remains free software for all its users.
                </blockquote>
            </Dialog>
		</div>);
	}
}
