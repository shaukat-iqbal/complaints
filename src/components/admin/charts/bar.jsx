import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import { calculateAggregate } from "../../../services/complaintService";

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
    const datasets = { ...this.state.chartData.datasets };
    datasets[0].data = nextProps.monthwiseComplaints;
    this.setState({ datasets });
  }

  // componentDidMount() {
  //   //props say categories lain
  //   // const { data: complaints } = await getAdminComplaints();
  //   const complaints = this.props.complaints;
  //   if (complaints.length < 1) return;
  //   this.aggregateData();
  // }

  componentDidMount() {
    const datasets = { ...this.state.chartData.datasets };
    datasets[0].data = this.props.monthwiseComplaints;
    this.setState({ datasets });
  }

  // aggregateData = async () => {
  //   let { data } = await calculateAggregate();
  //   console.log(data);
  //   const datasets = { ...this.state.chartData.datasets };
  //   datasets[0].data = data.monthwise;
  //   this.setState({ datasets });
  // };

  render() {
    return (
      <div className="card bg-light border border-dark">
        <div className="container py-3">
          <Bar
            data={this.state.chartData}
            width={130}
            height={70}
            options={{
              maintainAspectRatio: true
            }}
            // options={}
          />
        </div>
      </div>
    );
  }
}

export default BarChart;
