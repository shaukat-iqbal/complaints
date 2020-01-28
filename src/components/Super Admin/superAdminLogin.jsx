import React from "react";
import { Link } from "react-router-dom";
import Joi from "joi-browser";
import Loading from "../common/loading";
import "../login.css";
import { superAdminLogin, getCurrentUser } from "../../services/authService";
import Form from "../common/form";

class SuperAdminLogin extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {},
    isLoading: false
  };

  role = React.createRef();

  schema = {
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    password: Joi.string()
      .required()
      .min(5)
      .label("Password")
  };

  componentDidMount() {
    const user = getCurrentUser();
    if (user) this.props.history.replace(`/superAdmin/dashboard`);
  }

  doSubmit = async () => {
    this.setState({ isLoading: true });
    const { data } = this.state;

    try {
      const response = await superAdminLogin(data.email, data.password);
      localStorage.setItem("token", response.headers["x-auth-token"]);
      window.location = "/superAdmin/dashboard";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors, isLoading: false });
      }
    }
  };

  render() {
    return (
      <div className="form_page">
        {this.state.isLoading && <Loading />}

        <div className="vh-100 d-flex justify-content-center align-items-center">
          <div className="card mt-5 card-form loginCard">
            <p class="sign" align="center">
              Sign in
            </p>
            <div className="card-body">
              <form onSubmit={this.handleSubmit}>
                {this.renderInput("email", "Email", "email")}
                {this.renderInput("password", "Password", "password")}

                <div className="form-check ">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="form-check-input"
                  />
                  Remember Me
                </div>
                <button className="submit mt-1" onClick={this.handleSubmit}>
                  Login
                </button>
                <br />
                <Link to={`/recoverpassword/${this.state.data.companyId}`}>
                  Forgot Password?
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SuperAdminLogin;
