import React, { Component } from "react";
import Table from "./table";

class ComplaintsTable extends Component {
  columns = [
    { path: "title", label: "Title" },
    { path: "status", label: "Status" },
    { path: "category.name", label: "Category" },
    { path: "assignedTo.name", label: "Assigned To" },
    { path: "complainer.name", label: "Complainer" },
    { path: "timeStamp", label: "Date" },
    {
      key: "detail",
      content: complaint => (
        <>
          <button
            onClick={() => this.props.onDetail(complaint)}
            className="btn button-primary btn-sm"
          >
            Detail
          </button>
        </>
      )
    }
    // ,
    // {
    //   key: "assign",
    //   content: complaint => (
    //     <>
    //       <button
    //         onClick={() => this.props.onDetail(complaint)}
    //         className="btn btn-info btn-sm"
    //       >
    //         Assign
    //       </button>
    //     </>
    //   )
    // }
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

export default ComplaintsTable;
