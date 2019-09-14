import React, { Component } from "react";
import { getUserByEmail, recoverPassword } from "../../services/userService";
import Joi from "joi-browser";
import FindUser from "../admin/usersManagement/findUser";
import RecoverPassword from "../admin/usersManagement/recoverPassword";

class PasswordManagement extends Component {
  state = {
    data: { email: "", role: "admin" },
    error: "",
    user: null
  };

  handleChange = ({ currentTarget }) => {
    const data = { ...this.state.data };
    data[currentTarget.name] = currentTarget.value;
    this.setState({ data });

    this.setState({ error: "" });
  };

  schema = {
    email: Joi.string()
      .email()
      .required(),

    role: Joi.string().required()
  };

  handleCancel = () => {
    this.props.history.push("/login");
  };

  validate = () => {
    const { error } = Joi.validate(this.state.data, this.schema);

    if (error) {
      return error.details[0].message;
    }
  };

  handleSearch = async () => {
    const errorMessage = this.validate();
    if (errorMessage) {
      this.setState({ error: errorMessage });
      return;
    }
    const { email, role } = this.state.data;
    try {
      const { data: user } = await getUserByEmail(email, role);
      console.log(user);
      this.setState({ user });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("No user with given Email");
      }
    }
  };

  handleGoback = () => {
    this.setState({ user: null });
  };
  handleSend = async () => {
    try {
      const { data: message } = await recoverPassword({
        email: this.state.user.email,
        role: this.state.data.role
      });
      alert(message);
      this.props.history.push("/login");
    } catch (error) {
      if (error.response && error.response.status === 404) alert("Not found ");
    }
  };
  render() {
    const { data, error, user } = this.state;
    return (
      <div
        className="container-fluid min-vh-100"
        style={{ backgroundColor: "#E9EBEE" }}
      >
        {!user && (
          <FindUser
            error={error}
            onChange={this.handleChange}
            onSearch={this.handleSearch}
            onCancel={this.handleCancel}
            data={data}
          />
        )}
        {user && (
          <RecoverPassword
            user={user}
            onSend={this.handleSend}
            onIncorrect={this.handleGoback}
          />
        )}
      </div>
    );
  }
}

export default PasswordManagement;
