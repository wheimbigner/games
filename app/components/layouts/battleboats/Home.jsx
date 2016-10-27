import React from 'react';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import Team from '../../views/battleboats/team.jsx';
import * as boatApi from '../../../api/battleboats.js';
import * as api from '../../../api/api.js';

import io from 'socket.io-client';

import getGameSuccess from '../../../actions/battleboats.js';
import store from '../../../store.js';

class Battleboats extends React.Component {
    constructor(props) {
        super(props);
        this.state = { gamename: props.name, cansavename: false, desc: props.desc, cansavedesc: false };
        this.onChange_gamename = this.onChange_gamename.bind(this);
        this.saveGamename = this.saveGamename.bind(this);
        this.onChange_desc = this.onChange_desc.bind(this);
        this.saveDesc = this.saveDesc.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
    }
    getChildContext() {
        return ({ router: this.context.router })
    }
    componentWillMount() {
        boatApi.getGame(this.props.params.game);
//        localStorage.debug='*';
        this.socket = io('/battleship/' + this.props.params.game);
        this.socket.on('update', data => {
            store.dispatch(getGameSuccess(data)) // Is this a good idea? I wish all my store calls were consolidated
        })
        api.title(this.props.name);
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        this.socket.close();
    }
    componentWillReceiveProps(newProps) {
        if ( (newProps.name) && (this.state.gamename === this.props.name) ) {
            this.setState({gamename: newProps.name});
        }
        if ( (newProps.desc) && (this.state.desc === this.props.desc) ) {
            this.setState({desc: newProps.desc});
        }
        if ('name' in newProps && (this.props.name !== newProps.name)) api.title(newProps.name);
    }
    onChange_gamename(event) {
        this.setState({gamename: event.target.value, cansavename: true});        
    }
    onChange_desc(event) {
        this.setState({desc: event.target.value, cansavedesc: true});        
    }
    saveGamename() {
        boatApi.setGameName(this.props.params.game, this.state.gamename)
            .then( () => { this.setState({cansavename: false}) } )
    }
    saveDesc() {
        boatApi.setGameDesc(this.props.params.game, this.state.desc)
            .then( () => { this.setState({cansavedesc: false}) } )
    }
    deleteGame() {
        boatApi.deleteGame(this.props.params.game)
            .then( () => { this.context.router.push('/games') } );
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
                                        <TextField name="gamename" value={this.state.gamename}
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
                                        <TextField name="description" value={this.state.desc}
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
                        <p style={{textAlign: 'center', whiteSpace: 'pre-wrap'}}>{this.props.desc}</p>
                    </div>
                }
                <table>
                    <tbody>
                        <tr>
                            <td style={{ width: '50%', verticalAlign: 'top' }}>
                                <Team team={1} game={this.props.params.game}
                                    admin={this.props.admin}
                                    ships={this.props.ships[0]}
                                    board={this.props.board[0]}
                                    players={this.props.players[0]}
                                    name={this.props.teamnames[0]} />
                            </td>
                            <td style={{ width: '50%', verticalAlign: 'top' }}>
                                <Team team={2} game={this.props.params.game} 
                                    admin={this.props.admin}
                                    ships={this.props.ships[1]}
                                    board={this.props.board[1]}
                                    players={this.props.players[1]}
                                    name={this.props.teamnames[1]} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Paper>
        );
    }
}
Battleboats.propTypes = {
    params: React.PropTypes.object.isRequired,
    admin: React.PropTypes.bool.isRequired,
    ships: React.PropTypes.array.isRequired,
    board: React.PropTypes.array.isRequired,
    players: React.PropTypes.array.isRequired,
    teamnames: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    desc: React.PropTypes.string
}
Battleboats.contextTypes = {
    router: React.PropTypes.object.isRequired
}
Battleboats.childContextTypes = {
    router: React.PropTypes.object
}

const mapStateToProps = function (store) {
    return {
        ships: [store.battleboatState.team1.ships, store.battleboatState.team2.ships],
        board: [store.battleboatState.team1.board, store.battleboatState.team2.board],
        players: [store.battleboatState.team1.players, store.battleboatState.team2.players],
        teamnames: [store.battleboatState.team1.name, store.battleboatState.team2.name],
        name: store.battleboatState.name,
        desc: store.battleboatState.desc,
        admin: store.api.admin
    };
};
export default connect(mapStateToProps)(Battleboats);