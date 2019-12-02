import React, { Component } from "react";
import "./dashboardCards.css";
class DashboardCards extends Component {
  state = {};
  handleClick = sortKeyword => {
    this.setState({ sortKeyword });
  };
  render() {
    const { positive, negative, delayed, total, onClick } = this.props;
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 p-1 pr-2">
            <div
              className=" dashboardcard"
              onClick={() => {
                onClick(1);
              }}
            >
              <div className="icon icon1">
                <i className="fa fa-thumbs-up fa-2x"></i>
              </div>
              <div className="info info1">
                <h5>{positive}</h5>
                <p>Positive Feedback</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 p-1 pr-2">
            <div
              className="dashboardcard "
              onClick={() => {
                onClick(2);
              }}
            >
              <div className="icon icon2">
                <i className="fa fa-thumbs-down fa-2x"></i>
              </div>
              <div className="info info2">
                <h5>{negative}</h5>
                <p>Negative Feedback</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 p-1 pr-2">
            <div
              className=" dashboardcard "
              onClick={() => {
                onClick(3);
              }}
            >
              <div className="icon icon3">
                <i className="fa fa-clock-o fa-2x"></i>
              </div>
              <div className="info info3">
                <h5>{delayed}</h5>
                <p>Delayed Complaints</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 p-1 pr-2">
            <div
              className=" dashboardcard "
              onClick={() => {
                onClick(4);
              }}
            >
              <div className="icon icon4">
                <i className="fa fa-archive fa-2x"></i>
              </div>
              <div className="info info4">
                <h5>{total}</h5>
                <p>Total Complaints </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardCards;
