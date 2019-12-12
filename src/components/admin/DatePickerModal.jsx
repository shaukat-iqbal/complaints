import React from "react";
import Joi from "joi-browser";
import config from "../../config.json";

import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from "@material-ui/core";
import Form from "../common/form";
import { toast } from "react-toastify";

class DatePickerModal extends Form {
  state = { data: { from: "", to: "" }, errors: {} };
  schema = {
    from: Joi.string()
      .min(8)
      .required(),
    to: Joi.string()
      .min(8)
      .required()
  };

  doSubmit = () => {
    let date = new Date();
    let d1 = new Date(this.state.data.from);
    let d2 = new Date(this.state.data.to);
    if (
      date.getDate() < d2.getDate() ||
      date.getDate() < d1.getDate() ||
      d1.getDate() > d2.getDate()
    ) {
      toast.error("Date must be valid.");
      this.setState({ data: { from: "", to: "" } });
      return;
    }
    if (d1.getTime() >= d2.getTime()) {
      toast.error("Date 'to' must be larger. Kndly check the order");
      this.setState({ data: { from: this.state.data.from, to: "" } });
      return;
    }

    this.props.onSubmit(this.state.data);
  };
  render() {
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
            <DialogTitle id="form-dialog-title">Generate Report</DialogTitle>
            <form onSubmit={this.handleSubmit}>
              <DialogContent dividers={true}>
                <p>Kindly select dates between which you want summary of.</p>
                <div className="row">
                  <div className="col border-right ">
                    {this.renderInput("from", "From", "date", false)}
                  </div>
                  <div className="col">
                    {this.renderInput("to", "To", "date")}
                  </div>
                </div>
              </DialogContent>
              <DialogActions>{this.renderButton("Generate")}</DialogActions>
            </form>
          </React.Fragment>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default DatePickerModal;
