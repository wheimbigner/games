import React from 'react';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import Ship from './ship.jsx';
import Grid from './grid.jsx';
import PlayerList from './playerlist.jsx';

class Team extends React.Component {
    constructor(props) {
        super(props)
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
                                <RaisedButton primary={true} label="Edit board" onClick={this.props.nav.editboard} />
                            ) : null }
                            <h1 style={{lineHeight: 1, textAlign: 'center'}}>{this.props.name}</h1>
                            <Grid game={this.props.game} team={this.props.team} board={this.props.board} />
                        </Paper>
                    </td>
                </tr></tbody></table>
                <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                    {this.props.admin ? (
                        <RaisedButton primary={true} label="Edit Player List" onClick={this.props.nav.editplayers} />
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
    nav: React.PropTypes.object.isRequired,
    game: React.PropTypes.string.isRequired,
    team: React.PropTypes.number.isRequired,
    board: React.PropTypes.array.isRequired,
    players: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
}

export default Team;