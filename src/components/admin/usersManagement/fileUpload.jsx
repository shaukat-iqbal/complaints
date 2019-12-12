import React, { Component } from "react";
import { createUsers } from "../../../services/userService";
import CsvResponse from "./csvResponse";
import { toast } from "react-toastify";
import FileSaver from "file-saver";
import { getSample } from "../../../services/csvService";
import Spinner from "../../common/Spinner/Spinner";
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
    this.setState({ isLoading: true });
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
      this.setState({ isLoading: false });
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
        toast.success("Users successfully Created.");
        const redirectTo = "/admin/users/" + currentTarget.name + "s";
        this.props.history.push(redirectTo);
      }
      errors.shift();

      this.setState({ errors, dialog: true, url });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("In-Valid Format: File should have (name,email,phone) header");
      }
      console.log(error);
    }
  };

  handleClose = () => {
    this.setState({ dialog: false });
  };

  renderDiv = (userType, name, onClick, isLoading) => {
    return (
      <div className="d-flex jumbotron bg-white flex-column shadow-lg ">
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-sm btn-info"
            data-toggle="tooltip"
            data-placement="top"
            title="Download Sample"
            type="button"
            onClick={() => this.handleDownload(name)}
            style={{ width: "50px" }}
          >
            <i className="fa fa-question"></i>
          </button>
        </div>
        <p className="display-5">
          Upload <strong>Csv File</strong> to create {userType + "s"} accounts
        </p>
        <input
          type="file"
          name={name}
          accept=".csv"
          onChange={this.handleFile}
          style={{ cursor: "pointer" }}
        />
        <button
          className="mt-5 btn btn-sm button-primary align-self-center"
          onClick={onClick}
          name={name}
        >
          Create Accounts
        </button>
        {isLoading && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100%" }}
          >
            <Spinner />
          </div>
        )}
      </div>
    );
  };

  handleDownload = async fileName => {
    console.log(fileName);
    const response = await getSample(fileName + "");
    const file = new Blob([response.data], { type: "application/csv" });
    FileSaver.saveAs(file, "sample.csv");
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

        {this.renderDiv(
          "assignee",
          "assignee",
          this.createAccounts,
          this.state.isLoading
        )}
        {this.renderDiv(
          "complainer",
          "complainer",
          this.createAccounts,
          this.state.isLoading
        )}
      </div>
    );
  }
}

export default FileUpload;
