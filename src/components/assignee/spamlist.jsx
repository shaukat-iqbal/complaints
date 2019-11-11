import React, { Component } from "react";
import _ from "lodash";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import SpamTable from "./spamTable";
import { getSpamList, removeSpam } from "../../services/complaintService";

class SpamList extends Component {
  state = {
    complaints: [],
    categories: [],
    sortColumn: { path: "title", order: "asc" },
    display: false
  };
  constructor(props) {
    super(props);
    if (props.spamList && props.spamList.length > 0)
      this.state.complaints = props.spamList;
    else this.state.complaints = [];
  }
  async componentDidMount() {
    this.setState({ display: this.props.displaySpamList });
    if (!this.state.complaints || this.state.complaints.length > 0) return;
    const { data } = await getSpamList();
    this.setState({ complaints: data });
  }

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  handleRemove = async complaint => {
    const originalComplaints = this.state.complaints;
    const complaints = originalComplaints.filter(c => c._id !== complaint._id);
    this.setState({ complaints });

    try {
      await removeSpam(complaint._id);

      // console.log(data);
    } catch (error) {
      this.setState({ complaints: originalComplaints });
    }
  };

  // handle display
  handleDisplay = () => {
    this.props.checkDisplay(this.state.display);
  };

  //onclose dialog
  handleClose = () => {
    this.setState({ display: false });
    this.props.checkDisplay(false);
  };

  render() {
    const { complaints, sortColumn } = this.state;
    const sorted = _.orderBy(complaints, [sortColumn.path], [sortColumn.order]);

    return (
      <div className="card">
        <Dialog
          open={this.state.display}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          {complaints.length > 0 ? (
            <>
              <div className="card-header">Spam List</div>

              <div className="card-body">
                <SpamTable
                  complaints={sorted}
                  sortColumn={sortColumn}
                  onSort={this.handleSort}
                  onRemoveFromList={this.handleRemove}
                />
              </div>
            </>
          ) : (
            <div className="card-body">
              <h4 className="text-center">No Spam Complaints</h4>
            </div>
          )}

          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default SpamList;
