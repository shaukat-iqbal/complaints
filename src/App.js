import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Complainer from "./components/complainer/Complainer";
import Assignee from "./components/assignee/Assignee";
import mainAdmin from "./components/admin/mainAdmin";
import Login from "./components/login";
import Notfound from "./components/NotFound";
import Logout from "./components/logout";
import Message from "./components/common/message/message";
import AssigneeMessage from "./components/common/message/assigneeMessages";
import RegisterForm from "./components/admin/usersManagement/Register";
import PasswordManagement from "./components/common/passwordManagement";
import ResetPassword from "./components/common/resetPassword";
import CategoriesList from "./categories/categoriesList";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AdminForm from "./components/common/adminForm";
import CustomizedSteppers from "./components/Startup/stepper";
import SuperAdmin from "./components/Super Admin/SuperAdmin";
// const Complainer = lazy(() => import("./components/complainer/Complainer"));

class App extends Component {
  render() {
    return (
      <div className="App ">
        <ToastContainer />

        <Switch>
          <Route path="/categories" component={CategoriesList} />
          <Route
            path="/welcome/:id"
            render={props => (
              <div className="container d-flex justify-content-center">
                <CustomizedSteppers {...props} />
              </div>
            )}
          />

          <Route
            path="/profile/:id/:role"
            render={props => (
              <div className="d-flex justify-content-center py-5 ">
                {props.match.params.role !== "admins" ? (
                  <RegisterForm isProfileView={true} {...props} />
                ) : (
                  <AdminForm isProfileView={true} {...props} />
                )}
              </div>
            )}
          />
          <Route
            path="/register/:companyId"
            render={props => (
              <div className="d-flex justify-content-center py-5 ">
                <RegisterForm {...props} />
              </div>
            )}
          />
          <Route
            path="/recoverpassword/:companyId"
            component={PasswordManagement}
          />
          <Route path="/resetpassword" component={ResetPassword} />

          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/complainer" component={Complainer} />
          <Route path="/assignee" component={Assignee} />
          <Route path="/superAdmin" component={SuperAdmin} />
          <Route path="/assignee/:id" component={Assignee} />
          <Route path="/admin" component={mainAdmin} />
          <Route path="/c/message/:id" component={Message} />
          <Route path="/a/message/:id" component={AssigneeMessage} />
          <Route path="/not-found" component={Notfound} />
          <Redirect exact from="/" to="/login" />
          <Redirect to="/not-found" />
        </Switch>
      </div>
    );
  }
}

export default App;
