import React from "react";
import { Link } from "react-router-dom";
import Joi from "joi-browser";
import Form from "./common/form";
import Loading from "./common/loading";
import Companies from "./common/companies";
import auth, { getCurrentUser } from "../services/authService";
import { getConfiguration } from "../services/configurationService";
import "./login.css";
class Login extends Form {
  state = {
    data: { email: "", password: "", companyId: null },
    errors: {},
    showCompaniesDialog: true,
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
      .label("Password"),
    companyId: Joi.string().required()
  };

  async componentDidMount() {
    try {
      const user = await auth.getCurrentUser();
      if (!this.state.data.companyId) {
        this.setState({ showCompaniesDialog: true });
        return;
      }

      this.props.history.replace(`/${user.role}`);
    } catch (ex) {
      // toast.warn("Authentication Failed");
      // console.log(ex);
    }
  }

  doSubmit = async () => {
    const { data } = this.state;
    const role = this.role.current.value;
    // localStorage.setItem("login", role);
    try {
      const response = await auth.login(
        data.email,
        data.password,
        data.companyId,
        `/auth-${role}`
      );
      // const { data: configuration } = await getConfiguration();
      // localStorage.setItem("configuration", JSON.stringify(configuration));
      localStorage.setItem("token", response.headers["x-auth-token"]);
      window.location = `/${role}`;
      this.setState({ isLoading: true });
      // this.props.history.push('/complainer');
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }

    // this.props.history.push('/complainer');
  };
  handleOnCompanySelection = async id => {
    const data = { ...this.state.data };
    data.companyId = id;
    console.log(data);
    this.setState({ data, showCompaniesDialog: false });

    try {
      let { data: config } = await getConfiguration(id);
      localStorage.setItem("configuration", JSON.stringify(config));
      this.setState({ configToken: config });
      let user = getCurrentUser();
      if (user) {
        this.props.history.replace(`/${user.role}`);
      }
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 404) {
        window.location = "/welcome/" + id;
      }
    }
  };
  render() {
    let { configToken } = this.state;
    return (
      <div className="form_page">
        <div>
          {this.state.isLoading && (
            <div className="d-flex justify-content-center mt-5">
              <Loading />
            </div>
          )}
        </div>

        {!this.state.isLoading && (
          <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="card mt-5 card-form loginCard">
              <p class="sign" align="center">
                Sign in
              </p>
              <div className="card-body">
                <br />
                <form onSubmit={this.handleSubmit}>
                  {this.renderInput("email", "Email", "email")}
                  {this.renderInput("password", "Password", "password")}
                  {!this.state.showCompaniesDialog ? (
                    <button
                      className="btn button-primary mb-3"
                      type="button"
                      hidden={this.state.showCompaniesDialog}
                      onClick={() => {
                        this.setState({ showCompaniesDialog: true });
                      }}
                    >
                      &larr; &nbsp; Select Company
                    </button>
                  ) : (
                    <Companies
                      isLoading={true}
                      onCompanySelection={this.handleOnCompanySelection}
                      isOpen={this.state.showCompaniesDialog}
                    />
                  )}
                  <label htmlFor="role">Choose Role</label>
                  <select
                    ref={this.role}
                    name="role"
                    className="form-control mb-4"
                  >
                    <option value="assignee">Assignee</option>
                    <option value="complainer" selected>
                      Complainer
                    </option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="form-check ">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="form-check-input"
                    />
                    Remember Me
                  </div>
                  <div className="">
                    <button className="submit" onClick={this.handleSubmit}>
                      Login
                    </button>
                  </div>
                  <br />
                  <Link to="/recoverpassword">Forgot Password?</Link>
                  <br />
                  {configToken && configToken.isAccountCreation && (
                    <Link to="/register">
                      Not Registered? Register by clicking here.
                    </Link>
                  )}
                  <br />
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Login;
