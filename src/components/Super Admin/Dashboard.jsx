import React, { useState, useEffect } from "react";
import { Route, Link, NavLink, Switch, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Divider,
  AppBar,
  CssBaseline,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { getCurrentUser } from "../../services/authService";
import UserLogo from "../common/logo";
import ResetPassword from "../common/resetPassword";
import { setProfilePictureToken } from "../../services/imageService";
import Companies from "./Companies";
import CompanyDetailsForm from "../common/companyDetailsForm";
import RegisterForm from "../admin/usersManagement/Register";
// import { getConfigToken } from "./../";

const drawerWidth = 220;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
      background: "blue"
    },
    background: "blue"
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  backgroundColor: "#394362",
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    minHeight: "700px",
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
    padding: theme.spacing(0)
  }
}));

function SuperAdminDashboard(props) {
  const { container } = props;
  const classes = useStyles();
  const currentUser = getCurrentUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isDp, setIsDp] = useState(false);

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  useEffect(() => {
    if (!currentUser || currentUser.role !== "superAdmin")
      window.location = "/";

    async function setProfilePicture() {
      if (!localStorage.getItem("profilePicture")) {
        await setProfilePictureToken(currentUser._id, "super-admin");
        setIsDp(true);
      }
    }
    setProfilePicture();
  }, []);

  const drawer = (
    <div style={{ backgroundColor: "#4582FF", color: "#eee", height: "100%" }}>
      <div
        className={classes.toolbar + " d-flex align-items-center p-0"}
        style={{ background: "#2F5BB2" }}
      >
        {currentUser && (
          <NavLink
            className="nav-item nav-link d-flex align-items-center p-0 pl-2 text-white "
            to={`/superAdmin/dashboard/profile/${currentUser._id}`}
          >
            <UserLogo management={true} />
            <p className="p-0 m-0 ml-2 drawerLogo">
              {currentUser.name.split(" ")[0]}
            </p>
          </NavLink>
        )}
      </div>
      <Divider />

      <List>
        {[
          {
            label: "Add Company",
            path: "/superAdmin/dashboard/registerCompany",
            icon: <i className="fa fa-plus mr-4 drawerBtns   "></i>
          },
          {
            label: "Companies",
            path: "/superAdmin/dashboard/companies",
            icon: <i className="fa fa-list mr-4 drawerBtns"></i>
          },

          {
            label: "Reset Password",
            path: "/superAdmin/dashboard/resetpassword",
            icon: <i className="fa fa-key mr-4 drawerBtns"></i>
          },
          {
            label: "Logout",
            path: "/superAdmin/logout",
            icon: <i className="fa fa-sign-out mr-4 drawerBtns"></i>
          }
        ].map(item => (
          <Link
            key={item.label}
            className="nav-item nav-link  p-0 "
            to={item.path || "/admin"}
            style={{ textDecoration: "none" }}
          >
            <ListItem button key={item.label}>
              {item.icon}
              <ListItemText style={{ color: "#FFFFFF" }} primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={`${classes.appBar} gradiantHeading `}>
        <Toolbar>
          <div className="ml-auto">
            <div className="d-flex">{/* Toolbar items goes here */}</div>
          </div>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={`${classes.content} container-fluid`}>
        <div className={classes.toolbar} />
        <div className="container">
          <Switch>
            <Route
              path="/superAdmin/dashboard/registerCompany"
              component={CompanyDetailsForm}
            />
            <Route
              path="/superAdmin/dashboard/companies"
              component={Companies}
            />
            <Route
              path="/superAdmin/dashboard/resetpassword"
              component={ResetPassword}
            />
            <Route
              path="/superAdmin/dashboard/profile/:id/:role"
              render={props => <RegisterForm isProfileView={true} {...props} />}
            />
            <Redirect
              exact
              from="/superAdmin/dashboard"
              to="/superAdmin/dashboard/companies"
            />
          </Switch>
        </div>
      </main>
    </div>
  );
}

SuperAdminDashboard.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container: PropTypes.object
};

export default SuperAdminDashboard;
