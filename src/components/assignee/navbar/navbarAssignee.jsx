/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import auth, { getCurrentUser } from "../../../services/authService";
import { deleteConversation } from "../../../services/messageService";
import { setProfilePictureToken } from "../../../services/imageService";
import { Dropdown } from "react-bootstrap";
import UserLogo from "../../common/logo";
import { getAllNotifications } from "../../../services/notificationService";
import ComplaintDetail from "../../common/ComplaintDetail";
import Notifications from "../../common/Notifications";
import { getConfigToken } from "../../../services/configurationService";
import openSocket from "socket.io-client";
import config from "./../../../config.json";
const socket = openSocket(config.apiEndpoint, {
  reconnection: true
});
const url = "/a/message";

class Navbar extends React.Component {
  state = {
    complainers: [],
    confirmation: false,
    complainer: "",
    notifications: [],
    isMessaging: true
  };

  async componentDidMount() {
    let user = getCurrentUser();
    if (!localStorage.getItem("profilePicture")) {
      await setProfilePictureToken(getCurrentUser()._id, "assignee");
    }

    this.setState({ isMessaging: getConfigToken().isMessaging });
    socket.on("config", configuration => {
      if (user.companyId === configuration.companyId) {
        this.setState({ isMessaging: configuration.isMessaging });
      }
    });
  }

  handleDelete = async complainer => {
    console.log(complainer.name);
    const data = {
      sender: auth.getCurrentUser()._id,
      receiver: complainer._id
    };

    await deleteConversation(data);

    this.setState({ confirmation: false });
    toast.success("Conversation is deleted");
  };
  handleCloseComplaintDetail = () => {
    this.setState({ isOpen: false, complaintId: null });
  };
  displayConfirmation = cmp => {
    this.setState({ complainer: cmp, confirmation: true });
  };

  render() {
    const { user, complainers, notifications } = this.props;

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

        <nav
          className="navbar navbar-expand-sm navbar-light bg-light shadow-sm"
          id="main-nav"
        >
          <div className="container">
            <Link to="/assignee" className="navbar-brand text-dark">
              Quick Response
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ml-auto ">
                <Notifications notifications={notifications} />

                {this.state.isMessaging && (
                  <div className="dropdown">
                    <button
                      className="nav-button mt-2 mr-4 navbar-custom"
                      type="button"
                      id="dropdownMenuButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fa fa-envelope mr-1"></i>
                    </button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      {complainers.length > 0 ? (
                        <>
                          {complainers.map(as => (
                            <li
                              key={as._id}
                              className="dropdown-item d-flex justify-content-between align-items-center"
                            >
                              <Link
                                key={as._id}
                                to={`${url}/${as._id}`}
                                className="text-decoration-none text-dark"
                              >
                                {" "}
                                {as.name}{" "}
                              </Link>
                              <i
                                className="fa fa-trash clickable pl-5"
                                onClick={() => this.displayConfirmation(as)}
                              />

                              {/* Confirmation */}

                              {/* Confirmation end */}
                            </li>
                          ))}
                        </>
                      ) : (
                        <>
                          <li className="dropdown-item">
                            You have No messages
                          </li>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <UserLogo />

                <NavLink
                  className="nav-item nav-link text-dark "
                  to={`/assignee/profile/${getCurrentUser()._id}/assignees`}
                >
                  {getCurrentUser() && getCurrentUser().name.split(" ", 1)}
                </NavLink>

                <a className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="text-dark navbar-custom"> More</span>
                  </Link>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    <NavLink
                      className="dropdown-item "
                      to={`/assignee/profile/${auth.getCurrentUser()._id}/${
                        auth.getCurrentUser().role
                      }s`}
                    >
                      Profile
                    </NavLink>
                    <Link className="dropdown-item " to="/assignee/dashboard">
                      Dashboard
                    </Link>
                    <NavLink className="dropdown-item" to="/resetpassword">
                      Reset Password
                    </NavLink>
                    <NavLink className="dropdown-item" to="/logout">
                      <i className="fa fa-sign-out mr-1"></i>Logout
                    </NavLink>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }
}

export default Navbar;
