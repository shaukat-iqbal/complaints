import React, { Component } from "react";
import Attachments from "../Attachments/Attachments";
import Switch from "../../common/switch";
import Members from "../Higher Authorities/Members";
import { toast } from "react-toastify";
import {
  getConfigToken,
  updateConfiguration
} from "../../../services/configurationService";

class Settings extends Component {
  state = {
    showHigherAuthoritiesList: false,
    showAttachmentsList: false,
    isSave: false
  };
  constructor() {
    super();
    let configToken = getConfigToken();
    let updatedConfigObj = { ...configToken };
    delete updatedConfigObj._id;
    delete updatedConfigObj.__v;
    this.state.configToken = configToken;
    this.state.updatedConfigObj = updatedConfigObj;
  }
  handleViewList = () => {
    let val = !this.state.showHigherAuthoritiesList;
    this.setState({ showHigherAuthoritiesList: val });
  };

  handleViewAttachmentsList = () => {
    let val = !this.state.showAttachmentsList;
    this.setState({ showAttachmentsList: val });
  };

  handleSwitch = name => {
    let val = !this.state.updatedConfigObj[name];
    let updatedConfigObj = this.state.updatedConfigObj;
    updatedConfigObj[name] = val;
    this.setState({ updatedConfigObj, isSave: true });
  };

  handleSaveSettings = async () => {
    try {
      let { data: configuration } = await updateConfiguration(
        this.state.updatedConfigObj,
        this.state.configToken._id
      );
      localStorage.setItem("configuration", JSON.stringify(configuration));
      toast.info("Settings Updated");
    } catch (error) {
      toast.warn("An Error Occurred");
    }
  };
  render() {
    return (
      <div className="container">
        <h3 className="text-center">Configuration</h3>
        <div className="d-flex justify-content-end">
          {this.state.isSave && (
            <button
              className="btn btn-primary btn-sm"
              onClick={this.handleSaveSettings}
            >
              Save Settings
            </button>
          )}
        </div>
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
                name="isAccountCreation"
                onClick={() => {
                  this.handleSwitch("isAccountCreation");
                }}
                checked={this.state.updatedConfigObj.isAccountCreation}
              />
            </div>
            <div>
              <Switch
                label="Messaging feature"
                name="isMessaging"
                onClick={() => {
                  this.handleSwitch("isMessaging");
                }}
                checked={this.state.updatedConfigObj.isMessaging}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
