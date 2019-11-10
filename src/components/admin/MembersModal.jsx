import React, { Component } from "react";
import uuid from "uuid";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from "@material-ui/core";
import { getHigherAuthorityMembers } from "../../services/HigherAuthoritiesService";
import { toast } from "react-toastify";
class MembersModal extends Component {
  state = { members: [], recievers: [] };
  async componentDidMount() {
    try {
      let { data: members } = await getHigherAuthorityMembers();
      this.setState({ members });
    } catch (error) {
      toast.error("Error occured while fetching members");
    }
  }

  handleSelect = member => {
    const { recievers, members } = this.state;
    let index = members.findIndex(m => m._id === member._id);
    members[index].selected = !members[index].selected;
    if (members[index].selected) recievers.push(member);
    else {
      let i = recievers.findIndex(r => r._id === member._id);
      if (i >= 0) recievers.splice(i, 1);
    }
    this.setState({ recievers, members });
  };

  handleSend = () => {
    let res = this.state.recievers;
    this.setState({ recievers: [] });
    this.props.onSubmit(res);
  };

  render() {
    const { members } = this.state;
    return (
      <React.Fragment>
        <Dialog
          open={this.props.isOpen}
          onClose={this.props.onClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          scroll={"paper"}
        >
          <React.Fragment>
            <DialogTitle id="form-dialog-title">Members</DialogTitle>
            <DialogContent dividers={true}>
              <div className="container">
                {members.map(member => (
                  <div
                    key={uuid()}
                    className="card p-2 mb-2"
                    style={{
                      border: "1px solid #dadce0",
                      borderRadius: "8px"
                    }}
                  >
                    <table>
                      <tr>
                        <td>
                          <strong>Name:</strong>
                        </td>{" "}
                        <td>{member.name}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Email:</strong>
                        </td>{" "}
                        <td>{member.email}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Designation:</strong>
                        </td>{" "}
                        <td>{member.designation}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <button
                            type="button"
                            onClick={() => this.handleSelect(member)}
                            className="btn btn-sm btn-secondary rounded-bottom"
                          >
                            {member.selected ? "Un Select" : "Select"}
                          </button>
                        </td>
                      </tr>
                    </table>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <button
                className="btn btn-outline-dark"
                onClick={this.handleSend}
              >
                Send
              </button>
            </DialogActions>
          </React.Fragment>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default MembersModal;
