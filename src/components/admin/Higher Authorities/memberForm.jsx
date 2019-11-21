import React from "react";
import Joi from "joi-browser";
import Form from "./../../common/form";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogActions } from "@material-ui/core";
import { toast } from "react-toastify";
import {
  addHigherAuthorityMember,
  editHigherAuthorityMember
} from "../../../services/HigherAuthoritiesService";
class MemberForm extends Form {
  state = {
    data: { name: "", email: "", designation: "" },
    errors: {},
    isLoading: true,
    isEditView: false
  };
  constructor(props) {
    super();
    if (props.isEditView) {
      this.state.isEditView = props.isEditView;
      this.state.data = { ...props.selectedMember };

      delete this.state.data._id;
    }
    this.state.isOpen = props.isOpen;
  }
  componentDidMount() {
    this.setState({ isLoading: false });
  }
  schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    designation: Joi.string().required()
  };
  doSubmit = async () => {
    try {
      let member = {};
      if (this.state.isEditView) {
        let { _id: memberId } = this.props.selectedMember;
        let { data } = await editHigherAuthorityMember(
          this.state.data,
          memberId
        );
        member = data;
      } else {
        let { data } = await addHigherAuthorityMember(this.state.data);
        member = data;
      }
      toast.info("New Member Added.");
      this.props.onSuccess(member);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (!this.state.isEditView) toast.warn("Member Already registered.");
        else toast.warn("Email Already registered.");
      }
      if (error.response && error.response.status === 404) {
        if (this.state.isEditView) toast.warn("Member not found.");
      }
    }
  };

  render() {
    let { isLoading, isEditView, isOpen } = this.state;
    let { onClose } = this.props;
    return (
      <div>
        <Dialog
          open={isOpen}
          onClose={onClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          scroll={"paper"}
          height="500px"
        >
          {isLoading && (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          {!isLoading && (
            <React.Fragment>
              <DialogTitle id="form-dialog-title">
                Please enter required details
              </DialogTitle>
              <form onSubmit={this.handleSubmit}>
                <DialogContent dividers={true}>
                  {this.renderInput("name", "Name", "text")}
                  {this.renderInput("email", "Email", "text")}
                  {this.renderInput("designation", "Designation")}
                </DialogContent>
                <DialogActions>
                  {isEditView
                    ? this.renderButton("Edit")
                    : this.renderButton("Register")}
                </DialogActions>
              </form>
            </React.Fragment>
          )}
        </Dialog>
      </div>
    );
  }
}

export default MemberForm;
