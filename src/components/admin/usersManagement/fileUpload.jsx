import React, { Component } from "react";
import { createUsers } from "../../../services/userService";
import CsvResponse from "./csvResponse";
class FileUpload extends Component {
  state = {
    assignees: null,
    complainers: null,
    dialog: false,
    errors: [],
    url: ""
  };
  handleFile = event => {
    const file = event.target.files[0];
    this.setState({ [event.target.name]: file });
  };

  createAccounts = async ({ currentTarget }) => {
    if (!this.state[currentTarget.name]) {
      alert("Please select file");
      return;
    }
    const fd = new FormData();
    const file = this.state[currentTarget.name];
    fd.append("csvFile", file, file.name);
    const role = currentTarget.name;
    try {
      const { data: csvResponse } = await createUsers(role, fd);
      const rows = csvResponse.split("\n");

      //errors result will be= [array[],array[],array[]]
      const errors = rows.map(function(row) {
        return row.split(",");
      });
      const blob = new Blob([errors], { type: "octet/stream" }),
        url = window.URL.createObjectURL(blob);
      console.log(errors);

      //remove first indexed array i.e header
      if (errors.length < 2) {
        const redirectTo = "/admin/users/" + currentTarget.name + "s";
        this.props.history.push(redirectTo);
      }
      errors.shift();

      this.setState({ errors, dialog: true, url });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("In-Valid Format: File should have (name,email,phone) header");
      }
    }
  };

  handleClose = () => {
    this.setState({ dialog: false });
  };

  renderDiv = (userType, name, onClick) => {
    return (
      <div className="d-flex jumbotron border-primary bg-white flex-column">
        <p className="display-5">
          Upload Csv File to create {userType + "s"} accounts
        </p>
        <input
          type="file"
          name={name}
          accept=".csv"
          onChange={this.handleFile}
          style={{ cursor: "pointer" }}
        />
        <button
          className="mt-5 btn btn-sm btn-primary align-self-center"
          onClick={onClick}
          name={name}
        >
          Create Accounts
        </button>
      </div>
    );
  };

  render() {
    return (
      <div className="d-flex flex-column">
        <CsvResponse
          errors={this.state.errors}
          onClose={this.handleClose}
          isOpen={this.state.dialog}
          downloadUrl={this.state.url}
        />

        {this.renderDiv("assignee", "assignee", this.createAccounts)}
        {this.renderDiv("complainer", "complainer", this.createAccounts)}
      </div>
    );
  }
}

export default FileUpload;
