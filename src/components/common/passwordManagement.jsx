import React, { Component } from "react";
import { getUserByEmail, recoverPassword } from "../../services/userService";
import Joi from "joi-browser";
import FindUser from "../admin/usersManagement/findUser";
import RecoverPassword from "../admin/usersManagement/recoverPassword";
import Loading from "./loading";

class PasswordManagement extends Component {
  state = {
    data: { email: "", role: "admin", companyId: "" },
    error: "",
    user: null
  };
  constructor(props) {
    super(props);
    if (props.match.params.companyId)
      this.state.data.companyId = props.match.params.companyId;
  }

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
    companyId: Joi.string().required(),
    role: Joi.string().required()
  };
  componentDidMount() {
    if (!this.props.match.params.companyId) window.location = "/";

    // this.state.data.companyId = :props.match.params.companyId;
  }

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
    this.setState({ isLoading: true });
    const errorMessage = this.validate();
    if (errorMessage) {
      this.setState({ error: errorMessage, isLoading: false });
      return;
    }
    const { email, role, companyId } = this.state.data;
    try {
      const { data: user } = await getUserByEmail({ email, role, companyId });
      console.log(user);
      this.setState({ user, isLoading: false });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.setState({ isLoading: false });
        alert("No user with given Email");
      }
    }
  };

  handleGoback = () => {
    this.setState({ user: null });
  };
  handleSend = async () => {
    this.setState({ isLoading: true });

    try {
      const { data: message } = await recoverPassword({
        email: this.state.user.email,
        role: this.state.data.role,
        companyId: this.state.data.companyId
      });
      this.setState({ isLoading: false });

      alert(message);
      this.props.history.push("/login");
    } catch (error) {
      this.setState({ isLoading: false });
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
        {this.state.isLoading && <Loading />}
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
