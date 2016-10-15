import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import * as boatApi from '../../../api/battleboats.js';
import * as api from '../../../api/api.js';

class EditBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			board: Array(10).fill(Array(10).fill(''))
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
		this.save = () => {
			const board = this.state.board.map(row => { return row.map(cell => { return (cell ? cell : 0); }) })
			boatApi.setShadowBoard(this.props.game, this.props.team, board)
				.then( (response) => { 
					if (response.data.success) {api.message("Board saved successfully!"); this.props.close()}
					else {api.message(response.data.message)}
				});
		}
		this.cellFocused = this.cellFocused.bind(this);
		this.keyPress = this.keyPress.bind(this);
	}
	componentWillMount() {
		boatApi.getShadowBoard(this.props.game, this.props.team)
			.then( (response) => {
				this.setState({board: response.data.board.map(row => { return row.map(cell => { return (cell ? cell : ''); }) })})
			})
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
			<div>
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
											<td style={{width: 23, height: 22}}>
												<input type="text" value={this.state.board[y][x]}
													onChange={this.onChange}
													onClick={this.cellFocus}
													onKeyDown={this.keyPress}
													style={{width: 23, height: 22, textAlign: 'center', fontSize: '1.2em'}}
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
				<div style={{textAlign: 'center', paddingTop: 10, display: 'flex'}}>
					<div style={{flex: '0 0 50%'}}><RaisedButton label="Save" primary={true} onClick={this.save} /></div>
					<div style={{flex: '0 0 50%'}}><FlatButton label="Cancel" primary={true} onClick={this.props.close} /></div>
				</div>
			</div>
		)
	}
}
EditBoard.propTypes = {
	game: React.PropTypes.string.isRequired,
	team: React.PropTypes.number.isRequired,
	close: React.PropTypes.func.isRequired
};

export default EditBoard;