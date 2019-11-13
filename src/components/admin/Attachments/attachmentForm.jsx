import React from "react";
import Joi from "joi-browser";
import Form from "../../common/form";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogActions } from "@material-ui/core";
import { toast } from "react-toastify";

import {
  editAttachment,
  addAttachment
} from "../../../services/attachmentsService";
class AttachmentForm extends Form {
  state = {
    data: { extentionName: "", maxSize: "" },
    errors: {},
    isLoading: true,
    isEditView: false
  };
  constructor(props) {
    super();
    if (props.isEditView) {
      this.state.isEditView = props.isEditView;
      this.state.data = { ...props.selectedAttachment };

      delete this.state.data._id;
    }
    this.state.isOpen = props.isOpen;
  }
  componentDidMount() {
    this.setState({ isLoading: false });
  }
  schema = {
    extentionName: Joi.string()
      .min(2)
      .max(10)
      .required(),
    maxSize: Joi.string()
      .min(1)
      .max(255)
      .required()
  };
  doSubmit = async () => {
    try {
      let attachment = {};
      if (this.state.isEditView) {
        let { _id: memberId } = this.props.selectedAttachment;
        let { data } = await editAttachment(this.state.data, memberId);
        attachment = data;
      } else {
        let { data } = await addAttachment(this.state.data);
        attachment = data;
      }
      if (this.state.isEditView) toast.info("Attachment Updated.");
      else toast.info("New attachment Added.");
      this.props.onSuccess(attachment);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (!this.state.isEditView)
          toast.warn("attachment Already registered.");
        else toast.warn("Email Already registered.");
      }
      if (error.response && error.response.status === 404) {
        if (this.state.isEditView) toast.warn("attachment not found.");
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
              <DialogTitle id="form-dialog-title">Attachment</DialogTitle>
              <form onSubmit={this.handleSubmit}>
                <DialogContent dividers={true}>
                  {this.renderInput("extentionName", "Extention Name", "text")}
                  {this.renderInput("maxSize", "Max Size (in kb)", "text")}
                </DialogContent>
                <DialogActions>
                  {isEditView
                    ? this.renderButton("Update")
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

export default AttachmentForm;
