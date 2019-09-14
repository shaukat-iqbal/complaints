import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../../common/table";
import auth from "../../../services/authService";
class UsersTable extends Component {
  columns = [
    { path: "name", label: "Name" },
    { path: "email", label: "Email" },
    { path: "phone", label: "Phone" },
    {
      key: "actions",
      content: user => (
        <>
          <Link
            to={`/profile/${user._id}/${this.props.role}`}
            className="btn button-primary btn-sm  mr-2 mb-2 "
          >
            Profile
          </Link>
          <button
            onClick={() => this.props.onEdit(user)}
            className="btn button-primary btn-sm  mr-2 mb-2"
          >
            Edit
          </button>
          <button
            onClick={() => this.props.onDelete(user)}
            className="btn btn-danger btn-round btn-sm mr-2 mb-2"
          >
            Delete
          </button>
        </>
      )
    }
  ];

  //
  render() {
    return (
      <Table
        columns={this.columns}
        data={this.props.users}
        sortColumn={this.props.sortColumn}
        onSort={this.props.onSort}
      />
    );
  }
}

export default UsersTable;
