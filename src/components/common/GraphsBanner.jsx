import React, { Component } from "react";
import { getCurrentUser } from "../../services/authService";
import BarChart from "../admin/charts/bar";
import LineChart from "../admin/charts/LineChart";
import PieChart from "../admin/charts/pie";
class GraphBanner extends Component {
  state = {};
  constructor(props) {
    super(props);
    let user = getCurrentUser();
    this.state.user = user;
    if (props.complaints && props.complaints.length > 0) {
      this.state.complaints = props.complaints;
      if (user.role !== "admin") {
        let chartData = this.aggregateResolvedComplaints(props.complaints);
        this.state.chartData = chartData;
      }
    }

    if (props.usersCount && props.usersCount.length > 0) {
      this.state.usersCount = props.usersCount;
      if (user.role === "admin") {
        let chartData = {};
        chartData.data = this.state.usersCount;
        chartData.label = "Users Count";
        this.state.chartData = chartData;
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    const complaints = nextProps.complaints;
    if (complaints.length < 1) return;
  }
  componentDidMount() {}

  aggregateResolvedComplaints = complaints => {
    let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < complaints.length; i++) {
      const complaint = complaints[i];
      var complaintDate = new Date(complaint.timeStamp);
      let now = new Date();
      let year = complaintDate.getFullYear();
      if (now.getFullYear() !== year) continue;
      if (complaint.status !== "in-progress") {
        let index = complaintDate.getMonth();
        months[index]++;
        console.log("from inside");
      }
    }
    console.log(months);
    let chartData = {};
    chartData.data = months;
    chartData.label = "Resolved Complaints";
    return chartData;
  };

  render() {
    return (
      <div className="row mb-3">
        <div className="col-md-4">
          <BarChart complaints={this.state.complaints} />
        </div>
        {this.state.chartData && (
          <div className="col-md-4  ">
            <LineChart chartData={this.state.chartData} />
          </div>
        )}
        <div className="col-md-4  ">
          <PieChart complaints={this.state.complaints} />
        </div>
      </div>
    );
  }
}

export default GraphBanner;
