//updated
//shaukat

import React from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import { Route, Switch, Redirect } from "react-router-dom";
import openSocket from "socket.io-client";

import auth from "../../services/authService";
import AssigneeDashboard from "./dashboard/AssigneeDashboard";
import NavbarAssignee from "./navbar/navbarAssignee";
import Spinner from "../common/Spinner/Spinner";
import RegisterForm from "./../admin/usersManagement/Register";
import { getAllNotifications } from "../../services/notificationService";
import config from "../../config.json";
import {
  getAssigneeComplaints,
  markSpam
} from "../../services/complaintService";
const socket = openSocket(config.apiEndpoint, {
  reconnection: true
});
class Assignee extends React.Component {
  state = {
    complainers: [],
    user: "",
    complaints: [],
    isLoading: false,
    notifications: []
  };

  isActive = false;

  async componentDidMount() {
    this.isActive = true;
    this.checkSocketConnection();
    const user = auth.getCurrentUser();

    const { data } = await getAllNotifications();
    this.setState({ notifications: data });

    if (!user || user.role !== "assignee") {
      toast.error("Access denied to this route!");
      this.props
        ? this.props.history.replace("/login")
        : window.location("/login");
    }

    if (this.isActive) {
      this.setState({ isLoading: true });
      const { data } = await getAssigneeComplaints();

      let arr = [];

      for (let i = 0; i < data.length; i++) {
        if (data[i].complainer) {
          arr.push(data[i].complainer);
        }
      }

      const uniquecomplainer = _.uniqBy(arr, function(o) {
        return o._id;
      });

      this.setState(prevState => {
        return {
          complaints: data,
          isLoading: false,
          complainers: uniquecomplainer,
          user
        };
      });
    }
  }

  componentWillUnmount() {
    this.isActive = false;
    // socket.disconnect(true);
  }
  // check socket connection
  checkSocketConnection = () => {
    const user = auth.getCurrentUser();
    if (this.isActive) {
      socket.on("msg", data => {
        if (data.receiver === user._id) {
          toast.info("New Message:" + data.messageBody);
        }
      });
      socket.on("complaints", data => {
        console.log(data);

        if (
          user.companyId !== data.notification.companyId ||
          user._id !== data.notification.receivers.id
        ) {
          return;
        }

        switch (data.action) {
          case "new complaint":
            this.createNewComplaint(data.complaint);
            toast.info(
              `New Complaint has been registered with title "${data.complaint.title}"`
            );
            break;
          case "task assigned":
            this.replaceUpdatedComplaint(data.complaint);
            toast.info(
              `New Complaint has been assigned to you.Title: "${data.complaint.title}"`
            );
            break;
          case "feedback":
            this.replaceUpdatedComplaint(data.complaint);
            toast.info(
              `Complainer has given you feedback on Complaint with title "${data.complaint.title}"`
            );
            break;

          case "reopened":
            this.replaceUpdatedComplaint(data.complaint);
            toast.info(
              `Complaint has been reOpened by complainant. Title "${data.complaint.title}"`
            );
            break;
          default:
            break;
        }

        this.setState(prevState => {
          const updatednotifications = [...prevState.notifications];
          updatednotifications.unshift(data.notification);
          return { notifications: updatednotifications };
        });
      });
    }
  };

  // handling after dropping complaint from assignee
  replaceUpdatedComplaint = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      let index = updatedComplaints.findIndex(c => c._id === complaint._id);
      if (index >= 0) updatedComplaints[index] = complaint;
      return { complaints: updatedComplaints, isLoading: false };
    });
  };

  // create new complaint that is created now
  createNewComplaint = complaint => {
    console.log(this.state.complaints);
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      updatedComplaints.unshift(complaint);
      return { complaints: updatedComplaints, isLoading: false };
    });
  };

  // handle mark as spam
  handleSpam = async complaint => {
    try {
      await markSpam(complaint._id, true);
    } catch (ex) {
      if (ex.response && ex.response.status === "400") {
        return toast.warn("Something went wrong");
      }
    }

    const { data: complaints } = await getAssigneeComplaints();
    this.setState({
      complaints,
      displaySpamList: false,
      checkedComplaint: null
    });
    // this.props.history.replace("/assignee");
    toast.success("You have successfully Marked this as spam");
  };

  render() {
    return (
      <React.Fragment>
        <NavbarAssignee
          user={this.state.user}
          complainers={this.state.complainers}
          complaints={this.state.complaints}
          notifications={this.state.notifications}
          {...this.props}
        />
        {this.state.isLoading && (
          <div className="d-flex justify-content-center mt-5">
            <Spinner />
          </div>
        )}
        <div>
          <Switch>
            <Route
              path="/assignee/dashboard"
              render={props => (
                <AssigneeDashboard
                  {...props}
                  complaints={this.state.complaints}
                  onSpam={this.handleSpam}
                />
              )}
            />
            <Route
              path="/assignee/profile/:id/:role"
              render={props => (
                <div className="d-flex justify-content-center py-5 ">
                  {props.match.params.role !== "admins" && (
                    <RegisterForm isProfileView={true} {...props} />
                  )}
                </div>
              )}
            />

            <Redirect exact from="/assignee" to="/assignee/dashboard" />
          </Switch>
        </div>
      </React.Fragment>
    );
  }
}

export default Assignee;
