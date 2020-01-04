import React, { Component } from "react";
import {
  getComplaintsByRole,
  segmentsCount,
  calculateAggregate
} from "../../../services/complaintService";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner/Spinner";
import GraphBanner from "../../common/GraphsBanner";
import DashboardCards from "../DashboardCards";
import Complaints from "../../common/Complaints";
import { getCurrentUser } from "../../../services/authService";
import config from "../../../config.json";
const socket = openSocket(config.apiEndpoint);

class Dashboard extends Component {
  state = {
    complaints: [],
    categories: [],
    selectedComplaints: [],
    isLoading: false,
    analytics: {}
  };
  // async componentDidUpdate(prevProps, prevState) {
  //   if (prevState.complaints.length < this.state.complaints) {
  //     let { data: months } = await countComplainers();
  //     this.setState({ countUsers: months });
  //   }
  // }

  async componentDidMount() {
    this.setState({ isLoading: true });
    segmentsCount().then(({ data: segments }) => {
      this.setState({
        segments
      });
    });

    this.getComplaints();
    calculateAggregate().then(({ data }) => {
      this.setState({ analytics: data });
    });
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
    const { complaints, analytics, segments } = this.state;
    const updatedComplaints = [...complaints];
    updatedComplaints.unshift(complaint);
    segments.totalComplaints += 1;
    analytics.summary.inProgress += 1;
    let date = new Date(complaint.timeStamp);
    analytics.monthwise[date.getMonth()] += 1;
    this.setState({
      isLoading: false,
      complaints: updatedComplaints,
      selectedComplaints: updatedComplaints,
      segments,
      analytics
    });
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
    const response = await getComplaintsByRole();
    let complaints = response.data;
    let itemsCount = response.headers["itemscount"];
    this.setState({
      complaints,
      selectedComplaints: complaints,
      itemsCount,
      isLoading: false
    });

    // this.aggregateMonthWiseComplaints(complaints);
  };
  // getSegmentedComplaints= async ()=>{

  // }
  handleSelectedComplaints = async index => {
    // console.log(index);
    // let selectedComplaints = [];
    // switch (index) {
    //   case 1:
    //     selectedComplaints =
    //     await getPositiveFeedbackComplaints();
    //     break;
    //   case 2:
    //     selectedComplaints = this.state.negativeFeedback;
    //     break;
    //   case 3:
    //     selectedComplaints = this.state.delayed;
    //     break;
    //   case 4:
    //     selectedComplaints = this.state.complaints;
    //     break;
    //   default:
    //     break;
    // }
    // this.setState({ selectedComplaints });
  };

  // segmentsCount = complaints => {
  //   let config = getConfigToken();
  //   let delayedDays = 5;
  //   if (config.delayedDays) delayedDays = +config.delayedDays;
  //   let positiveFeedback = [],
  //     delayed = [],
  //     negativeFeedback = [],
  //     spamComplaints = [];
  //   complaints.forEach(complaint => {
  //     if (complaint.spam) spamComplaints.push(complaint);
  //     let days = this.calculateDays(complaint.timeStamp) + 1;
  //     if (days > delayedDays) {
  //       delayed.push(complaint);
  //     }
  //     if (complaint.feedbackTags) {
  //       if (complaint.feedbackTags === "satisfied")
  //         positiveFeedback.push(complaint);
  //       else negativeFeedback.push(complaint);
  //     }
  //   });
  //   this.setState({
  //     positiveFeedback,
  //     negativeFeedback,
  //     delayed,
  //     spamComplaints
  //   });
  // };

  // render
  render() {
    // get paged data

    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <div className="container d-flex justify-content-center  ">
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
        <div className="container">
          {this.state.analytics &&
            this.state.analytics.monthwise &&
            this.state.analytics.monthwise.length > 0 && (
              <GraphBanner
                analytics={this.state.analytics}
                usersCount={this.state.analytics.usersCount}
              />
            )}

          {this.state.segments && (
            <div className="mb-3">
              <DashboardCards
                positive={this.state.segments.positiveFeedback}
                negative={this.state.segments.negativeFeedback}
                spam={this.state.segments.spamComplaints}
                delayed={this.state.segments.delayedComplaints}
                total={this.state.segments.totalComplaints}
                onClick={this.handleSelectedComplaints}
              />
            </div>
          )}
          {this.state.selectedComplaints.length > 0 && (
            <Complaints
              complaints={this.state.selectedComplaints}
              categories={this.state.categories}
              itemsCount={this.state.itemsCount}
              uniqueCategories={this.state.analytics.uniqueCategories}
            />
          )}
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
