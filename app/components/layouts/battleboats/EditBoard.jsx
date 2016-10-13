import React from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import * as boatApi from '../../../api/battleboats.js';
import * as api from '../../../api/api.js';

class EditBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			board: Array(10).fill(Array(10).fill('')),
			teamname: '',
			focusedCell: { x: 0, y: 0 }
		}
		this.onChange = event => {
			let val = event.target.value;
			const board = this.state.board;
			val = val.substr(0, 1);
			if (val.match(/[^1-5]/))
				val = '';
			board[event.target.dataset.y][event.target.dataset.x] = val;
			this.setState({board: board});
			// We should call a callback function here, with this.props.x, this.props.y, this.state.value
		}
		this.nameChange = event => {
			this.setState({ teamname: event.target.value });
		}
		this.save = () => {
			const board = this.state.board.map(row => { return row.map(cell => { return (cell ? cell : 0); }) })
			Promise.all([
				boatApi.setShadowBoard(this.props.params.game, this.props.params.team, board),
				boatApi.setTeamName(this.props.params.game, this.props.params.team, this.state.teamname)
			]).then( () => { api.message("Board saved successfully!"); this.context.router.goBack()} );
		}
		this.cellFocused = this.cellFocused.bind(this);
		this.keyPress = this.keyPress.bind(this);
	}
	componentWillMount() {
		boatApi.getShadowBoard(this.props.params.game, this.props.params.team)
			.then( (response) => {
				this.setState({board: response.data.board.map(row => { return row.map(cell => { return (cell ? cell : ''); }) })})
			})
		boatApi.getTeamName(this.props.params.game, this.props.params.team)
			.then( (response) => { this.setState({teamname: response.data.name })});
	}
	cellFocused(event) {
		// setTimeout because chrome does very silly things
		setTimeout(() => {this.refs['x' + event.target.dataset.x + 'y' + event.target.dataset.y].select()}, 50)
	}
	keyPress(event) {
		const x = parseInt(event.target.dataset.x, 10);
		const y = parseInt(event.target.dataset.y, 10);
		let ref = '';
		switch(event.keyCode) {
			case 38: // up arrow
				ref = 'x' + x + 'y' + (y-1); break;
			case 40: // down arrow
				ref = 'x' + x + 'y' + (y+1); break;
			case 37: // left arrow
				ref = 'x' + (x-1) + 'y' + y; break;
			case 39: // right arrow
				ref = 'x' + (x+1) + 'y' + y; break;
			default:
				break;
		}
		if (ref && (this.refs[ref]))
			setTimeout(() => {this.refs[ref].select()}, 50);
	}
	render() {
		return (
			<Paper style={{margin: 10, padding: 10}} zDepth={1}>
				<Paper style={{margin: 10, padding: 10}} zDepth={2}>
					<TextField
						hintText="The Dark Night Always Triumphs!"
						floatingLabelText="Team name"
						fullWidth={true}
						onChange={this.nameChange}
						value={this.state.teamname} />
				</Paper>
				<Paper style={{margin: 10, padding: 10}} zDepth={2}>
					<table>
						<tbody>
							<tr>
								{['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((header,x) => {return(
									<th key={'topheader' + x}>{header}</th>
								)})}
							</tr>
							{this.state.board.map((row, y) => {return(
								<tr>
									<th key={'sideheader'+ y}>{''+(y+1)}</th>
									{
										row.map((cell, x) => {
											return (
												<td style={{width: 20, height: 20}}>
													<input type="text" value={this.state.board[y][x]}
														onChange={this.onChange}
														onClick={this.cellFocus}
														onKeyDown={this.keyPress}
														style={{width: 20, height: 20, textAlign: 'center', fontSize: '1.2em'}}
														data-x={x} data-y={y}
														ref={'x'+x+'y'+y} />
												</td>
											);
										})
									}
								</tr>
							)})}
						</tbody>
					</table>
				</Paper>
				<RaisedButton label="Save" primary={true} onClick={this.save} />
			</Paper>
		)
	}
}
EditBoard.propTypes = {
	params: React.PropTypes.object.isRequired
};
EditBoard.contextTypes = {
	location: React.PropTypes.object.isRequired,
	router: React.PropTypes.object.isRequired
};

export default EditBoard;