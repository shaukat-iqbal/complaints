import React, { Component } from "react";
import Table from "../common/table";

class AssigneeTable extends Component {
  columns = [
    {
      key: "check",
      content: complaint => (
        <div className="form-check ">
          <input
            type="checkbox"
            defaultChecked={
              this.props.checkedComplaint &&
              this.props.checkedComplaint._id === complaint._id
                ? true
                : false
            }
            onChange={() => this.props.onCheckBoxChecked(complaint)}
            className="form-check-input"
          />
        </div>
      )
    },
    { path: "title", label: "Title" },
    { path: "status", label: "Status" },
    { path: "category.name", label: "Category" },
    { path: "complainer.name", label: "Complainer" },
    {
      key: "detail",
      content: complaint => (
        <>
          <button
            onClick={() => this.props.onDetail(complaint)}
            className="btn button-primary btn-sm"
          >
            Details
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

export default AssigneeTable;
