import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "../common/input";
import Select from "../common/select";
import Switch from "./switch";
import PictureUpload from "./pictureUpload";

class Form extends Component {
  state = { data: {}, errors: {} };

  validate = () => {
    const { error } = Joi.validate(this.state.data, this.schema, {
      abortEarly: false
    });

    if (!error) return null;

    const errors = {};

    for (let item of error.details) errors[item.path[0]] = item.message;

    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];
    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  validatePassword() {
    const pass = this.state.data.password;
    const confirmPass = this.state.data.confirmPassword;
    if (pass !== confirmPass) {
      return "Passwords mismatch";
    }
    return null;
  }

  renderButton(label) {
    return (
      <button
        disabled={this.validate()}
        type="submit"
        className="btn btn-primary"
      >
        {label}
      </button>
    );
  }

  renderPasswords() {
    return (
      <React.Fragment>
        {this.renderInput("password", "Password", "password")}
        <small id="passwordHelpBlock" className="form-text text-muted">
          Your password must be 8-20 characters long.
        </small>
        {this.renderInput("confirmPassword", "Confirm Password", "password")}
        <small id="passwordHelpBlock" className="form-text text-muted">
          Re write password to confirm above given password.
        </small>
      </React.Fragment>
    );
  }

  renderPictureUpload(name, onChange, profilePath, disabled = false, onRemove) {
    const { errors } = this.state;
    return (
      <PictureUpload
        name={name}
        label={profilePath ? "edit" : "add_circle"}
        value={profilePath}
        error={errors.profilePath}
        onChange={onChange}
        disabled={disabled}
        onRemove={onRemove}
      />
    );
  }

  renderInput(name, label, type = "text", disabled = false) {
    const { data, errors } = this.state;
    return (
      <Input
        label={label}
        type={type}
        name={name}
        value={data[name]}
        error={errors[name]}
        onChange={this.handleChange}
        disabled={disabled}
      />
    );
  }

  renderSwitch(name, label, onClick, isChecked, disabled = false) {
    return (
      <Switch
        name={name}
        label={label}
        onClick={onClick}
        checked={isChecked}
        disabled={disabled}
      />
    );
  }
  renderAssignResponsibilitiesButton(onClick, hidden = false) {
    return (
      <button
        className="btn btn-primary"
        type="button"
        hidden={hidden}
        onClick={onClick}
      >
        Assign responsibilities
      </button>
    );
  }

  renderEditButton() {
    return (
      <button
        className="btn btn-info"
        onClick={e => {
          e.preventDefault();
          this.setState({ isProfileView: false, isEditView: true });
        }}
        type="button"
      >
        Edit
      </button>
    );
  }
  renderSelect(name, label, options) {
    const { data, errors } = this.state;
    return (
      <Select
        name={name}
        value={data[name]}
        label={label}
        options={options}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }
}

export default Form;
