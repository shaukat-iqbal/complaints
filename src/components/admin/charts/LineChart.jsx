import React, { Component } from "react";
import { Line } from "react-chartjs-2";

class LineChart extends Component {
  state = {
    chartData: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      datasets: [
        {
          label: "",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: []
        }
      ]
    },
    complaints: []
  };

  componentWillReceiveProps(nextProps) {
    const data = nextProps.chartData;
    if (!data) return;
    const { chartData } = this.state;
    chartData.datasets[0].data = data.data;
    chartData.datasets[0].label = data.label;
    this.setState({ chartData });
  }

  componentDidMount() {
    const data = this.props.chartData;
    if (!data) return;
    const { chartData } = this.state;
    chartData.datasets[0].data = data.data;
    chartData.datasets[0].label = data.label;
    this.setState({ chartData });
  }

  render() {
    const { data } = this.state.chartData.datasets[0];
    return (
      <div className="card bg-light border border-dark">
        <div className="container py-3">
          {data.length === 0 && <h3>There are no Resolved Complaints</h3>}
          {data.length > 0 && (
            <Line
              data={this.state.chartData}
              width={130}
              height={70}
              options={{ maintainAspectRatio: true }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default LineChart;
