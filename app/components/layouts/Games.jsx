import React from 'react';

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
		boatApi.createGame().then(response => {	this.context.router.push('/games/' + response.data.id);	})
	}
	onSelect(id) {
		if (id.length) this.context.router.push('/games/' + this.state.games[id[0]]._id);
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
				<RaisedButton label="New Game" onClick={this.newGame} primary={true} />
				<Table onRowSelection={this.onSelect}>
					<TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
						<TableRow selectable={false}>
							<TableHeaderColumn>Name</TableHeaderColumn>
							<TableHeaderColumn>Owner</TableHeaderColumn>
							<TableHeaderColumn>Started?</TableHeaderColumn>
							<TableHeaderColumn>Finished?</TableHeaderColumn>
							<TableHeaderColumn>createdAt</TableHeaderColumn>
							<TableHeaderColumn>updatedAt</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody displayRowCheckbox={false}>
						{this.state.games.map((game, index) => (
							<TableRow key={index} selectable={true} hoverable={true}>
								<TableRowColumn>{game.name}</TableRowColumn>
								<TableRowColumn>{game.creator}</TableRowColumn>
								<TableRowColumn>{(game.started ? 'Yes' : 'No') }</TableRowColumn>
								<TableRowColumn>{(game.finished ? 'Yes' : 'No') }</TableRowColumn>
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
}
GameListForm.contextTypes = {
    router: React.PropTypes.object.isRequired
}
export default GameListForm;