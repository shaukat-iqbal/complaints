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
  ];
  state = {
    complaints: []
  };

  constructor(props) {
    super(props);
    this.state.complaints = props.complaints;
    this.state.complaints.map(complaint => {
      // let date = new Date(complaint.timeStamp);
      complaint.timeStamp = complaint.timeStamp.split("T")[0];
      return complaint;
    });
  }
  componentWillReceiveProps(nextProps) {
    let complaints = nextProps.complaints;
    complaints.map(complaint => {
      // let date = new Date(complaint.timeStamp);
      complaint.timeStamp = complaint.timeStamp.split("T")[0];
      return complaint;
    });
    this.setState({ complaints });
  }

  render() {
    let { complaints, onSort, sortColumn } = this.props;

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
