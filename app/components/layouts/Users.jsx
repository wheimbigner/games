import React from 'react';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';

import * as api from '../../api/api.js';

class UserListForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
        };
        this.onSelect = id => {
            if (id.length) this.context.router.push('/users/' + this.state.users[id[0]]._id);
        };
        this.onCheck = (event,checked) => {
            api.getUsers({admin: checked})
                .then(response => {
                    this.setState({users: response.data.users});
                })
        }
    }
    componentWillMount() {
        api.getUsers({admin: false})
            .then(response => {
                this.setState({users: response.data.users});
            })
        api.title('User list');
    }
  render() {
    return (
      <div>
        <Checkbox label="Only show supervisors" name="filtersup" onCheck={this.onCheck} />
        <Table onRowSelection={this.onSelect}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                <TableRow selectable={false}>
                    <TableHeaderColumn>email</TableHeaderColumn>
                    <TableHeaderColumn>First Name</TableHeaderColumn>
                    <TableHeaderColumn>Last Name</TableHeaderColumn>
{ /*                    <TableHeaderColumn>Part-time?</TableHeaderColumn> */ }
                    <TableHeaderColumn>Admin</TableHeaderColumn>
{ /*                    <TableHeaderColumn>Supervisor</TableHeaderColumn> */ }
                    <TableHeaderColumn>Created</TableHeaderColumn>
                    <TableHeaderColumn>Updated</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
            {this.state.users.map((user,index) => (
                <TableRow key={index} selectable={true} hoverable={true}>
                    <TableRowColumn>{user._id}</TableRowColumn>
                    <TableRowColumn>{user.firstName}</TableRowColumn>
                    <TableRowColumn>{user.lastName}</TableRowColumn>
{ /*                    <TableRowColumn>{(user.parttime ? 'Yes' : 'No')}</TableRowColumn> */ }
                    <TableRowColumn>{(user.admin ? 'Yes' : 'No')}</TableRowColumn>
{ /*                    <TableRowColumn>{user.supervisor}</TableRowColumn> */ }
                    <TableRowColumn>{user.createdAt}</TableRowColumn>
                    <TableRowColumn>{user.updatedAt}</TableRowColumn>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>
    );
  }
}
UserListForm.propTypes = { }
UserListForm.contextTypes = {
    router: React.PropTypes.object.isRequired
}
export default UserListForm;