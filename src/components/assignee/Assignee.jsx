import React from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import { Route, Switch, Redirect } from "react-router-dom";
import openSocket from "socket.io-client";

import auth from "../../services/authService";
import AssigneeDashboard from "./dashboard/AssigneeDashboard";
import AdminComplaintDetail from "./AssigneeComplaintDetail";
import NavbarAssignee from "./navbar/navbarAssignee";

import {
  getAssigneeComplaints,
  markSpam
} from "../../services/complaintService";
import Spinner from "../common/Spinner/Spinner";

class Assignee extends React.Component {
  state = {
    complainers: [],
    user: "",
    complaints: [],
    isLoading: false
  };

  isActive = false;

  async componentDidMount() {
    this.isActive = true;
    this.checkSocketConnection();
    const user = auth.getCurrentUser();
    this.setState({ user: user });

    if (!user || user.role !== "assignee") {
      toast.error("Access denied to this route!");
      this.props
        ? this.props.history.replace("/login")
        : window.location("/login");
    }
    if (this.isActive) {
      this.setState({ isLoading: true });
      const { data } = await getAssigneeComplaints();

      this.setState(pre => {
        return {
          complaints: data
        };
      });
      this.setState({ isLoading: false });

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
          complainers: uniquecomplainer
        };
      });
    }
  }

  componentWillUnmount() {
    this.isActive = false;
  }

  // check socket connection
  checkSocketConnection = () => {
    if (this.isActive) {
      const socket = openSocket("http://localhost:5000", {
        reconnection: true
      });
      socket.once("complaints", data => {
        if (data.action === "new complaint") {
          this.setState({ isLoading: true });
          this.createNewComplaint(data.complaint);
          toast.info(
            `New Complaint has been registered with title "${data.complaint.title}"`
          );
        } else if (data.action === "task assigned") {
          this.setState({ isLoading: true });
          this.createNewComplaint(data.complaint);
          toast.info(
            `New Complaint has been assigned to you with title "${data.complaint.title}"`
          );
        } else if (data.action === "feedback") {
          this.setState({ isLoading: true });
          this.createNewComplaintAfterDropping(data.complaint);
          toast.info(
            `Complainer has given you feedback on Complaint with title "${data.complaint.title}"`
          );
        }
      });
    }
  };

  // handling after dropping complaint from assignee
  createNewComplaintAfterDropping = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];

      for (let i = 0; i < updatedComplaints.length; i++) {
        if (updatedComplaints[i]._id === complaint._id) {
          updatedComplaints.splice(i, 1, complaint);
          // updatedComplaints.unshift(complaint);
          break;
        }
      }
      return { complaints: updatedComplaints };
    });
    this.setState({ isLoading: false });
  };

  // create new complaint that is created now
  createNewComplaint = complaint => {
    console.log(this.state.complaints);
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      updatedComplaints.unshift(complaint);
      return { complaints: updatedComplaints };
    });
    this.setState({ isLoading: false });
  };

  // handle mark as spam
  handleSpam = async complaint => {
    await markSpam(complaint._id, true);

    this.setState({ checkedComplaint: null });
    // this.props.history.replace("/assignee");
    toast.success("You have successfully Marked this as spam");

    const { data: complaints } = await getAssigneeComplaints();
    this.setState({ complaints });
    this.setState({ displaySpamList: false });
  };

  render() {
    return (
      <React.Fragment>
        <NavbarAssignee
          user={this.state.user}
          complainers={this.state.complainers}
          complaints={this.state.complaints}
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
              exact
              path="/assignee/:id"
              component={AdminComplaintDetail}
            />
            <Redirect exact from="/assignee" to="/assignee/dashboard" />
          </Switch>
        </div>
      </React.Fragment>
    );
  }
}

export default Assignee;
