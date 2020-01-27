import React from "react";
import Form from "./form";
import Loading from "./loading";
import Joi from "joi-browser";
import _ from "lodash";
import { compressImage } from "../../services/imageService";
import {
  updateCompanyDetails,
  insertCompanyDetails,
  createDetailsFormData
} from "../../services/companyDetailsService";
import { toast } from "react-toastify";
import { getCompany } from "../../services/companiesService";
import { convertToPicture } from "../../services/userService";
class CompanyDetailsForm extends Form {
  state = {
    data: {
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "active"
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
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    status: Joi.string()
      .required()
      .label("Status of Company"),
    phone: Joi.string()
      .required()
      .min(9)
      .label("Phone number")
  };

  constructor(props) {
    super(props);
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
    if (this.props.match && this.props.match.params.id) {
      this.state.companyId = this.props.match.params.id;
    }
    if (props.company) {
      this.state.companyId = props.company._id;
    }
  }

  async componentDidMount() {
    let { companyId } = this.state;
    if (this.props.company) {
      this.populateUserDetails(this.props.company);
    } else if (companyId) {
      const { data: company } = await getCompany(companyId);
      this.populateUserDetails(company);
    } else {
      this.setState({ isLoading: false });
    }
  }

  populateUserDetails = company => {
    try {
      let data = {};
      data.name = company.name;
      data.address = company.address;
      data.phone = company.phone;
      data.status = company.status;
      data.email = company.email;
      if (company.profilePicture) {
        var profilePicture = convertToPicture(company.profilePicture.data);
      }
      this.setState({
        data,
        profilePath: company.profilePath,
        profile: profilePicture,
        isLoading: false
      });
    } catch (error) {
      if (error.response && error.response.status === "404") {
        alert("company not found");
      }
    }
  };

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
    this.setState({ isLoading: true });
    let { isEditView, companyId } = this.state;

    const fd = createDetailsFormData(this.state);

    try {
      if (isEditView) {
        await updateCompanyDetails(fd, companyId);
        toast.success("Company profile updated");
        // this.props.history.push("/login");
      } else {
        await insertCompanyDetails(fd);
        toast.success("New Company added.");
      }
      this.setState({ isLoading: false });

      if (this.props.enableNext) this.props.enableNext();
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
    const { isEditView, isProfileView, profile, isLoading, data } = this.state;

    let options = [
      { _id: "Active", name: "Active" },
      { _id: "De-Activated", name: "De-Activated" }
    ];
    options.forEach(option => {
      if (option.name === data.status) option.selected = true;
      return option;
    });

    let heading = "Enter";
    if (isEditView) heading = "Edit";
    if (isProfileView) heading = "";
    return (
      <div>
        <div className="card shadow-lg">
          {isLoading && <Loading />}
          <div className="card-header d-flex justify-content-center">
            <h5 className="h5 pt-2">{heading} Company Details</h5>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="card-body px-5 ">
              <div className="d-flex justify-content-center align-items-center p-2">
                {this.renderPictureUpload(
                  "profilePath",
                  this.handleProfilePicture,
                  profile,
                  isProfileView,
                  this.handleRemoveProfilePicture
                )}
              </div>
              <div className="row">
                <div className="col-lg-6">
                  {this.renderInput(
                    "name",
                    "Company Name",
                    "text",
                    isProfileView
                  )}
                  {this.renderInput(
                    "email",
                    "Company Email",
                    "email",
                    isProfileView
                  )}
                  {this.renderInput("phone", "Phone#", "tel", isProfileView)}
                </div>
                <div className="col-lg-6">
                  {this.renderSelect(
                    "status",
                    "Status",
                    options,
                    isProfileView
                  )}
                  {this.renderInput(
                    "address",
                    "Address",
                    "text",
                    isProfileView
                  )}
                </div>
              </div>
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
      </div>
    );
  }
}

export default CompanyDetailsForm;
