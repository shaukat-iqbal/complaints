import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import { getCurrentUser } from "../../../services/authService";
import UserLogo from "../../common/logo";
import { setProfilePictureToken } from "../../../services/imageService";
class Navbar extends Component {
  state = { profilePicture: false };
  async componentDidMount() {
    if (!localStorage.getItem("profilePicture")) {
      await setProfilePictureToken(getCurrentUser()._id, "admin");
      this.setState({ profilePicture: true });
    }
  }
  render() {
    return (
      <nav
        className="navbar navbar-expand-sm text-white navbar-light shadow-sm"
        id="main-nav"
      >
        <div className="container">
          <Link to="/admin" className="navbar-brand text-dark">
            Quick Response
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="navbar-nav ml-auto ">
              <UserLogo />
              <NavLink
                className="nav-item nav-link text-dark "
                to={`/profile/${getCurrentUser()._id}/admins`}
              >
                Profile
              </NavLink>

              <NavLink className="nav-item nav-link text-dark" to="/logout">
                Logout
              </NavLink>
              <button className=" nav-button dropdown ">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="text-dark navbar-custom">
                    {getCurrentUser() && getCurrentUser().name}
                  </span>
                </Link>

                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <NavLink className="dropdown-item" to="/admin/dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink className="dropdown-item" to="/admin/users">
                    Users Management
                  </NavLink>
                  <NavLink className="dropdown-item" to="/admin/configuration">
                    Configuration
                  </NavLink>
                  <NavLink className="dropdown-item" to="/admin/reports">
                    Reports & Graphs
                  </NavLink>
                  <NavLink className="dropdown-item" to="/resetpassword">
                    Reset Password
                  </NavLink>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
