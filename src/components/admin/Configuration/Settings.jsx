import React, { Component } from "react";
import Attachments from "../Attachments/Attachments";
import Switch from "../../common/switch";
import Members from "../Higher Authorities/Members";
class Settings extends Component {
  state = {
    showHigherAuthoritiesList: false,
    showAttachmentsList: false
  };

  handleViewList = () => {
    let val = !this.state.showHigherAuthoritiesList;
    this.setState({ showHigherAuthoritiesList: val });
  };

  handleViewAttachmentsList = () => {
    let val = !this.state.showAttachmentsList;
    this.setState({ showAttachmentsList: val });
  };

  handleSwitch = name => {
    let val = !this.state[name];
    this.setState({ [name]: val });
    alert(name);
  };

  render() {
    return (
      <div className="container">
        <h3 className="text-center">Configuration</h3>
        <div className="p-5 ">
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
          <div>
            <div>
              <Switch
                label="Account Creation By Public"
                name="accountCreation"
                onClick={() => {
                  this.handleSwitch("accountCreation");
                }}
              />
            </div>
            <div>
              <Switch
                label="Messaging feature"
                name="messaging"
                onClick={() => {
                  this.handleSwitch("messaging");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
