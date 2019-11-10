import React, { Component } from "react";
import { Pie } from "react-chartjs-2";

class PieChart extends Component {
  state = {
    chartData: {
      labels: ["In-progress", "Closed", "Spam"],
      datasets: [
        {
          label: "Complaints Summary",
          data: [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",

            "rgba(54, 162, 235, 1)",

            "rgba(255, 159, 64, 1)"
          ]
        }
      ]
    },
    complaints: []
  };

  //WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  componentWillReceiveProps(nextProps) {
    const complaints = nextProps.complaints;
    if (complaints.length < 1) return;
    this.aggregateData(complaints);
  }
  async componentDidMount() {
    //props say categories lain
    // const { data: complaints } = await getAdminComplaints();
    const complaints = this.props.complaints;
    if (complaints.length < 1) return;
    this.aggregateData(complaints);
  }
  aggregateData = complaints => {
    let resolved = 0,
      spam = 0,
      inProgress = 0;
    // console.log(complaints);
    complaints.forEach(complaint => {
      if (complaint.spam) {
        spam++;
      } else {
        if (complaint.status.trim() === "in-progress") inProgress++;
        else resolved++;
      }
    });
    // console.log(inProgress, resolved, spam);
    let data = [inProgress, resolved, spam];
    const datasets = { ...this.state.chartData.datasets };
    datasets[0].data = data;
    this.setState({ datasets, complaints });
  };
  render() {
    return (
      <div className="card bg-light border border-dark">
        <div className="container py-3 ">
          {this.state.complaints.length < 1 && (
            <h5>There are no Spam Complaints</h5>
          )}
          {this.state.complaints.length > 0 &&
            this.state.chartData.datasets[0].data.length > 0 && (
              <Pie
                data={this.state.chartData}
                width={130}
                height={70}
                options={{
                  maintainAspectRatio: true,
                  title: { display: true, text: "Complaints Summary" },
                  legend: { display: true, position: "left" }
                }}
                // options={}
              />
            )}
        </div>
      </div>
    );
  }
}

export default PieChart;
