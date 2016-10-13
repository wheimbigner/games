import React from 'react';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import Ship from './ship.jsx';
import Grid from './grid.jsx';
import PlayerList from './playerlist.jsx';

export default function(props) {
    return (
        <Paper style={{ padding: 10, margin: 10 }} zDepth={2}>
            <table><tbody><tr>
                <td style={{ width: '33%' }}>
                    <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                        <Ship title='5' data={props.ships.carrier} />
                        <Ship title='4' data={props.ships.battleship} />
                        <Ship title='3' data={props.ships.cruiser} />
                        <Ship title='2' data={props.ships.submarine} />
                        <Ship title='1' data={props.ships.destroyer} />
                    </Paper>
                </td>
                <td style={{ width: '67%' }}>
                    <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                        {props.admin ? (<RaisedButton primary={true} label="Edit board" onClick={props.nav.editboard} />) : '' }
                        <h1 style={{lineHeight: 1, textAlign: 'center'}}>{props.name}</h1>
                        <Grid game={props.game} team={props.team} board={props.board} />
                    </Paper>
                </td>
            </tr></tbody></table>
            <Paper style={{ padding: 10, margin: 10 }} zDepth={3}>
                {props.admin ? (<RaisedButton primary={true} label="Edit Player List" onClick={props.nav.editplayers} />) : ''}
                <PlayerList players={props.players} admin={props.admin}
                    game={props.game} team={props.team} />
            </Paper>
        </Paper>
    )
}
