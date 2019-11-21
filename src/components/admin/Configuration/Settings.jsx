import React, { Component } from "react";
import Attachments from "../Attachments/Attachments";
import Members from "../Higher Authorities/Members";

import Features from "./Features";

class Settings extends Component {
  state = {
    showHigherAuthoritiesList: false,
    showAttachmentsList: false,
    isSave: false
  };

  handleViewList = () => {
    let val = !this.state.showHigherAuthoritiesList;
    this.setState({ showHigherAuthoritiesList: val });
  };

  handleViewAttachmentsList = () => {
    let val = !this.state.showAttachmentsList;
    this.setState({ showAttachmentsList: val });
  };

  render() {
    return (
      <>
        <div className="container">
          <Features />

          <div className="px-1 py-3">
            <div>
              <p className="d-inline-block mr-2">Higher Authorities: </p>
              <span>
                <button className="btn p-0 m-0" onClick={this.handleViewList}>
                  <i className="fa fa-eye "></i>
                </button>
              </span>

              {this.state.showHigherAuthoritiesList && <Members />}
            </div>
            <div>
              <p className="d-inline-block mr-2">Allowed Attachments: </p>
              <span>
                <button
                  className="btn p-0 m-0"
                  onClick={this.handleViewAttachmentsList}
                >
                  <i className="fa fa-eye "></i>
                </button>
              </span>

              {this.state.showAttachmentsList && <Attachments />}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Settings;
