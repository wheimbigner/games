import React from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import Ship from './ship.jsx';
import Grid from './grid.jsx';
import EditBoard from './EditBoard.jsx'
import PlayerList from './playerlist.jsx';

import * as boatApi from '../../../api/battleboats.js';

class Team extends React.Component {
    constructor(props) {
        super(props)
        this.state = { name: props.name, cansave: false, editBoard: false };
        this.onChange_name = this.onChange_name.bind(this);
        this.saveName = this.saveName.bind(this);
    }
    componentWillReceiveProps(newProps) {
        if ( (newProps.name) && (this.state.name === this.props.name) ) {
            this.setState({name: newProps.name});
        }
    }
    onChange_name(event) {
        this.setState({name: event.target.value, cansave: true});        
    }
    saveName() {
        boatApi.setTeamName(this.props.game, this.props.team, this.state.name)
            .then( () => { this.setState({cansave: false}) } )
    }
    render() {
        return (
            <Paper style={{ padding: 10, margin: 10 }} zDepth={2}>
                <table><tbody><tr>
                    <td style={{ width: '33%' }}>
                        <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                            <Ship title='5' data={this.props.ships.carrier} />
                            <Ship title='4' data={this.props.ships.battleship} />
                            <Ship title='3' data={this.props.ships.cruiser} />
                            <Ship title='2' data={this.props.ships.submarine} />
                            <Ship title='1' data={this.props.ships.destroyer} />
                        </Paper>
                    </td>
                    <td style={{ width: '67%' }}>
                        <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                            {this.props.admin ? (
                            <div style={{display: 'flex'}}>
                                <TextField name="gamename" value={(this.state.name)} onChange={this.onChange_name}
                                    onBlur={this.saveName} />
                                <FlatButton label="save" primary={true} disabled={!this.state.cansave} onClick={this.saveName} />
                            </div>
                            ) : ( 
                                <h1 style={{lineHeight: '0.3em', textAlign: 'center'}}>{this.props.name}</h1>
                            )}
                            {this.state.editBoard ? (
                                <EditBoard game={this.props.game} team={this.props.team}
                                    close={() => {this.setState({editBoard: false})}} />
                            ) : (
                                <Grid game={this.props.game} team={this.props.team} board={this.props.board}
                                    edit={() => {this.setState({editBoard:true})}} admin={this.props.admin} />
                            )}
                        </Paper>
                    </td>
                </tr></tbody></table>
                <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                    {this.props.admin ? (
                        <RaisedButton primary={true} label="Edit Player List" onClick={this.props.nav} />
                    ) : null}
                    <PlayerList players={this.props.players} admin={this.props.admin}
                        game={this.props.game} team={this.props.team} />
                </Paper>
            </Paper>
        )
    }
}

Team.propTypes = {
    ships: React.PropTypes.object.isRequired,
    admin: React.PropTypes.bool,
    nav: React.PropTypes.func.isRequired,
    game: React.PropTypes.string.isRequired,
    team: React.PropTypes.number.isRequired,
    board: React.PropTypes.array.isRequired,
    players: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
}

export default Team;