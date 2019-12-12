import React, { Component } from "react";
import { getAdminComplaints } from "../../../services/complaintService";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner/Spinner";
import GraphBanner from "../../common/GraphsBanner";
import { countComplainers } from "../../../services/complainerService";
import DashboardCards from "../DashboardCards";
import Complaints from "../../common/Complaints";
import { getConfigToken } from "../../../services/configurationService";
import { getCurrentUser } from "../../../services/authService";
import config from "../../../config.json";
const socket = openSocket(config.apiEndpoint);

class Dashboard extends Component {
  state = {
    complaints: [],
    categories: [],
    selectedComplaints: [],
    isLoading: false
  };
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.complaints.length < this.state.complaints) {
      let { data: months } = await countComplainers();
      this.setState({ countUsers: months });
    }
  }

  async componentDidMount() {
    this.getComplaints();
    this.checkingSocketConnection();
  }
  componentWillUnmount() {
    socket.disconnect(true);
  }

  checkingSocketConnection = () => {
    let user = getCurrentUser();
    socket.on("complaints", data => {
      console.log(data);
      if (user.companyId !== data.notification.companyId) {
        return;
      }

      if (data.action === "new complaint") {
        this.createNewComplaint(data.complaint);
        toast.info(
          `New Complaint has been registered with title "${data.complaint.title}"`
        );
      } else if (data.action === "drop") {
        toast.warn(
          `Assignee has dropped responsibility with complaint title: "${data.complaint.title}" `
        );
        this.replaceUpdatedComplaint(data.complaint);

        // this.createNewComplaint(data.complaint);
      } else if (data.action === "status changed") {
        toast.info(
          `Complaints: "${data.complaint.title}'s" status is changed to  "${data.complaint.status}" `
        );
        this.replaceUpdatedComplaint(data.complaint);
      } else if (data.action === "feedback") {
        this.replaceUpdatedComplaint(data.complaint);
        toast.info(
          `Complainer has given feedback on Complaint with title "${data.complaint.title}"`
        );
      } else if (data.action === "task assigned") {
        this.replaceUpdatedComplaint(data.complaint);
      } else {
        console.log(data.complaint);
        let { selectedComplaints } = this.state;
        let index = selectedComplaints.findIndex(
          c => c._id == data.complaint._id
        );
        if (index >= 0) {
          selectedComplaints[index] = data.complaint;

          console.log(selectedComplaints[index]);
        }
        this.setState({ selectedComplaints });
      }
    });

    socket.on("msg", data => {
      if (data.receiver === getCurrentUser()._id) {
        toast.info("New Message");
      }
    });
  };

  //componentWillUnmount() {
  // socket.disconnect(true);
  //}
  // create new complaint that is created now
  createNewComplaint = complaint => {
    const updatedComplaints = [...this.state.complaints];
    updatedComplaints.unshift(complaint);
    this.countFeedbacks(updatedComplaints);

    this.setState({ isLoading: false, complaints: updatedComplaints });
  };

  replaceUpdatedComplaint = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      let index = updatedComplaints.findIndex(c => c._id === complaint._id);
      if (index >= 0) updatedComplaints[index] = complaint;
      const updatedSelectedComplaints = [...prevState.selectedComplaints];
      index = updatedSelectedComplaints.findIndex(c => c._id === complaint._id);
      if (index >= 0) updatedSelectedComplaints[index] = complaint;
      return {
        complaints: updatedComplaints,
        isLoading: false,
        selectedComplaints: updatedSelectedComplaints
      };
    });
  };
  // get complaints
  getComplaints = async () => {
    this.setState({ isLoading: true });
    let { data: months } = await countComplainers();
    const { data: complaints } = await getAdminComplaints();
    let temp = [];
    complaints.forEach(complaint => {
      let available = temp.find(ca => ca._id === complaint.category._id);
      if (!available) temp.push(complaint.category);
    });
    const categories = [{ _id: "", name: "All Categories" }, ...temp];
    this.countFeedbacks(complaints);
    this.setState({
      isLoading: false,
      complaints,
      selectedComplaints: complaints,
      categories,
      countUsers: months
    });
    // this.aggregateMonthWiseComplaints(complaints);
  };

  calculateDays = stamp => {
    var date = new Date(stamp);
    let d = new Date();
    let days =
      Math.ceil(Math.abs(d.getTime() - date.getTime()) / (1000 * 3600 * 24)) -
      1;
    return days;
  };

  handleSelectedComplaints = index => {
    console.log(index);
    let selectedComplaints = [];
    switch (index) {
      case 1:
        selectedComplaints = this.state.positiveFeedback;
        break;
      case 2:
        selectedComplaints = this.state.negativeFeedback;
        break;
      case 3:
        selectedComplaints = this.state.delayed;
        break;
      case 4:
        selectedComplaints = this.state.complaints;
        break;

      default:
        break;
    }
    this.setState({ selectedComplaints });
  };

  countFeedbacks = complaints => {
    let config = getConfigToken();
    let delayedDays = 5;
    if (config.delayedDays) delayedDays = +config.delayedDays;
    let positiveFeedback = [],
      delayed = [],
      negativeFeedback = [],
      spamComplaints = [];
    complaints.forEach(complaint => {
      if (complaint.spam) spamComplaints.push(complaint);
      let days = this.calculateDays(complaint.timeStamp) + 1;
      if (days > delayedDays) {
        delayed.push(complaint);
      }
      if (complaint.feedbackTags) {
        if (complaint.feedbackTags === "satisfied")
          positiveFeedback.push(complaint);
        else negativeFeedback.push(complaint);
      }
    });
    this.setState({
      positiveFeedback,
      negativeFeedback,
      delayed,
      spamComplaints
    });
  };

  // render
  render() {
    // get paged data

    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <div className="container d-flex  justify-content-center  ">
          {this.state.isLoading ? (
            <div className="d-flex justify-content-center mt-5">
              <Spinner />
            </div>
          ) : (
            <h4>There are no complaints.</h4>
          )}
        </div>
      );
    }

    return (
      <React.Fragment>
        {/* {this.state.isLoading && (
          <div className="d-flex justify-content-center mt-5">
            <Spinner />
          </div>
        )} */}

        {/* <Showcase resolved={resolved} inprogress={inprogress} closed={closed} /> */}
        <div className="container">
          {/* {this.state.isLoading && (
            <div className="d-flex justify-content-center">
              <Loading />
            </div>
          )} */}
          {this.state.complaints.length > 0 && (
            <GraphBanner
              complaints={this.state.complaints}
              usersCount={this.state.countUsers}
            />
          )}

          {this.state.complaints.length > 0 && (
            <div className="mb-3">
              <DashboardCards
                positive={this.state.positiveFeedback.length}
                negative={this.state.negativeFeedback.length}
                spam={this.state.spamComplaints.length}
                delayed={this.state.delayed.length}
                total={this.state.complaints.length}
                onClick={this.handleSelectedComplaints}
              />
            </div>
          )}
          {
            <Complaints
              complaints={this.state.selectedComplaints}
              categories={this.state.categories}
            />
          }
        </div>
      </React.Fragment>
    );
  }
}

export default Dashboard;

// aggregateMonthWiseComplaints = complaints => {
//   let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//   for (let i = 0; i < complaints.length; i++) {
//     const complaint = complaints[i];
//     var date = new Date(complaint.timeStamp);
//     let now = new Date();
//     let year = date.getFullYear();
//     if (now.getFullYear() !== year) continue;
//     let index = date.getMonth();
//     months[index]++;
//   }
//   let chartData = {};
//   chartData.data = months;
//   chartData.label = "Monthly Complaints";
//   this.setState({ chartData, complaints });
// };
