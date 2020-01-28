import React from "react";
import Joi from "joi-browser";
import Loading from "../common/loading";
import { getCurrentUser } from "../../services/authService";
import { compressImage } from "../../services/imageService";
import { createDetailsFormData } from "../../services/companyDetailsService";
import { toast } from "react-toastify";
import {
  getSuperAdmin,
  updateSuperAdmin
} from "../../services/superAdminService";

import Form from "../common/form";

class SuperAdminForm extends Form {
  state = {
    data: {
      name: "",
      email: ""
    },
    profile: "",
    profilePath: null,
    errors: {},
    isLoading: true
  };

  schema = {
    name: Joi.string()
      .min(5)
      .max(1024)
      .required(),
    email: Joi.string()
      .required()
      .email()
      .label("Email")
  };

  constructor(props) {
    super(props);
    let user = getCurrentUser();
    this.state.currentUser = user;
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
  }

  componentDidMount() {
    this.populateUserDetails();
  }

  populateUserDetails = async () => {
    let { currentUser } = this.state;
    let { data: user } = await getSuperAdmin(currentUser._id);
    const data = {};
    data.name = user.name;
    data.email = user.email;
    this.setState({
      data,
      profilePath: user.profilePath,
      isLoading: false
    });
  };

  handleRemoveProfilePicture = () => {
    this.setState({ profilePath: null });
  };

  handleProfilePicture = async event => {
    let { profilePath, profilePicture } = this.state;
    if (event.target.files[0]) {
      profilePath = URL.createObjectURL(event.target.files[0]);
      this.setState({ profilePath });
      profilePicture = await compressImage(event.target.files[0]);
      profilePath = URL.createObjectURL(profilePicture);
    }
    this.setState({
      profilePicture,
      profilePath
    });
  };

  doSubmit = async () => {
    //only compare passwrods when complainer or assignee is creating account by themselves

    this.setState({ isLoading: true });

    const fd = createDetailsFormData(this.state);

    try {
      await updateSuperAdmin(this.state.currentUser._id, fd);
      this.setState({ isProfileView: true, isEditView: false });
      toast.info("Account Updated");

      if (this.props.enableNext) this.props.enableNext();
    } catch (error) {
      let errors = { ...this.state.errors };
      if (error.response && error.response.status === 400) {
        toast.warn("Already Registered");
        errors.email = error.response.data;
      } else if (error.response && error.response.status === 404) {
        errors.email = error.response.data;
        toast.warn("Super Admin Not Found");
      }
      this.setState({ errors });
    }

    this.setState({ isLoading: false });
  };

  render() {
    const { isEditView, isProfileView, profilePath, isLoading } = this.state;

    let heading = "Register";
    if (isEditView) heading = "Edit";
    if (isProfileView) heading = "Profile";

    return (
      <div className="card shadow-lg " style={{ minWidth: "400px" }}>
        {isLoading && <Loading />}
        <div className="card-header d-flex justify-content-center">
          <h5 className="h5 pt-2">{heading} Super Admin</h5>
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className="card-body px-5">
            <div className="d-flex justify-content-center align-items-center p-2">
              {this.renderPictureUpload(
                "profilePath",
                this.handleProfilePicture,
                profilePath,
                isProfileView,
                this.handleRemoveProfilePicture
              )}
            </div>
            {this.renderInput("name", "Name", "text", isProfileView)}
            {this.renderInput("email", "Email", "text", isProfileView)}
          </div>
          <div className="d-flex justify-content-end pr-5  mb-4">
            {isProfileView
              ? this.renderEditButton()
              : isEditView
              ? this.renderButton("Update")
              : this.renderButton("Register")}
          </div>
        </form>
      </div>
    );
  }
}

export default SuperAdminForm;
