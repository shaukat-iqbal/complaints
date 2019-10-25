import React from "react";
import Form from "./form";
import Loading from "./loading";
import Joi from "joi-browser";
import { compressImage } from "../../services/imageService";
import {
  updateCompanyDetails,
  insertCompanyDetails,
  createDetailsFormData
} from "../../services/companyDetailsService";
import { toast } from "react-toastify";
class CompanyDetailsForm extends Form {
  state = {
    data: {
      name: "",
      address: "",
      phone: ""
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
    address: Joi.string()
      .required()
      .label("Address"),

    phone: Joi.string()
      .required()
      .min(9)
      .label("Phone number")
  };

  constructor(props) {
    super(props);
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
  }

  componentDidMount() {
    this.setState({ isLoading: false });
  }
  handleRemoveProfilePicture = () => {
    this.setState({ profile: null, profilePath: null });
  };

  handleProfilePicture = async event => {
    let { profile, profilePath } = this.state;
    if (event.target.files[0]) {
      profile = URL.createObjectURL(event.target.files[0]);
      this.setState({ profile });
      profilePath = await compressImage(event.target.files[0]);
      profile = URL.createObjectURL(profilePath);
    }
    this.setState({
      profilePath,
      profile
    });
  };

  doSubmit = async () => {
    let companyId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      companyId = id;
    }
    const fd = createDetailsFormData(this.state);
    try {
      if (companyId) {
        await updateCompanyDetails(fd, companyId);
        // this.props.history.push("/login");
        return;
      } else {
        let { data: form } = await insertCompanyDetails(
          fd,
          this.state.isAssignee
        );
        console.log(form);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        let errors = { ...this.state.errors };
        errors.name = error.response.data;
        this.setState({ errors });
      } else if (error.response && error.response.status === 404) {
        toast.warn("Not Found: Company Id");
        let errors = { ...this.state.errors };
        errors.name = error.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    let companyId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      companyId = id;
    }
    // let companyId = "helo";
    const { isEditView, isProfileView, profile, isLoading } = this.state;
    const { onNext } = this.props;
    let heading = "Enter";
    if (isEditView) heading = "Edit";
    if (isProfileView) heading = "Profile";
    return (
      <div>
        <div className="card w-50 mb-4 shadow-lg" style={{ minWidth: "400px" }}>
          {isLoading && <Loading />}
          <div className="card-header d-flex justify-content-center">
            <h5 className="h5 pt-2">{heading} Company Details</h5>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="card-body px-5">
              <div className="d-flex justify-content-center align-items-center p-2">
                {this.renderPictureUpload(
                  "profilePath",
                  this.handleProfilePicture,
                  profile,
                  isProfileView,
                  this.handleRemoveProfilePicture
                )}
              </div>
              {this.renderInput("name", "Company Name", "text", isProfileView)}
              {this.renderInput("address", "Address", "text", isProfileView)}
              {this.renderInput("phone", "Phone#", "tel", isProfileView)}
            </div>

            <div className="d-flex justify-content-end pr-5  mb-4">
              {isProfileView
                ? this.renderEditButton()
                : companyId
                ? this.renderButton("Update")
                : this.renderButton("Register")}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CompanyDetailsForm;
