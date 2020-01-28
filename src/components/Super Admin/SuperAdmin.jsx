import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import SuperAdminDashboard from "./Dashboard";
import SuperAdminLogin from "./superAdminLogin";
import SuperAdminLogout from "./SuperAdminLogout";

class SuperAdmin extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/superAdmin/dashboard" component={SuperAdminDashboard} />
          <Route path="/superAdmin/login" component={SuperAdminLogin} />
          <Route path="/superAdmin/logout" component={SuperAdminLogout} />
          <Redirect from="/superAdmin" to="/superAdmin/login" />
        </Switch>
      </div>
    );
  }
}

export default SuperAdmin;
