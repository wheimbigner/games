import React from 'react';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import Team from '../../views/battleboats/team.jsx';
import * as boatApi from '../../../api/battleboats.js';


class Battleboats extends React.Component {
    constructor(props) {
        super(props);
        this.state = { gamename: props.name, cansavename: false };
        this.nav = [ 
                () => { this.context.router.push('/games/' + this.props.params.game + '/team/1/players') },
                () => { this.context.router.push('/games/' + this.props.params.game + '/team/2/players') }
        ]
        this.onChange_gamename = this.onChange_gamename.bind(this);
        this.saveGamename = this.saveGamename.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
    }
    getChildContext() {
        return ({ router: this.context.router })
    }
    componentWillMount() {
        boatApi.getGame(this.props.params.game);
    }
    componentDidMount() {
        this.timer = setInterval(  () => { boatApi.getGame(this.props.params.game); },  10000  );
    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    componentWillReceiveProps(newProps) {
        if ( (newProps.name) && (this.state.gamename === this.props.name) ) {
            this.setState({gamename: newProps.name});
        }
    }
    onChange_gamename(event) {
        this.setState({gamename: event.target.value, cansavename: true});        
    }
    saveGamename() {
        boatApi.setGameName(this.props.params.game, this.state.gamename)
            .then( () => { this.setState({cansavename: false}) } )
    }
    deleteGame() {
        boatApi.deleteGame(this.props.params.game)
            .then( () => { this.context.router.push('/games') } );
    }
    render() {
        return (
            <Paper style={{ margin: 10, padding: 10 }} zDepth={1}>
                { (this.props.admin) ?
                    <div style={{display: 'flex'}}>
                        <div style={{flex: '0 0 15%'}}>&nbsp;</div>
                        <div style={{textAlign: 'center', flex: '0 0 70%'}}>
                            <TextField name="gamename" value={(this.state.gamename)} onChange={this.onChange_gamename} />
                            <FlatButton
                                label="save"
                                primary={true}
                                disabled={!this.state.cansavename}
                                onClick={this.saveGamename}
                            />
                        </div>
                        <div style={{textAlign: 'right', flex: '0 0 15%'}}>
                            <FlatButton label="delete" secondary={true} onClick={this.deleteGame} />
                        </div>
                    </div>
                    :
                    <h1 style={{lineHeight: 0, textAlign: 'center'}}>{this.props.name}</h1>
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
                                    name={this.props.teamnames[0]}
                                    nav={this.nav[0]} />
                            </td>
                            <td style={{ width: '50%', verticalAlign: 'top' }}>
                                <Team team={2} game={this.props.params.game} 
                                    admin={this.props.admin}
                                    ships={this.props.ships[1]}
                                    board={this.props.board[1]}
                                    players={this.props.players[1]}
                                    name={this.props.teamnames[1]}
                                    nav={this.nav[1]} />
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
        admin: store.api.admin
    };
};
export default connect(mapStateToProps)(Battleboats);