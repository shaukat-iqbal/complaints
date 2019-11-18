import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Complainer from "./Complainer";
import RegisterForm from "../admin/usersManagement/Register";
import ComplaintDetail from "../common/ComplaintDetail";
import { getCurrentUser } from "../../services/authService";
class ComplainerSubRoutes extends Component {
  state = {};
  render() {
    return (
      <Switch>
        <Route
          path="/complainer/dashboard"
          render={props => <Complainer {...props} />}
        />
        <Route
          path="/complainer/profile/:id/:role"
          exact
          render={props => (
            <div className="d-flex justify-content-center py-2 ">
              {<RegisterForm isProfileView={true} {...props} />}
            </div>
          )}
        />
        <Route
          path="/complainer/complaintdetail/:companyId"
          render={props => (
            <ComplaintDetail
              isOpen={true}
              onClose={() => {
                window.location = `/${getCurrentUser().role}`;
              }}
              {...props}
            />
          )}
        />
        <Redirect exact from="/complainer" to="/complainer/dashboard" />
      </Switch>
    );
  }
}

export default ComplainerSubRoutes;
