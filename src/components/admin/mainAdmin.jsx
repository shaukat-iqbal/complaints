import React, { useEffect } from "react";

// import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Route, Switch, Redirect } from "react-router-dom";

import auth from "../../services/authService";
import Configuration from "./Configuration";
import Dashboard from "./dashboard/dashboard";
import Chart from "./chart";
import AdminComplaintDetail from "./AdminComplaintDetail";
import NavbarAdmin from "./navbar/navbarAdmin";

const mainAdmin = props => {
  useEffect(() => {
    const user = auth.getCurrentUser();

    if (!user || user.role !== "admin") {
      toast.error("You are not Authorized to Access this Route!");
      props.history.replace("/login");
    }
  }, []);

  return (
    <React.Fragment>
      <NavbarAdmin />
      <div>
        <Switch>
          <Route path="/admin/configuration" component={Configuration} />
          <Route path="/admin/dashboard" component={Dashboard} />
          <Route path="/admin/reports" component={Chart} />
          <Route path="/admin/:id" component={AdminComplaintDetail} />

          <Redirect exact from="/admin" to="/admin/dashboard" />
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default mainAdmin;
