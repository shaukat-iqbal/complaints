import React, { Component } from "react";
import Table from "../../common/table";

class HigherAuthoritiesTable extends Component {
  columns = [
    { path: "name", label: "Name" },
    { path: "email", label: "Email" },
    { path: "designation", label: "Designation" },
    {
      key: "actions",
      content: user => (
        <>
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
        data={this.props.members}
        sortColumn={this.props.sortColumn}
        onSort={this.props.onSort}
      />
    );
  }
}

export default HigherAuthoritiesTable;
