import React, { Component } from "react";
import Table from "../../common/table";

class AttachmentsTable extends Component {
  columns = [
    { path: "extentionName", label: "Extention Name" },
    { path: "maxSize", label: "Max Size" },
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
        data={this.props.attachments}
        sortColumn={this.props.sortColumn}
        onSort={this.props.onSort}
      />
    );
  }
}

export default AttachmentsTable;
