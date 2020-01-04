import React, { Component } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import Navbar from "./navbar/navbar";
import auth from "../../services/authService";
import {
  calculateAggregate,
  getComplaintsByRole
} from "../../services/complaintService";
import openSocket from "socket.io-client";
import GraphBanner from "../common/GraphsBanner";
import ComplaintForm from "./ComplaintForm/complaintForm";
import Loading from "../common/loading";
import ComplaintDetail from "../common/ComplaintDetail";
import { getAllNotifications } from "../../services/notificationService";
import config from "./../../config.json";
import Complaints from "../common/Complaints";
const socket = openSocket(config.apiEndpoint);

class Complainer extends Component {
  state = {
    complaints: [],
    assignees: [],
    notifications: [],
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    isLoading: false,
    analytics: { uniqueCategories: [] }
  };
  // componentWillUnmount() {
  //   socket.disconnect(true);
  // }
  async componentDidMount() {
    const user = auth.getCurrentUser();
    try {
      this.setState({ isLoading: true });
      if (!user || user.role !== "complainer") {
        toast.error("Access denied to this Route!");
        this.props.history.replace("/");
      }

      this.setState({ user });
    } catch (ex) {
      window.location = "/login";
      return;
    }

    calculateAggregate().then(({ data: analytics }) => {
      this.setState({ analytics, isLoading: false });
    });
    this.getAllComplaints(user);

    const { data: notifications } = await getAllNotifications();
    this.setState({ notifications });
    this.listenEvents(user);
  }

  listenEvents = user => {
    let { complaints } = this.state;
    socket.on("msg", data => {
      if (data.receiver === user._id) {
        toast.info("New Message: " + data.messageBody);
      }
    });

    socket.on("complaints", data => {
      if (
        user.companyId !== data.notification.companyId ||
        user._id !== data.notification.receivers.id
      ) {
        return;
      }

      if (data.action === "status changed") {
        this.replaceUpdatedComplaint(data.complaint, complaints);
        toast.info(
          `Complaints: "${data.complaint.title}'s" status is changed to "${data.status}"`
        );
        this.setState(prevState => {
          const updatednotifications = [...prevState.notifications];
          updatednotifications.unshift(data.notification);
          return { notifications: updatednotifications };
        });
        // this.getAllComplaints();
      }
    });
  };

  // handling after dropping complaint from assignee
  replaceUpdatedComplaint = (complaint, oldComplaints) => {
    const updatedComplaints = [...oldComplaints];
    let index = updatedComplaints.findIndex(c => c._id === complaint._id);
    if (index >= 0) updatedComplaints[index] = complaint;
    this.setState({
      complaints: updatedComplaints,
      isLoading: false
    });
  };

  // getting all complaints
  getAllComplaints = async user => {
    this.setState({ isLoading: true });
    const response = await getComplaintsByRole(1, 10, "", "", "", user.role);
    let complaints = response.data;
    let itemsCount = response.headers["itemscount"];

    this.setState({ complaints, itemsCount, isLoading: false });

    const uniqueAssignees = this.getUniqueAssignees(complaints);
    this.setState(prevState => {
      return {
        assignees: uniqueAssignees
      };
    });
  };

  getUniqueAssignees = complaints => {
    if (!complaints.length) return [];
    let arr = [];

    for (let i = 0; i < complaints.length; i++) {
      if (complaints[i].assignedTo) {
        arr.push(complaints[i].assignedTo);
      }
    }

    const uniqueAssignees = _.uniqBy(arr, function(o) {
      return o._id;
    });
    return uniqueAssignees;
  };

  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.setState({ selectedComplaint: complaint, isDetailFormEnabled: true });
  };

  handleClose = () => {
    this.setState({ selectedComplaint: null, isDetailFormEnabled: false });
  };

  // handle Sort
  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  closeComplaintForm = complaint => {
    if (complaint) {
      let { complaints } = this.state;
      complaints.unshift(complaint);
      this.setState({ complaints });
    }
    this.toggleComplaintForm();
  };

  toggleComplaintForm = () => {
    let isFormEnabled = this.state.isFormEnabled;
    let now = !isFormEnabled;
    this.setState({ isFormEnabled: now });
  };
  // render
  render() {
    // get paged data
    const {
      complaints: allComplaints,
      sortColumn,
      assignees,
      notifications,
      isLoading
    } = this.state;
    let { length: count } = this.state.complaints;
    const complaints = _.orderBy(
      allComplaints,
      [sortColumn.path],
      [sortColumn.order]
    );

    // get paged data end
    return (
      <React.Fragment>
        {this.state.selectedComplaint && (
          <ComplaintDetail
            isOpen={this.state.isDetailFormEnabled}
            onClose={this.handleClose}
            complaint={this.state.selectedComplaint}
          />
        )}
        <Navbar
          user={this.state.user}
          assignees={assignees}
          notifications={notifications}
          {...this.props}
        />
        <ComplaintForm
          isOpen={this.state.isFormEnabled}
          onSuccess={this.closeComplaintForm}
          onClose={this.toggleComplaintForm}
        />
        {this.state.isLoading && <Loading />}
        {count < 1 ? (
          <div className="container">
            {isLoading && <Loading />}
            <button
              type="button"
              onClick={this.toggleComplaintForm}
              // to="/complainer/new-complaint"
              className="btn button-primary mb-2"
            >
              New Complaint &rarr;
            </button>
            <h4>There are no complaints in the database</h4>
          </div>
        ) : (
          <div className="container">
            {this.state.analytics &&
              this.state.analytics.monthwise &&
              this.state.analytics.monthwise.length > 0 && (
                <GraphBanner
                  analytics={this.state.analytics}
                  complaints={this.state.complaints}
                />
              )}
            <button
              type="button"
              onClick={this.toggleComplaintForm}
              // to="/complainer/new-complaint"
              className="btn button-primary mb-2"
            >
              New Complaint &rarr;
            </button>
            {complaints.length > 0 && (
              <Complaints
                complaints={complaints}
                itemsCount={this.state.itemsCount}
                uniqueCategories={this.state.analytics.uniqueCategories}
              />
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Complainer;
