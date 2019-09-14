import React, { Component } from "react";
import Table from "../common/table";

class SpamTable extends Component {
  columns = [
    { path: "title", label: "Title" },
    { path: "status", label: "Status" },
    { path: "category.name", label: "Category" },

    {
      key: "detail",
      content: complaint => (
        <>
          <button
            onClick={() => this.props.onRemoveFromList(complaint)}
            className="btn button-primary btn-sm"
          >
            Remove
          </button>
        </>
      )
    }
  ];

  render() {
    const { complaints, onSort, sortColumn } = this.props;

    return (
      <>
        <Table
          columns={this.columns}
          data={complaints}
          onSort={onSort}
          sortColumn={sortColumn}
        />
      </>
    );
  }
}

export default SpamTable;
