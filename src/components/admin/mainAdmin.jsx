import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";
import { Route, Switch, Redirect } from "react-router-dom";

import auth from "../../services/authService";
import Configuration from "./Configuration";
import Dashboard from "./dashboard/dashboard";
import Chart from "./chart";
import NavbarAdmin from "./navbar/navbarAdmin";
import UserManagementContainer from "./usersManagement/container/userManagement";

const mainAdmin = props => {
  const [user, setUser] = useState();

  useEffect(() => {
    const user = auth.getCurrentUser();
    setUser(user);

    if (!user || user.role !== "admin") {
      toast.error("You are not Authorized to Access this Route!");
      props.history.replace("/login");
    }
  }, []);

  return (
    <React.Fragment>
      <div>
        <Switch>
          <Route path="/admin/users" component={UserManagementContainer} />
          {/* <Route
            path="/admin/configuration"
            render={props => (
              <div>
                {" "}
                <NavbarAdmin />
                <Configuration {...props} />{" "}
              </div>
            )}
          />
          <Route
            path="/admin/dashboard"
            render={props => (
              <div>
                {" "}
                <NavbarAdmin />
                <Dashboard {...props} />{" "}
              </div>
            )}
          />
          <Route
            path="/admin/reports"
            render={props => (
              <div>
                {" "}
                <NavbarAdmin />
                <Chart {...props} />{" "}
              </div>
            )}
          /> */}

          <Redirect exact from="/admin" to="/admin/users" />
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default mainAdmin;
