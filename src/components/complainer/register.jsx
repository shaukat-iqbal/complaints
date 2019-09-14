import React from "react";
import Joi from "joi-browser";
import Form from "../common/form";
import * as userService from "../../services/userService.js";

class Register extends Form {
  state = {
    data: { name: "", password: "", email: "" },
    errors: {}
  };

  schema = {
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    password: Joi.string()
      .required()
      .min(5)
      .label("Password"),
    name: Joi.string()
      .required()
      .label("Name")
  };

  doSubmit = async () => {
    // call to the server
    try {
      await userService.register(this.state.data);
      this.props.history.replace("/");
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
    console.log("Login is submitted");
  };

  render() {
    return (
      <React.Fragment>
        <div className=" mt-5 d-flex justify-content-center align-items-center">
          <div className="card mt-5 card-form ">
            <div className="card-header h3">Registration Form</div>
            <div className="card-body">
              <br />
              <form onSubmit={this.handleSubmit}>
                {this.renderInput("email", "Email", "email")}
                {this.renderInput("password", "Password", "password")}
                {this.renderInput("name", "Name", "text")}

                <div className="text-center">
                  {this.renderButton("Register")}
                </div>
                <br />

                <br />
              </form>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Register;
