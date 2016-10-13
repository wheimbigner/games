import React from 'react';
import {fire} from '../../../api/battleboats.js';

const colors = [
    'linear-gradient(135deg, #eeeeee 0%,#cccccc 100%)', // white
    'linear-gradient(135deg, #a90329 0%,#8f0222 44%,#6d0019 100%)', // red
    'linear-gradient(135deg, #a90329 0%,#8f0222 44%,#6d0019 100%)', // red
    'linear-gradient(135deg, #a90329 0%,#8f0222 44%,#6d0019 100%)', // red
    'linear-gradient(135deg, #a90329 0%,#8f0222 44%,#6d0019 100%)', // red
    'linear-gradient(135deg, #a90329 0%,#8f0222 44%,#6d0019 100%)', // red
    'linear-gradient(45deg, #87e0fd 0%,#53cbf1 40%,#05abe0 100%)' // blue
];

export default function(props) {
    return (
        <table style={{borderSpacing: 0}}>
        <tbody>
            <tr>
                <th />
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>E</th>
                <th>F</th>
                <th>G</th>
                <th>H</th>
                <th>I</th>
                <th>J</th>
            </tr>
            {props.board.map((row, y) => {return(
            <tr key={'row' + y}>
                <th>{''+(y+1)}</th>
                {row.map((cell, x) => {
                    return(
                        <td
                            key={'cellx'+x+'y'+y} data-x={x} data-y={y}
                            onClick={(event) => {
                                fire(props.game, props.team, event.target.dataset.x, event.target.dataset.y)
                            }} style={{width: 30, height: 30, background: colors[cell], fontColor: 'white'}}
                        />
                    )
                })}
            </tr>
            )})}
        </tbody>
    </table>
    );
}