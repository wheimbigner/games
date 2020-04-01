import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import Team from '../../views/battleboats/team.jsx';
import * as boatApi from '../../../api/battleboats.js';
import * as api from '../../../api/api.js';

import io from 'socket.io-client';

class Battleboats extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            cansavename: false, cansavedesc: false,
            game: {
                name: '',
                desc: '',
                team1: {
                    name: '',
                    players: [],
                    board: Array(10).fill(Array(10).fill(0)),
                    ships: {
                        carrier: { slots: 5, wounded: 0 },
                        battleship: { slots: 4, wounded: 0 },
                        cruiser: { slots: 3, wounded: 0 },
                        submarine: { slots: 3, wounded: 0 },
                        destroyer: { slots: 2, wounded: 0 },
                    }        
                },
                team2: {
                    name: '',
                    players: [],
                    board: Array(10).fill(Array(10).fill(0)),
                    ships: {
                        carrier: { slots: 5, wounded: 0 },
                        battleship: { slots: 4, wounded: 0 },
                        cruiser: { slots: 3, wounded: 0 },
                        submarine: { slots: 3, wounded: 0 },
                        destroyer: { slots: 2, wounded: 0 },
                    }
                }
            }
        };
        this.onChange_gamename = this.onChange_gamename.bind(this);
        this.saveGamename = this.saveGamename.bind(this);
        this.onChange_desc = this.onChange_desc.bind(this);
        this.saveDesc = this.saveDesc.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
    }
    componentWillMount() {
        this.socket = io('/battleship/' + this.props.match.params.game);
        this.socket.on('update', data => {
            this.setState({game: data});
            api.title(this.state.game.name);
        })
    }
    componentWillUnmount() {
        this.socket.close();
    }
    onChange_gamename(event) {
        this.setState({
            game: Object.assign({}, this.state.game, {name: event.target.value}),
            cansavename: true
        });
    }
    onChange_desc(event) {
        this.setState({
            game: Object.assign({}, this.state.game, {desc: event.target.value}),
            cansavedesc: true
        });
    }
    saveGamename() {
        boatApi.setGameName(this.props.match.params.game, this.state.game.name)
            .then( () => { this.setState({cansavename: false}) } )
    }
    saveDesc() {
        boatApi.setGameDesc(this.props.match.params.game, this.state.game.desc)
            .then( () => { this.setState({cansavedesc: false}) } )
    }
    deleteGame() {
        boatApi.deleteGame(this.props.match.params.game)
            .then( () => { this.props.history.push('/games') } );
    }
    render() {
        return (
            <Paper style={{ margin: 10, padding: 10 }} zDepth={1}>
                { (this.props.admin) ?
                    <div>
                        <div style={{display: 'flex'}}>
                            <div style={{flex: '0 0 15%'}}>&nbsp;</div>
                            <div style={{textAlign: 'center', flex: '0 0 70%'}}>
                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1 1 90%'}}>
                                        <TextField name="gamename" value={this.state.game.name}
                                            hintText="Untitled Game"
                                            inputStyle={{textAlign: 'center'}}
                                            fullWidth={true}
                                            onChange={this.onChange_gamename} />
                                    </div>
                                    <div style={{flex: '1 1 10%'}}>
                                        <FlatButton
                                            label="save" primary={true} disabled={!this.state.cansavename}
                                            onClick={this.saveGamename} />
                                    </div>
                                </div>
                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1 1 90%'}}>
                                        <TextField name="description" value={this.state.game.desc}
                                            hintText="Put description/info about the game here"
                                            multiLine={true} rows={2} rowsMax={4}
                                            textareaStyle={{textAlign: 'center'}}
                                            fullWidth={true}
                                            onChange={this.onChange_desc} />
                                    </div>
                                    <div style={{flex: '1 1 10%'}}>
                                        <FlatButton
                                            label="save" primary={true} disabled={!this.state.cansavedesc}
                                            onClick={this.saveDesc} />
                                    </div>
                                </div>
                            </div>
                            <div style={{textAlign: 'right', flex: '0 0 15%'}}>
                                <FlatButton label="delete game" secondary={true} onClick={this.deleteGame} />
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <p style={{textAlign: 'center', whiteSpace: 'pre-wrap'}}>{this.state.game.desc}</p>
                    </div>
                }
                <table><tbody><tr>
                    <td style={{ width: '50%', verticalAlign: 'top' }}>
                        <Team team={1} game={this.props.match.params.game} admin={this.props.admin} {...this.state.game.team1} />
                    </td>
                    <td style={{ width: '50%', verticalAlign: 'top' }}>
                        <Team team={2} game={this.props.match.params.game} admin={this.props.admin} {...this.state.game.team2} />
                    </td>
                </tr></tbody></table>
            </Paper>
        );
    }
}
Battleboats.propTypes = {
    params: PropTypes.object.isRequired,
    admin: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}

export default connect(function(store){return {admin:store.api.admin}})(Battleboats);
