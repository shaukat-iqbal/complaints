import React, { Component } from "react";
import RegisterForm from "./Register";
import FileUpload from "./fileUpload";
class Registration extends Component {
  state = { isLoading: false };
  render() {
    return (
      <div className="d-flex justify-content-around flex-wrap">
        <RegisterForm {...this.props} />
        <FileUpload {...this.props} />
      </div>
    );
  }
}

export default Registration;
