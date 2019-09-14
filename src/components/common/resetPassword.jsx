import React from "react";
import { getCurrentUser } from "../../services/authService";
import { getProfilePicture, resetPassword } from "../../services/userService";
import { Avatar } from "@material-ui/core";
import Joi from "joi-browser";
import Form from "./form";
class ResetPassword extends Form {
  state = {
    user: getCurrentUser(),
    profilePicture: getProfilePicture(),
    data: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    errors: {}
  };

  validatePassword = () => {
    const pass = this.state.data.newPassword;
    const confirmPass = this.state.data.confirmNewPassword;
    if (pass !== confirmPass) {
      return "Passwords mismatch";
    }
    return null;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];
    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  schema = {
    currentPassword: Joi.string()
      .min(9)
      .required(),
    newPassword: Joi.string()
      .min(9)
      .required(),
    confirmNewPassword: Joi.string()
      .min(9)
      .required()
  };

  handleCancel = () => {
    this.props.history.goBack();
  };
  doSubmit = async () => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validatePassword();

    if (errorMessage) {
      errors.newPassword = errorMessage;
      this.setState({ errors });
      return;
    }

    const body = {
      id: this.state.user._id,
      role: this.state.user.role,
      currentPassword: this.state.data.currentPassword,
      newPassword: this.state.data.newPassword
    };
    console.log(body);
    try {
      const { data: response } = await resetPassword(body);
      alert(response);
      this.props.history.goBack();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = this.state.errors;
        errors.currentPassword = "Current Password did not match";
        this.setState({ errors });
      }
    }
  };

  render() {
    const { user, profilePicture } = this.state;
    return (
      <div
        className=" d-flex align-items-center justify-content-center "
        style={{ height: "600px" }}
      >
        <div className="card w-50" style={{ minWidth: "500px" }}>
          <div className="pt-3 px-2">
            <div className="mx-1 border-bottom">
              <strong>Update Password </strong>
            </div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="card-body pt-2 px-4">
              <div className="container">
                <div className="row">
                  <div className="col-8 p-3 d-flex flex-row ">
                    <div>
                      <i className="fa fa-key"></i>
                    </div>
                    <div className=" pl-1">
                      <div className="d-inline">
                        <strong style={{ fontSize: "14px" }}>
                          Kindly Enter required details to update your account
                          password
                        </strong>
                        <br></br>
                        <div className="row mt-3"></div>
                        {this.renderInput(
                          "currentPassword",
                          "Current Password",
                          "password"
                        )}
                        {this.renderInput(
                          "newPassword",
                          "New Password",
                          "password"
                        )}
                        {this.renderInput(
                          "confirmNewPassword",
                          "Confirm New Password",
                          "password"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-4 border-left">
                    <div className="my-5 ml-3">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          width="80px"
                          height="80px"
                          alt="userProfile"
                        />
                      ) : (
                        <Avatar>{user.name.substring(0, 1)}</Avatar>
                      )}
                      {user.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer py-2 d-flex justify-content-end">
              {this.renderButton("Send")}
              <button
                className="ml-1 btn btn-sm btn-danger"
                type="button"
                onClick={this.handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
