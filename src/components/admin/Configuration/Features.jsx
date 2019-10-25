import React, { Component } from "react";
import Switch from "../../common/switch";
import {
  updateConfiguration,
  getConfigToken
} from "../../../services/configurationService";
import { toast } from "react-toastify";
class Features extends Component {
  state = {
    isSave: false
  };

  constructor() {
    super();
    let configToken = getConfigToken();
    if (configToken) {
      let updatedConfigObj = { ...configToken };
      delete updatedConfigObj._id;
      delete updatedConfigObj.__v;
      this.state.configToken = configToken;
      this.state.updatedConfigObj = updatedConfigObj;
    } else {
      this.state.updatedConfigObj = {
        isAccountCreation: false,
        isMessaging: false
      };
    }
  }
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
      <div>
        <div className="d-flex justify-content-end mb-2">
          {this.state.isSave && (
            <button
              className="btn btn-primary btn-sm"
              onClick={this.handleSaveSettings}
            >
              Save Settings
            </button>
          )}
        </div>
        <div
          className="p-3 mb-4"
          style={{ border: "1px solid #dadce0", borderRadius: "8px" }}
        >
          <p>
            This feature will enable you to let Public create accounts <br></br>{" "}
            on your system.
          </p>

          <Switch
            label="Account Creation By Public"
            name="isAccountCreation"
            onClick={() => {
              this.handleSwitch("isAccountCreation");
            }}
            checked={this.state.updatedConfigObj.isAccountCreation}
          />
        </div>
        <div
          className="p-3"
          style={{ border: "1px solid #dadce0", borderRadius: "8px" }}
        >
          <p>
            This feature will enable complainer and assignee to have <br />
            conversation on a complaint.
          </p>
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
    );
  }
}

export default Features;
