import React, { Component } from "react";
import Switch from "../../common/switch";
import {
  updateConfiguration,
  getConfigToken,
  addConfiguration
} from "../../../services/configurationService";
import { toast } from "react-toastify";
import Loading from "../../common/loading";
class Features extends Component {
  state = {
    isSaveEnabled: false
  };

  constructor(props) {
    super(props);
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
        isMessaging: false,
        isSeverity: false
      };
    }
    if (this.props.companyId)
      this.state.updatedConfigObj.companyId = this.props.companyId;
  }

  handleSwitch = name => {
    let val = !this.state.updatedConfigObj[name];
    let updatedConfigObj = this.state.updatedConfigObj;
    updatedConfigObj[name] = val;
    this.setState({ updatedConfigObj, isSaveEnabled: true });
  };

  handleSaveSettings = async () => {
    this.setState({ isLoading: true });
    let { updatedConfigObj } = this.state;
    // if (this.props.companyId && !updatedConfigObj.companyId)
    //   updatedConfigObj.companyId = this.props.companyId;
    try {
      let configuration;
      if (this.props.isStepper) {
        let { data } = await addConfiguration(updatedConfigObj);
        configuration = data;
      } else {
        let { data } = await updateConfiguration(
          updatedConfigObj,
          this.state.configToken._id
        );
        configuration = data;
      }

      localStorage.setItem("configuration", JSON.stringify(configuration));
      toast.info("Settings Updated");
      this.setState({ isLoading: false });

      if (this.props.enableNext) this.props.enableNext();
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 400) {
        toast.warn("Bad request" + error);
      }
      // toast.warn("An Error Occurred");
      this.setState({ isLoading: false });
    }
  };
  render() {
    return (
      <div>
        {this.state.isLoading && <Loading />}
        <div className="d-flex justify-content-end mb-2">
          {this.state.isSaveEnabled && (
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
          className="p-3 mb-4"
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
        <div
          className="p-3 "
          style={{ border: "1px solid #dadce0", borderRadius: "8px" }}
        >
          <p>
            This feature will enable complainer to set the severity of complaint
            by themselves.
          </p>
          <Switch
            label="Severity Feature"
            name="isSeverity"
            onClick={() => {
              this.handleSwitch("isSeverity");
            }}
            checked={this.state.updatedConfigObj.isSeverity}
          />
        </div>
      </div>
    );
  }
}

export default Features;
