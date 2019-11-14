import React, { useEffect } from "react";
import { getProfilePicture } from "../../services/userService";
import { getCurrentUser } from "../../services/authService";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles({
  avatar: {
    width: 50,
    height: 50
  },
  bigAvatar: {
    width: 60,
    height: 60
  }
});
const UserLogo = ({ width = "50px", height = "50px" }) => {
  const classes = useStyles();
  if (localStorage.getItem("profilePicture")) {
    return (
      <Avatar
        alt="logo"
        src={getProfilePicture()}
        className={classes.bigAvatar}
      />

      // <img
      //   className="rounded-circle"
      //   src={getProfilePicture()}
      //   width={width}
      //   height={height}
      //   alt="logo"
      // />
    );
  } else {
    return (
      <Avatar className={classes.avatar}>
        {getCurrentUser().name.substring(0, 1)}
      </Avatar>
    );
  }
};

export default UserLogo;
