import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import {changeShots} from '../../../api/battleboats.js';

export default function (props) { return (
    <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
            <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Shots</TableHeaderColumn>
                {((props.admin) ? (
                    <TableHeaderColumn>&nbsp; </TableHeaderColumn>
                ) : ('')) }
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {props.players.map((player, index) => { return (
            <TableRow selectable={false} hoverable={false} key={index}>
                <TableRowColumn>{player._id.firstName + ' ' + player._id.lastName}</TableRowColumn>
                <TableRowColumn>{player.shots}</TableRowColumn>
                {((props.admin) ? (
                <TableRowColumn>
                    <FloatingActionButton mini={true} onClick={() => {
                        changeShots(props.game, props.team, player._id._id, 'inc')
                    }}>
                        <ContentAdd />
                    </FloatingActionButton>
                    <FloatingActionButton mini={true} secondary={true} onClick={() => { 
                        changeShots(props.game, props.team, player._id._id, 'dec')
                    }}>
                        <ContentRemove />
                    </FloatingActionButton>
                </TableRowColumn>
                ) : ('')) }
            </TableRow>
            );}) }
        </TableBody>
    </Table>
)}