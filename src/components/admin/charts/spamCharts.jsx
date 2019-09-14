import React, { Component } from "react";
import { Pie } from "react-chartjs-2";
import { getAllSpamComplaints } from "../../../services/complaintService";

class SpamChart extends Component {
  state = {
    chartData: {
      labels: [
        "January",
        "Febrauary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      datasets: [
        {
          label: "Spam Complaints",
          data: [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ]
        }
      ]
    },
    complaints: []
  };

  async componentDidMount() {
    const { data: complaints } = await getAllSpamComplaints();
    this.setState({ complaints: complaints });

    let janCount = 0;
    let febCount = 0;
    let marchCount = 0;
    let aprilCount = 0;
    let mayCount = 0;
    let junCount = 0;
    let julCount = 0;
    let augCount = 0;
    let sepCount = 0;
    let octCount = 0;
    let novCount = 0;
    let decCount = 0;

    for (let i = 0; i < complaints.length; i++) {
      const element = complaints[i];
      var date = new Date(element.timeStamp);

      if (date.getMonth() === 0) janCount++;
      else if (date.getMonth() === 1) febCount++;
      else if (date.getMonth() === 2) marchCount++;
      else if (date.getMonth() === 3) aprilCount++;
      else if (date.getMonth() === 4) mayCount++;
      else if (date.getMonth() === 5) junCount++;
      else if (date.getMonth() === 6) julCount++;
      else if (date.getMonth() === 7) augCount++;
      else if (date.getMonth() === 8) sepCount++;
      else if (date.getMonth() === 9) octCount++;
      else if (date.getMonth() === 10) novCount++;
      else if (date.getMonth() === 11) decCount++;
    }
    const data = [
      janCount,
      febCount,
      marchCount,
      aprilCount,
      mayCount,
      junCount,
      julCount,
      augCount,
      sepCount,
      octCount,
      novCount,
      decCount
    ];

    const datasets = { ...this.state.chartData.datasets };
    datasets[0].data = data;
    this.setState({ datasets });
  }

  render() {
    return (
      <div className="card bg-light border border-dark">
        <div className="container mt-3">
          {this.state.complaints.length === 0 && (
            <h3>There are no Spam Complaints</h3>
          )}
          {this.state.complaints.length > 0 &&
            this.state.chartData.datasets[0].data.length > 0 && (
              <Pie
                data={this.state.chartData}
                width={130}
                height={50}
                options={{
                  maintainAspectRatio: true,
                  title: { display: true, text: "Spam Complaintsss" },
                  legend: { display: true, position: "top" }
                }}
                // options={}
              />
            )}
        </div>
      </div>
    );
  }
}

export default SpamChart;
