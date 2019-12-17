import React, { useState, useEffect } from "react";
import { Route, Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import RegisterForm from "../Register";
import Users from "../users";
import FileUpload from "../fileUpload";
import { getCurrentUser } from "../../../../services/authService";
import UserLogo from "../../../common/logo";
import CategoriesList from "../../../../categories/categoriesList";
import Settings from "../../Configuration/Settings";
import Dashboard from "../../dashboard/dashboard";
import { Toolbar } from "@material-ui/core";
import { getAllNotifications } from "../../../../services/notificationService";
import Chart from "../../chart";
import config from "../../../../config.json";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import Notifications from "../../../common/Notifications";
import AdminForm from "../../../common/adminForm";
import ResetPassword from "../../../common/resetPassword";
import AdminMessages from "../../AdminMessages";
import { setProfilePictureToken } from "../../../../services/imageService";
import { getConfigToken } from "../../../../services/configurationService";
import LocationsList from "../../../Locations/LocationsList";
// import { getConfigToken } from "./../";

const scoket = openSocket(config.apiEndpoint);

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

function UserManagement(props) {
  const { container } = props;
  const classes = useStyles();
  const currentUser = getCurrentUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [isMessaging, setIsMessaging] = React.useState(true);
  const [isDp, setIsDp] = useState(false);
  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  // get NOtifications
  const getNotifications = async () => {
    const { data } = await getAllNotifications();
    setNotifications(oldNotifications => [...oldNotifications, ...data]);
  };

  useEffect(() => {
    getNotifications();
    async function setProfilePicture() {
      if (!localStorage.getItem("profilePicture")) {
        await setProfilePictureToken(getCurrentUser()._id, "admin");
        setIsDp(true);
      }
    }
    setIsMessaging(getConfigToken().isMessaging);
    setProfilePicture();
    listenEvents();
  }, []);

  const listenEvents = () => {
    scoket.on("config", configuration => {
      if (currentUser.companyId === configuration.companyId) {
        setIsMessaging(configuration.isMessaging);
      }
    });
    scoket.on("complaints", data => {
      if (
        data.notification.receivers.id !== currentUser._id &&
        data.notification.receivers.role !== currentUser.role
      )
        return;

      if (data.action === "new complaint") {
        toast.info(data.notification.msg);
      } else if (data.action === "drop") {
        // toast.info(data.notification.msg);
      } else if (data.action === "task assigned") {
        toast.info(data.notification.msg + "User mens");
      }

      let allNotifications = [...notifications];
      // allNotifications.find(not => not.msg !== data.notification.msg);
      allNotifications.unshift(data.notification);
      setNotifications(oldNotifications => [
        ...allNotifications,
        ...oldNotifications
      ]);
    });
  };
  const drawer = (
    <div style={{ backgroundColor: "#4582FF", color: "#eee", height: "100%" }}>
      <div
        className={classes.toolbar + " d-flex align-items-center p-0"}
        style={{ background: "#2F5BB2" }}
      >
        <NavLink
          className="nav-item nav-link d-flex align-items-center p-0 pl-2 text-white "
          to={`/admin/users/profile/${getCurrentUser()._id}/admins`}
        >
          <UserLogo management={true} />
          <p className="p-0 m-0 ml-2 drawerLogo">
            {getCurrentUser().name.split(" ")[0]}
          </p>
        </NavLink>
      </div>
      <Divider />

      <List>
        {[
          {
            label: "Home",
            path: "/admin/users",
            icon: <i className="fa fa-home mr-4 drawerBtns"></i>
          },
          {
            label: "Create Accounts",
            path: "/admin/users/register",
            icon: <i className="fa fa-plus mr-4 drawerBtns   "></i>
          },
          {
            label: "Assignees",
            path: "/admin/users/assignees",
            icon: <i className="fa fa-list mr-4 drawerBtns"></i>
          },
          {
            label: "Complainers",
            path: "/admin/users/complainers",
            icon: <i className="fa fa-list-alt mr-4 drawerBtns"></i>
          },

          {
            label: "Configuration",
            path: "/admin/users/configuration",
            icon: <i className="fa fa-cog mr-4 drawerBtns"></i>
          },
          {
            label: "Categories",
            path: "/admin/users/categories",
            icon: <i className="fa fa-list-alt mr-4 drawerBtns"></i>
          },
          {
            label: "Location Tags",
            path: "/admin/users/locations",
            icon: <i className="fa fa-list-alt mr-4 drawerBtns"></i>
          },
          {
            label: "Reports/Charts",
            path: "/admin/users/reports",
            icon: <i className="fa fa-line-chart mr-4 drawerBtns"></i>
          },
          {
            label: "Reset Password",
            path: "/admin/users/resetpassword",
            icon: <i className="fa fa-key mr-4 drawerBtns"></i>
          },
          {
            label: "Logout",
            path: "/logout",
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
            <div className="d-flex">
              {" "}
              <>{isMessaging && <AdminMessages />}</>
              <>
                <Notifications notifications={notifications} />
              </>
            </div>
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
        <div className="mt-4">
          <Route path="/admin/users/" exact component={Dashboard} />
          <Route
            path="/admin/users/register"
            exact
            render={props => (
              <div>
                <div className="d-flex justify-content-around flex-wrap">
                  <RegisterForm /> <FileUpload {...props} />
                </div>
              </div>
            )}
          />
        </div>

        <Route
          path="/admin/users/edit/:id/:role"
          render={props => (
            <div>
              <div className="d-flex justify-content-around flex-wrap">
                <RegisterForm isEditView={true} {...props} />
              </div>
            </div>
          )}
        />

        {/* <Route
          path="/user/profile/:id/:role"
          render={props => <RegisterForm isProfile={true} />}
        /> */}

        <Route
          path="/admin/users/assignees"
          render={props => <Users type="assignees" {...props} />}
        />
        <Route
          path="/admin/users/complainers"
          render={props => <Users type="complainers" {...props} />}
        />
        <Route
          path="/admin/users/reports"
          render={props => <Chart {...props} />}
        />
        <Route path="/admin/users/categories" component={CategoriesList} />
        <Route path="/admin/users/locations" component={LocationsList} />
        <Route path="/admin/users/configuration" component={Settings} />
        <Route path="/admin/users/resetpassword" component={ResetPassword} />

        <Route
          path="/admin/users/profile/:id/:role"
          render={props => (
            <div className="d-flex justify-content-center py-2 ">
              {props.match.params.role !== "admins" ? (
                <RegisterForm isProfileView={true} {...props} />
              ) : (
                <AdminForm isProfileView={true} {...props} />
              )}
            </div>
          )}
        />
        {/* <Redirect from="/admin/users" to="/admin/users/register" /> */}
      </main>
    </div>
  );
}

UserManagement.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container: PropTypes.object
};

export default UserManagement;
