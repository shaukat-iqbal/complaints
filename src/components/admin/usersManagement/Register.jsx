import React from "react";
import {
  getCategoriesWithNoParent,
  getCategoryById
} from "../../../services/categoryService";
import {
  registerUser,
  updateUser,
  createFormData,
  getUser,
  convertToPicture
} from "../../../services/userService";
import Joi from "joi-browser";
import Form from "../../common/form";
import Categories from "../../common/categories";
import AssignedCategoriesList from "./responsibilities";
import { getCurrentUser } from "../../../services/authService";
import Loading from "../../common/loading";
import { compressImage } from "../../../services/imageService";

class RegisterForm extends Form {
  state = {
    data: {
      name: "",
      email: "",
      phone: ""
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
      .label("Phone number")
  };

  constructor(props) {
    super(props);
    let user = getCurrentUser();
    if (!user) {
      user = { role: "guest" };
    }
    this.state.currentUser = user;
    //siProfile determines wheter to view the form as profile i.e view details
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
    if (
      !(props.isProfileView || props.isEditView) &&
      user &&
      user.role !== "admin"
    ) {
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
    const { id, role } = this.props.match.params;
    if (id && role) {
      this.populateUserDetails(id, role.substring(0, role.length - 1));
    } else {
      this.setState({ isLoading: false });
    }
  }

  populateUserDetails = async (userId, role) => {
    try {
      const { data: user } = await getUser(userId, role);
      const data = {};
      let responsibilities = [];
      let isAssignee = false;
      if (role === "assignee") {
        isAssignee = true;
        responsibilities = user.responsibilities;
      }
      data.name = user.name;
      data.email = user.email;
      data.phone = user.phone;
      if (user.profilePicture) {
        var profilePicture = convertToPicture(user.profilePicture.data);
      }
      this.setState({
        data,
        responsibilities,
        isAssignee,
        profilePath: user.profilePath,
        profile: profilePicture,
        isLoading: false
      });
    } catch (error) {
      if (error.response && error.response.status === "404") {
        alert("user not found");
      }
    }
  };

  handleResponsibilitiesAssignment = () => {
    this.setState({ showCategoriesDialog: true });
  };

  handleRemoveProfilePicture = () => {
    this.setState({ profile: null, profilePath: null });
  };

  handleProfilePicture = async event => {
    let profile = this.state.profile;
    let profilePath = this.state.profilePath;
    if (event.target.files[0]) {
      profile = URL.createObjectURL(event.target.files[0]);
      console.log("Old file size", event.target.files[0].size / 1024 / 1024);
      this.setState({ profile });
      profilePath = await compressImage(event.target.files[0]);
      profile = URL.createObjectURL(profilePath);
      console.log("New file size", profilePath.size / 1024 / 1024);
    }
    this.setState({
      profilePath,
      profile
    });
  };

  handleUserType = async e => {
    const categories = [...this.state.categories];
    if (categories.length < 1) {
      try {
        const { data: rootCategories } = await getCategoriesWithNoParent();
        this.setState({
          categories: rootCategories,
          isAssignee: !this.state.isAssignee
        });
      } catch (error) {
        if (error.response && error.response.status === "404") {
          console.log("No Root category found");
        }
      }
      return;
    }
    this.setState({ isAssignee: !this.state.isAssignee });
  };

  // to close the opened categories dialog
  handleDialogClose = () => {
    this.setState({ showCategoriesDialog: false });
  };

  handleOnCategorySeletion = async id => {
    const responsibilities = [...this.state.responsibilities];
    const category = responsibilities.filter(category => category._id === id);
    if (category.length === 0) {
      const { data: category } = await getCategoryById(id);
      responsibilities.push(category);
    }
    this.setState({ responsibilities, showCategoriesDialog: false });
  };

  handleDelete = ({ currentTarget }) => {
    const responsibilities = [...this.state.responsibilities];
    const index = responsibilities.indexOf(currentTarget.value);
    responsibilities.splice(index, 1);
    this.setState({ responsibilities });
  };

  doSubmit = async () => {
    //only compare passwrods when complainer or assignee is creating account by themselves
    const { id: userId } = this.props.match.params;
    const { role } = this.state.currentUser;
    if (role !== "admin") {
      const error = this.validatePassword();
      const errors = { ...this.state.errors };
      if (error) {
        errors.confirmPassword = error;
        this.setState({ errors });
        return;
      }
    }
    const fd = createFormData(this.state);
    try {
      if (userId) {
        await updateUser(userId, fd, this.state.isAssignee);
      } else {
        await registerUser(fd, this.state.isAssignee);
      }
      if (role !== "admin") {
        this.props.history.push("/login");
        return;
      }
      this.state.isAssignee
        ? this.props.history.push("/admin/users/assignees")
        : this.props.history.push("/admin/users/complainers");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        let errors = { ...this.state.errors };
        errors.email = error.response.data;
        this.setState({ errors });
      } else if (error.response && error.response.status === 404) {
        let errors = { ...this.state.errors };
        errors.email = error.response.data;
        this.setState({ errors });
      }
    }
  };
  render() {
    const { id: userId } = this.props.match.params;
    const { role } = this.state.currentUser;

    return (
      <div>
        <div className="card w-50" style={{ minWidth: "400px" }}>
          {this.state.isLoading && <Loading />}
          <div className="card-header d-flex justify-content-center">
            <h5 className="h5 pt-2">
              Register {this.state.isAssignee ? "Assignee" : "Complainer"}
            </h5>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="card-body px-5">
              <div className="d-flex justify-content-center align-items-center p-2">
                {this.renderPictureUpload(
                  "profilePath",
                  this.handleProfilePicture,
                  this.state.profile,
                  this.state.isProfileView,
                  this.handleRemoveProfilePicture
                )}
              </div>
              {this.renderSwitch(
                "userType",
                "Is Assignee?",
                this.handleUserType,
                this.state.isAssignee,
                this.state.isProfileView ||
                  this.state.isEditView ||
                  this.state.currentUser.role === "guest"
              )}
              {this.renderInput(
                "name",
                "Name",
                "text",
                this.state.isProfileView
              )}
              {this.renderInput(
                "email",
                "Email",
                "text",
                this.state.isProfileView
              )}

              {/* create new component and put passwords input into that */}
              {!(this.state.isProfileView || this.state.isEditView) &&
              role !== "admin"
                ? this.renderPasswords()
                : null}

              {this.renderInput(
                "phone",
                "Phone#",
                "tel",
                this.state.isProfileView
              )}

              {this.state.isAssignee && (
                <React.Fragment>
                  <AssignedCategoriesList
                    responsibilities={this.state.responsibilities}
                    onDelete={this.handleDelete}
                    hidden={this.state.isProfileView}
                  />
                  {this.renderAssignResponsibilitiesButton(
                    this.handleResponsibilitiesAssignment,
                    this.state.isProfileView
                  )}
                </React.Fragment>
              )}

              <Categories
                isLoading={true}
                onCategorySeletion={this.handleOnCategorySeletion}
                isOpen={this.state.showCategoriesDialog}
                onClose={this.handleDialogClose}
                categories={this.state.categories}
              />
            </div>
            <div className="card-footer">
              {this.state.isProfileView
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

export default RegisterForm;
