import React from 'react';
import { connect } from 'react-redux';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import AutoComplete from 'material-ui/AutoComplete';

import * as api from '../../../api/api.js';
import * as boatApi from '../../../api/battleboats.js';

function PlayerList(props) {
    return (
        <Table multiSelectable={true} onRowSelection={props.onRowSelection}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={true} enableSelectAll={false}>
                <TableRow>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>email</TableHeaderColumn>
                    <TableHeaderColumn>Part-time</TableHeaderColumn>
                    <TableHeaderColumn>Supervisor</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody deselectOnClickaway={false}>
            {props.players.map((player, index) => { return (
                <TableRow hoverable={false} key={index}>
                    <TableRowColumn>{player._id.firstName + ' ' + player._id.lastName}</TableRowColumn>
                    <TableRowColumn>{player._id._id}</TableRowColumn>
                    <TableRowColumn>{(player._id.parttime ? 'Yes' : 'No')}</TableRowColumn>
                    <TableRowColumn>{player._id.supervisor}</TableRowColumn>
                </TableRow>
            )})}
            </TableBody>
        </Table>
    )
}
PlayerList.propTypes = {
    players: React.PropTypes.array.isRequired,
    onRowSelection: React.PropTypes.func.isRequired
}

class ManagePlayers extends React.Component {
    constructor(props) {
        super(props);
        this.state = { users: [], players: [], user: '' };
        this.selectedRows = [];
        this.userSelected = user => {
            if (user.value)
                return this.setState({ user: user.value });
            this.setState({ user: user });
        }
        this.addPlayer = () => {
            if (!this.state.user) return false;
            boatApi.addPlayer(this.props.params.game, this.props.params.team, this.state.user)
                .then(response => {
                    if (response.data.success) {
                        this.setState({user: ''});
                        boatApi.getPlayerList(this.props.params.game, this.props.params.team);                        
                    }
                })
        };
        this.deletePlayers = () => {
            const DeletionPromise = [];
            this.selectedRows.forEach((curr) => {
                DeletionPromise.push(boatApi.deletePlayer(
                    this.props.params.game, this.props.params.team,
                    this.props.players[this.props.params.team-1][curr]._id._id
                ));
            });
            Promise.all(DeletionPromise).then(() => {boatApi.getPlayerList(this.props.params.game, this.props.params.team);})
        };
        this.onSelect = (id) => {
            this.selectedRows = id;
        }
    }
	mapUsersForAutocomplete(users) {
		return users.map(user => {
			return ({
                text: user.firstName + ' ' + user.lastName + ' <' + user._id + '>',
                value: user._id
			})
		})
	}
    componentWillMount() {
		api.getUsers({ admin: false })
			.then(response => {
				this.setState({ users: this.mapUsersForAutocomplete(response.data.users) })
			});
        boatApi.getPlayerList(this.props.params.game, this.props.params.team);
    }
    render() {
        return (
            <Paper style={{margin: 10, padding: 10}} zDepth={1}>
                <h1>Players for team {this.props.params.team}</h1>
                <Paper style={{margin: 10, padding: 10}} zDepth={2}>
                    <AutoComplete floatingLabelText="Add player" hintText="type to search" dataSource={this.state.users}
                        filter={AutoComplete.fuzzyFilter} maxSearchResults={10} openOnFocus={false}
                        fullWidth={true} onNewRequest={this.userSelected} searchText={this.state.user} />
                    <RaisedButton label="Add player" primary={true} icon={<ContentAdd />} 
                        onClick={this.addPlayer} />
                </Paper>
                <Paper style={{margin: 10, padding: 10}} zDepth={2}>
                    <RaisedButton label="Delete selected players" secondary={true} icon={<ContentRemove />}
                        onClick={this.deletePlayers} />
                    <PlayerList players={this.props.players[this.props.params.team - 1]} onRowSelection={this.onSelect} />
                </Paper>
            </Paper>
        );
    }
}
ManagePlayers.propTypes = {
    params: React.PropTypes.object.isRequired,
    players: React.PropTypes.array.isRequired
};

const mapStateToProps = function (store) {
    return {
        message: store.api.message,
        players: [store.battleboatState.team1.players, store.battleboatState.team2.players],        
    }
};

export default connect(mapStateToProps)(ManagePlayers);