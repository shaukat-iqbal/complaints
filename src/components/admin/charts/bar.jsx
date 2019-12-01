import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import { getAdminComplaints } from "../../../services/complaintService";

class BarChart extends Component {
  state = {
    chartData: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec"
      ],
      datasets: [
        {
          label: "Month Wise Complaints",
          data: [],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 220, 1)",
            "rgba(16, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(202, 32, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ]
        }
      ]
    },
    complaints: []
  };
  componentWillReceiveProps(nextProps) {
    const complaints = nextProps.complaints;
    if (complaints.length < 1) return;
    this.aggregateData(complaints);
  }
  componentDidMount() {
    //props say categories lain
    // const { data: complaints } = await getAdminComplaints();
    const complaints = this.props.complaints;
    if (complaints.length < 1) return;
    this.aggregateData(complaints);
  }

  aggregateData = complaints => {
    let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < complaints.length; i++) {
      const element = complaints[i];
      var date = new Date(element.timeStamp);
      let index = date.getMonth();
      months[index]++;
    }
    const datasets = { ...this.state.chartData.datasets };
    datasets[0].data = months;
    this.setState({ datasets, complaints });
  };

  render() {
    return (
      <div className="card bg-light border border-dark">
        <div className="container py-3">
          {this.state.complaints.length === 0 && (
            <h3>There are no In-Progress Complaints</h3>
          )}
          {this.state.complaints.length > 0 && (
            <Bar
              data={this.state.chartData}
              width={130}
              height={70}
              options={{
                maintainAspectRatio: true
              }}
              // options={}
            />
          )}
        </div>
      </div>
    );
  }
}

export default BarChart;
