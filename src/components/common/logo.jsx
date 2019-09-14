import React from "react";
import { getProfilePicture } from "../../services/userService";
import { getCurrentUser } from "../../services/authService";
import { Avatar } from "@material-ui/core";
const UserLogo = ({ width = "50px", height = "50px" }) => {
  if (localStorage.getItem("profilePicture")) {
    return (
      <img
        className="rounded-circle"
        src={getProfilePicture()}
        width={width}
        height={height}
        alt="logo"
      />
    );
  } else {
    return <Avatar>{getCurrentUser().name.substring(0, 1)}</Avatar>;
  }
};

export default UserLogo;
