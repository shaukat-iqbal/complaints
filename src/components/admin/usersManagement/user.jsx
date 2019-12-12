import React from "react";
import { convertToPicture } from "../../../services/userService";
const User = ({
  user,
  onProfileView,
  onDelete,
  onEdit,
  showCrudBtns,
  onUserSelected
}) => {
  let profilePicture = "";
  if (user.profilePicture)
    profilePicture = convertToPicture(user.profilePicture.data);
  return (
    <div className="d-flex justify-content-between p-2 border-bottom  mb-1">
      <div className="row">
        <div className="mr-5">
          <img
            className="rounded-circle"
            src={
              profilePicture
                ? profilePicture
                : require("./../../../resources/img/add.png")
            }
            // src="https://source.unsplash.com/random/200*200"
            alt="profile pic"
            width="100px"
            height="100px"
          />
        </div>
        <div className="d-flex flex-column align-content-center justify-content-center">
          <p className="mb-0">
            <strong>{user.name}</strong>
          </p>
          <p className="mb-0" style={{ fontSize: "12px" }}>
            Phone Number: {user.phone}
          </p>
          <p className="mb-0" style={{ fontSize: "12px" }}>
            Email: {user.email}
          </p>
        </div>
      </div>
      <div>
        {showCrudBtns ? (
          <>
            {" "}
            <button
              className="btn button-primary mr-2 mb-1"
              onClick={() => {
                onProfileView(user);
              }}
            >
              <i className="fa fa-user-circle-o"></i> Profile
            </button>
            <button
              className="btn button-secondary mr-2 mb-1"
              onClick={() => {
                onEdit(user);
              }}
            >
              <i className="fa fa-pencil"></i> Edit
            </button>
            <button
              className="btn btn-danger rounded-pill"
              onClick={() => {
                onDelete(user);
              }}
            >
              <i className="fa fa-trash"></i> Delete
            </button>
          </>
        ) : (
          <button
            className="btn btn-info rounded-pill  "
            onClick={() => {
              onUserSelected(user);
            }}
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
};

export default User;
