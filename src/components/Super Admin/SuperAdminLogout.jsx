import { Component } from "react";
import authService from "../../services/authService";

class SuperAdminLogout extends Component {
  componentDidMount() {
    authService.logout();
    window.location = "/superAdmin/";
  }

  render() {
    return null;
  }
}

export default SuperAdminLogout;
