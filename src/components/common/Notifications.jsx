import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import ComplaintDetail from "./ComplaintDetail";
import uuid from "uuid";
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

          <Dropdown.Menu direction="left" key="left">
            {notifications.length > 0 ? (
              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {notifications.map(notification => (
                  <Dropdown.Item
                    style={{
                      width: "250px",
                      height: "70px",
                      backgroundColor: "#eee",
                      margin: "5px 10px"
                    }}
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
                  </Dropdown.Item>
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
