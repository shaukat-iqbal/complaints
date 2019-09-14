import React, { Component } from "react";
import { convertToPicture } from "../../../services/userService";
import Avatar from "@material-ui/core/Avatar";

class RecoverPassword extends Component {
  state = {};

  render() {
    const { user, onIncorrect, onSend } = this.props;
    return (
      <div
        className=" d-flex align-items-center justify-content-center "
        style={{ height: "600px" }}
      >
        <div className="card w-50" style={{ minWidth: "500px" }}>
          <div className="pt-3 px-2">
            <div className="mx-1 border-bottom">
              <strong>Get Password </strong>
            </div>
          </div>
          <div className="card-body pt-2 px-4">
            <div className="container">
              <div className="row">
                <div className="col-8 p-3 d-flex flex-row ">
                  <div>
                    <i className="fa fa-envelope"></i>
                  </div>
                  <div className=" pl-1">
                    <p className="d-inline">
                      <strong style={{ fontSize: "14px" }}>
                        Send code via email
                      </strong>
                      <br></br>
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="col-4 border-left">
                  <div className="my-5 ml-3">
                    {user.profilePicture ? (
                      <img
                        src={convertToPicture(user.profilePicture.data)}
                        width="80px"
                        height="80px"
                        alt="userProfile"
                      />
                    ) : (
                      <Avatar>{user.name.substring(0, 1)}</Avatar>
                    )}
                    {user.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer py-2 d-flex justify-content-end">
            <button className="btn btn-sm btn-primary mx-1" onClick={onSend}>
              Send
            </button>
            <button className="btn btn-sm btn-danger" onClick={onIncorrect}>
              Not You?
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RecoverPassword;
