import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Complainer from "./components/complainer/Complainer";
import ComplaintForm from "./components/complainer/ComplaintForm/complaintForm";
import Assignee from "./components/assignee/Assignee";
import mainAdmin from "./components/admin/mainAdmin";
import Login from "./components/login";
import Notfound from "./components/NotFound";
import Logout from "./components/logout";
import ComplaintDetail from "./components/complainer/complaintDetail/complaintDetail";
import Message from "./components/common/message/message";
import AssigneeMessage from "./components/common/message/assigneeMessages";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import RegisterForm from "./components/admin/usersManagement/Register";
import PasswordManagement from "./components/common/passwordManagement";
import ResetPassword from "./components/common/resetPassword";
import CategoriesList from "./categories/categoriesList";
import Test from "./test";
// const Complainer = lazy(() => import("./components/complainer/Complainer"));

class App extends Component {
  render() {
    return (
      <div className="App ">
        <ToastContainer />

        <Switch>
          <Route path="/categories" component={CategoriesList} />
          <Route path="/test" component={Test} />

          <Route
            path="/complainer/new-complaint"
            render={props => (
              <>
                <ComplaintForm {...props} />
              </>
            )}
          />
          <Route path="/complainer/:id" component={ComplaintDetail} />
          <Route
            path="/profile/:id/:role"
            render={props => (
              <div
                className="d-flex justify-content-center py-5 "
                style={{
                  backgroundImage:
                    "url(" +
                    require("./resources/img/drawerProfileBackground.png") +
                    ")"
                }}
              >
                <RegisterForm isProfileView={true} {...props} />
              </div>
            )}
          />
          <Route
            path="/register"
            render={props => (
              <div
                className="d-flex justify-content-center py-5 "
                style={{
                  backgroundImage:
                    "url(" +
                    require("./resources/img/drawerProfileBackground.png") +
                    ")"
                }}
              >
                <RegisterForm {...props} />
              </div>
            )}
          />
          <Route path="/recoverpassword" component={PasswordManagement} />
          <Route path="/resetpassword" component={ResetPassword} />

          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/complainer/me" component={Complainer} />
          <Route path="/complainer" component={Complainer} />
          <Route path="/assignee" component={Assignee} />
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
