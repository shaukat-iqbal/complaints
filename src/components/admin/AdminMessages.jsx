/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import { getUniqueComplainers } from "../../services/complainerService";
import { getCurrentUser } from "../../services/authService";
import { deleteConversation } from "../../services/messageService";
import { Dropdown } from "react-bootstrap";

const url = "/a/message";

class AdminMessages extends React.Component {
  state = {
    complainers: [],
    confirmation: false,
    complainer: "",
    notifications: []
  };
  async componentDidMount() {
    try {
      let { data: complainers } = await getUniqueComplainers();
      this.setState({ complainers });
    } catch (error) {}
  }

  handleDelete = async complainer => {
    const data = {
      sender: getCurrentUser()._id,
      receiver: complainer._id
    };

    try {
      await deleteConversation(data);

      this.setState({ confirmation: false });
      toast.success("Conversation is deleted");
    } catch (error) {
      toast.error("Could not delete ");
    }
  };
  handleCloseComplaintDetail = () => {
    this.setState({ isOpen: false, complaintId: null });
  };

  displayConfirmation = cmp => {
    this.setState({ complainer: cmp, confirmation: true });
  };

  render() {
    const { complainers } = this.state;

    return (
      <>
        {this.state.confirmation && (
          <Dialog
            open={this.state.confirmation}
            onClose={() => {
              this.setState({ confirmation: false });
            }}
          >
            <DialogTitle>Alert</DialogTitle>
            <DialogContent>
              Are You sure you want to delete conversation with{" "}
              {this.state.complainer.name} ?
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  this.setState({ confirmation: false });
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => this.handleDelete(this.state.complainer)}
                color="primary"
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <Dropdown direction="left" style={{ marginRight: "10px" }}>
          <Dropdown.Toggle variant="light" id="dropdown-basic">
            <i className="fa fa-envelope"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu
            direction="left"
            key="left"
            style={{ paddingTop: "0px" }}
          >
            {complainers.length > 0 ? (
              <>
                {complainers.map(complainer => (
                  <li
                    key={complainer._id}
                    className="dropdown-item d-flex justify-content-between align-items-center"
                  >
                    <Link
                      key={complainer.name}
                      to={`${url}/${complainer._id}`}
                      className="text-decoration-none text-dark"
                    >
                      {complainer.name}
                    </Link>
                    <i
                      className="fa fa-trash clickable pl-5"
                      onClick={() => this.displayConfirmation(complainer)}
                    />
                  </li>
                ))}
              </>
            ) : (
              <>
                <li className="dropdown-item">You have No messages</li>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default AdminMessages;
