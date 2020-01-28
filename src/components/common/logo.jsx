import React from "react";
import { getCurrentUser } from "../../services/authService";
import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles({
  avatar: {
    width: 50,
    height: 50
  },
  bigAvatar: {
    width: 50,
    height: 50
  },
  management: {
    width: 60,
    height: 60
  }
});

const UserLogo = props => {
  const classes = useStyles();
  let profilePath = getCurrentUser().profilePath;
  if (profilePath) {
    return (
      <Avatar
        alt="logo"
        src={profilePath}
        className={props.management ? classes.management : classes.bigAvatar}
      />
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
