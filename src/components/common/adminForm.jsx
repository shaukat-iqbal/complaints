import React from "react";
import {
  getUser,
  convertToPicture,
  updateAdmin
} from "../../services/userService";
import Joi from "joi-browser";
import { getCurrentUser, login } from "../../services/authService";
import Loading from "./loading";
import { compressImage } from "../../services/imageService";
import { toast } from "react-toastify";
import { createDetailsFormData } from "../../services/companyDetailsService";
import { registerAdmin } from "../../services/userService";
import Form from "./form";
import httpService from "../../services/httpService";

class AdminForm extends Form {
  state = {
    data: {
      name: "",
      email: "",
      phone: "",
      companyId: ""
    },
    profile: "",
    profilePath: null,
    showCategoriesDialog: false,
    responsibilities: [],
    errors: {},
    isAssignee: false,
    categories: [],
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
      .label("Email"),

    phone: Joi.string()
      .required()
      .min(9)
      .label("Phone number"),
    companyId: Joi.string().required()
  };

  constructor(props) {
    super(props);
    let user = getCurrentUser();
    this.state.currentUser = user;
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
    if (!(props.isProfileView || props.isEditView)) {
      this.state.data.password = "";
      this.state.data.confirmPassword = "";
      this.schema.password = Joi.string()
        .required()
        .min(8)
        .label("Password");
      this.schema.confirmPassword = Joi.string()
        .required()
        .min(8)
        .label("Confirm Password");
    }
  }

  async componentDidMount() {
    // window.addEventListener("beforeunload ", event => {
    //   event.returnValue = `Are you sure you want to leave?`;
    // });
    // window.addEventListener("popstate", event => {
    //   // alert(confirm("fbmsdbnc"));\
    //   alert("you are leaving");
    // });
    if (this.props.companyId) {
      let { data } = this.state;
      data.companyId = this.props.companyId;
      this.setState({ data });
    }
    if (this.props.match) {
      const { id, role } = this.props.match.params;
      if (id && role) {
        this.populateUserDetails(id, role.substring(0, role.length - 1));
      }
    } else {
      this.setState({ isLoading: false });
    }
  }

  populateUserDetails = async (userId, role) => {
    try {
      const { data: user } = await getUser(userId, role);
      // if(!user)return;
      const data = {};
      data.name = user.name;
      data.email = user.email;
      data.phone = user.phone;
      data.companyId = user.companyId;
      if (user.profilePicture) {
        var profilePicture = convertToPicture(user.profilePicture.data);
      }
      this.setState({
        data,
        profilePath: user.profilePath,
        profile: profilePicture,
        isLoading: false
      });
    } catch (error) {
      if (error.response && error.response.status === "404") {
        toast.warn("Not found");
      }
    }
  };

  handleRemoveProfilePicture = () => {
    this.setState({ profile: null, profilePath: null });
  };

  handleProfilePicture = async event => {
    let { profile, profilePath } = this.state;
    if (event.target.files[0]) {
      if (event.target.files[0].type.split("/")[0] !== "image") {
        toast.warn("Please attach image file");
        return;
      }
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
    //only compare passwrods when complainer or assignee is creating account by themselves

    let userId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      userId = id;
    }
    const { isProfileView, isEditView } = this.props;
    if (!isProfileView && !isEditView) {
      const error = this.validatePassword();
      const errors = { ...this.state.errors };
      if (error) {
        errors.confirmPassword = error;
        this.setState({ errors });
        return;
      }
    }

    let body = {
      data: { ...this.state.data },
      profilePath: this.state.profilePath
    };

    const fd = createDetailsFormData(body);
    this.setState({ isLoading: true });
    try {
      if (userId) {
        await updateAdmin(userId, fd);
        this.setState({ isProfileView: true, isEditView: false });
        toast.info("Account Updated");
      } else {
        await registerAdmin(fd);
        //because next steps depend on company id that can be accessed by backend easily
        if (this.props.isStepper) {
          let response = await login(
            this.state.data.email,
            this.state.data.password,
            this.state.data.companyId,
            "/auth-admin"
          );
          console.log(response.headers["x-auth-token"]);
          localStorage.setItem("token", response.headers["x-auth-token"]);
          httpService.setJwt(response.headers["x-auth-token"]);
        }
        toast.info("Account Created");
      }
      if (this.props.enableNext) this.props.enableNext();
    } catch (error) {
      let errors = { ...this.state.errors };
      if (error.response && error.response.status === 400) {
        toast.warn("Already Registered");

        errors.email = error.response.data;
      } else if (error.response && error.response.status === 404) {
        errors.email = error.response.data;
        toast.warn("Admin Not Found");
      }
      this.setState({ errors });
    }
    this.setState({ isLoading: false });
  };
  render() {
    let userId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      userId = id;
    }
    const { isEditView, isProfileView, profile, isLoading } = this.state;

    let heading = "Register";
    if (isEditView) heading = "Edit";
    if (isProfileView) heading = "Profile";
    return (
      <div>
        <div className="card w-50 mb-4 shadow-lg" style={{ minWidth: "400px" }}>
          {isLoading && <Loading />}
          <div className="card-header d-flex justify-content-center">
            <h5 className="h5 pt-2">{heading} Admin</h5>
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
              {this.renderInput("name", "Name", "text", isProfileView)}
              {this.renderInput("email", "Email", "text", isProfileView)}
              {!(isProfileView || isEditView) ? this.renderPasswords() : null}
              {this.renderInput("phone", "Phone#", "tel", isProfileView)}
            </div>
            <div className="d-flex justify-content-end pr-5  mb-4">
              {isProfileView
                ? this.renderEditButton()
                : userId
                ? this.renderButton("Update")
                : this.renderButton("Register")}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default AdminForm;
