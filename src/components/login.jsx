import React from "react";
import { Link } from "react-router-dom";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import Spinner from "../components/common/Spinner/Spinner";
class Login extends Form {
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

  async componentDidMount() {
    try {
      const user = await auth.getCurrentUser();
      this.props.history.replace(`/${user.role}`);
    } catch (ex) {}
  }

  doSubmit = async () => {
    const { data } = this.state;
    const role = this.role.current.value;
    localStorage.setItem("login", role);
    try {
      const response = await auth.login(
        data.email,
        data.password,
        `/auth-${role}`
      );
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

  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.isLoading && (
            <div className="d-flex justify-content-center mt-5">
              <Spinner />
            </div>
          )}
        </div>
        {!this.state.isLoading && (
          <div>
            <div className="mt-5 d-flex justify-content-center align-items-center">
              <div
                className="card mt-5 card-form"
                style={{ boxShadow: "5px 5px 25px 5px #e5e5e5" }}
              >
                <div className="card-header h3">Please Login to Continue</div>
                <div className="card-body">
                  <br />
                  <form onSubmit={this.handleSubmit}>
                    {this.renderInput("email", "Email", "email")}
                    {this.renderInput("password", "Password", "password")}

                    <label htmlFor="role">Choose Role</label>
                    <select
                      ref={this.role}
                      name="role"
                      className="form-control mb-4"
                    >
                      <option value="assignee">Assignee</option>
                      <option value="complainer">Complainer</option>
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
                    <div className="text-center mt-4">
                      {this.renderButton("Login")}
                    </div>
                    <br />
                    <Link to="/recoverpassword">Forgot Password?</Link>
                    <br />
                    <Link to="/register">
                      Not Registered? Register by clicking here.
                    </Link>
                    <br />
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Login;
