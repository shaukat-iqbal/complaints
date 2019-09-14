import React, { Component } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogContentText, DialogActions } from "@material-ui/core";
class CsvResponse extends Component {
  state = {};
  render() {
    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        scroll={"paper"}
        height="500px"
      >
        <React.Fragment>
          <DialogTitle id="form-dialog-title">
            Errors while creating accounts
          </DialogTitle>
          <DialogContent dividers={true}>
            <DialogContentText>
              <table className="table table-active">
                <thead>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Error Message</th>
                </thead>
                <tbody>
                  {this.props.errors.map(row => (
                    // <div key={error.message}>{error.message}</div>
                    <tr>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[4] ? row[4] : row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <a
              href={this.props.downloadUrl}
              download="errors.csv"
              className="btn btn-info"
            >
              Download Csv
            </a>
          </DialogActions>
        </React.Fragment>
      </Dialog>
    );
  }
}

export default CsvResponse;
