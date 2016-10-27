import React from 'react';
//import { connect } from 'react-redux';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import AutoComplete from 'material-ui/AutoComplete';

import * as api from '../../../api/api.js';
import * as boatApi from '../../../api/battleboats.js';

class EditPlayers extends React.Component {
    constructor(props) {
        super(props);
        this.state = { users: [], players: [], user: '' };
        this.selectedRows = [];
        this.userSelected = (user, index) => {
            if (index === -1)
                return false; // Don't accept just typing stuff in and pressing enter
            if (user.value)
                return this.setState({ user: user.value });
            this.setState({ user: user });
        }
        this.addPlayer = () => {
            if (!this.state.user) return false;
            boatApi.addPlayer(this.props.game, this.props.team, this.state.user)
                .then(response => {
                    if (response.data.success) this.setState({user: ''});
                })
        };
        this.deletePlayers = () => {
            this.selectedRows.forEach(curr => {
                boatApi.deletePlayer(
                    this.props.game, this.props.team,
                    this.props.players[curr]._id._id
                );
            });
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
    }
    render() {
        return (
            <div>
                <RaisedButton label="Close editor" primary={true} onClick={this.props.close} />
                <Paper style={{margin: 10, padding: 10}} zDepth={2}>
                    <AutoComplete floatingLabelText="Add player" hintText="type to search" dataSource={this.state.users}
                        filter={AutoComplete.fuzzyFilter} maxSearchResults={10} openOnFocus={false}
                        fullWidth={true} onNewRequest={this.userSelected} searchText={this.state.user} />
                    <RaisedButton label="Add player" primary={true} icon={<ContentAdd />} 
                        onClick={this.addPlayer} />
                </Paper>
                <Paper style={{margin: 10, padding: 10}} zDepth={2}>
                    <RaisedButton label="Delete player" secondary={true} icon={<ContentRemove />}
                        onClick={this.deletePlayers} />
                    <Table multiSelectable={false} onRowSelection={this.onSelect}>
                        <TableHeader displaySelectAll={false} adjustForCheckbox={true} enableSelectAll={false}>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                                <TableHeaderColumn>email</TableHeaderColumn>
                                <TableHeaderColumn>Part-time</TableHeaderColumn>
                                <TableHeaderColumn>Supervisor</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody deselectOnClickaway={false}>
                        {this.props.players.map((player, index) => { return (
                            <TableRow hoverable={false} key={index}>
                                <TableRowColumn>{player._id.firstName + ' ' + player._id.lastName}</TableRowColumn>
                                <TableRowColumn>{player._id._id}</TableRowColumn>
                                <TableRowColumn>{(player._id.parttime ? 'Yes' : 'No')}</TableRowColumn>
                                <TableRowColumn>{player._id.supervisor}</TableRowColumn>
                            </TableRow>
                        )})}
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        );
    }
}
EditPlayers.propTypes = {
    players: React.PropTypes.array.isRequired
};
export default EditPlayers;