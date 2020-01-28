import React, { Component } from "react";
import Table from "../common/table";

class CompaniesTable extends Component {
  columns = [
    { path: "name", label: "Company Name" },
    { path: "phone", label: "Phone" },
    { path: "email", label: "Email" },
    { path: "status", label: "Status" },
    { path: "createdAt", label: "Registered On" },
    {
      key: "edit",
      content: company => (
        <>
          <button
            onClick={() => this.props.onEdit(company)}
            className="btn button-primary btn-sm mr-2 "
          >
            Edit
          </button>
          <button
            onClick={() => this.props.onDetail(company)}
            className="btn button-primary btn-sm"
          >
            Detail
          </button>
        </>
      )
    }
  ];
  state = {
    companies: []
  };

  constructor(props) {
    super(props);
    this.state.companies = props.companies;
  }

  // componentWillReceiveProps(nextProps) {
  //   let companies = this.formatCreatedDate(nextProps.companies);
  //   this.setState({ companies });
  // }

  render() {
    let { companies, onSort, sortColumn } = this.props;

    return (
      <>
        <Table
          columns={this.columns}
          data={companies}
          onSort={onSort}
          sortColumn={sortColumn}
        />
      </>
    );
  }
}

export default CompaniesTable;
