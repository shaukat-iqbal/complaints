import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import ComplaintDetail from "./ComplaintDetail";
import uuid from "uuid";
import DropdownItem from "react-bootstrap/DropdownItem";
class Notifications extends Component {
  state = {};
  handleCloseComplaintDetail = () => {
    this.setState({ isOpen: false, complaintId: null });
  };

  render() {
    let { notifications } = this.props;
    return (
      <>
        <Dropdown direction="left">
          <Dropdown.Toggle variant="light" id="dropdown-basic">
            <i className="fa fa-bell"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu
            direction="left"
            key="left"
            style={{ paddingTop: "0px" }}
          >
            {notifications.length > 0 ? (
              <div
                style={{
                  maxHeight: "400px",
                  overflow: "auto",
                  maxWidth: "400px"
                }}
              >
                <div className="notification-header" key={uuid()}>
                  Notifications
                </div>

                {notifications.map(notification => (
                  <div
                    className="notification"
                    key={uuid()}
                    onClick={() => {
                      // console.log(notification.complaintId);
                      // return this.props.history.replace(
                      //   `/complaintdetail/${notification.complaintId}`
                      this.setState({
                        isOpen: true,
                        complaintId: notification.complaintId
                      });
                    }}
                  >
                    {notification.msg}
                  </div>
                ))}
              </div>
            ) : (
              <Dropdown.Item>You do not have any notifications</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
        {this.state.isOpen && (
          <ComplaintDetail
            isOpen={this.state.isOpen}
            complaintId={this.state.complaintId}
            onClose={this.handleCloseComplaintDetail}
          />
        )}
      </>
    );
  }
}

export default Notifications;
