import React from "react";
import { Link, NavLink } from "react-router-dom";
import authService from "../../../services/authService";

const Navbar = ({ user }) => {
  return (
    <nav
      className="navbar navbar-expand-sm text-white navbar-light navbar-shadow "
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
            <a className="nav-item dropdown">
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
                  {authService.getCurrentUser() &&
                    authService.getCurrentUser().name}
                </span>
              </Link>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <NavLink className="dropdown-item" to="/admin/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className="dropdown-item" to="/admin/configuration">
                  Configuration
                </NavLink>
                <NavLink className="dropdown-item" to="/admin/reports">
                  Reports & Graphs
                </NavLink>
                <NavLink className="dropdown-item " to="/profile">
                  Profile
                </NavLink>

                <NavLink className="dropdown-item" to="/logout">
                  Logout
                </NavLink>
              </div>
            </a>
            {/* {user && (
              <React.Fragment>
                <NavLink className="nav-item nav-link text-dark" to="/profile">
                  {user.name}
                </NavLink>
              </React.Fragment>
            )} */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
