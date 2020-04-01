import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';

import * as boatApi from '../../api/battleboats.js';
import * as api from '../../api/api.js';

class GameListForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { games: [] };
		this.onSelect = this.onSelect.bind(this);
		this.newGame = this.newGame.bind(this);
	}
	newGame() {
		boatApi.createGame().then(response => {	this.props.history.push('/games/' + response.data.id);	})
	}
	onSelect(id) {
		if (id.length) this.props.history.push('/games/' + this.state.games[id[0]]._id);
	}
	componentWillMount() {
		boatApi.getGames()
			.then(response => {
				this.setState({ games: response.data.games });
			});
		api.title('Game list');
	}
	render() {
		return (
			<div>
				{this.props.admin ? 
				<RaisedButton label="New Game" onClick={this.newGame} primary={true} />
				: null }
				<Table onRowSelection={this.onSelect}>
					<TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
						<TableRow selectable={false}>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn>Owner</TableHeaderColumn>
{ /*							<TableHeaderColumn>Started?</TableHeaderColumn>
							<TableHeaderColumn>Finished?</TableHeaderColumn> */ }
							<TableHeaderColumn>createdAt</TableHeaderColumn>
							<TableHeaderColumn>updatedAt</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody displayRowCheckbox={false}>
						{this.state.games.map((game, index) => (
							<TableRow key={index} selectable={true} hoverable={true}>
								<TableRowColumn>{game.name}</TableRowColumn>
								<TableRowColumn>{game.creator}</TableRowColumn>
{ /*								<TableRowColumn>{(game.started ? 'Yes' : 'No') }</TableRowColumn>
								<TableRowColumn>{(game.finished ? 'Yes' : 'No') }</TableRowColumn> */ }
								<TableRowColumn>{game.createdAt}</TableRowColumn>
								<TableRowColumn>{game.updatedAt}</TableRowColumn>
							</TableRow>
						)) }
					</TableBody>
				</Table>
			</div>
		);
	}
}
GameListForm.propTypes = {
	history: PropTypes.object.isRequired
}
const mapStateToProps = function (store) {
    return {
		admin: store.api.admin,
	}
}
export default connect(mapStateToProps)(GameListForm);