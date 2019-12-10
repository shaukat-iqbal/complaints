import React from "react";
import {
  getCategoriesWithNoParent,
  getCategoryById,
  getToolTipLabels,
  getFullPaths,
  getSinglePath,
  getMultiplePaths
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
import { toast } from "react-toastify";
import { getConfigToken } from "../../../services/configurationService";
import Locations from "../../common/Locations";

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
    locations: [],
    isLoading: true,
    tooltips: []
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
      let configToken = getConfigToken();
      if (configToken) {
        this.state.companyId = configToken.companyId;
        user.companyId = configToken.companyId;
      }
    }
    this.state.currentUser = user;
    this.state.companyId = user.companyId;
    //siProfile determines wheter to view the form as profile i.e view details
    this.state.isProfileView = props.isProfileView;
    this.state.isEditView = props.isEditView;
    this.state.isLoading = true;
    if (
      !(props.isProfileView || props.isEditView) &&
      user &&
      user.role !== "admin" &&
      !props.stepper
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
    if (props.match) {
      this.state.companyId = props.match.params.companyId;
    }
  }

  async componentDidMount() {
    if (this.props.match) {
      const { id, role } = this.props.match.params;
      if (id && role) {
        this.populateUserDetails(id, role.substring(0, role.length - 1));
      }
    }
    this.setState({ isLoading: false });
  }

  getToolTips = async responsibilities => {
    if (responsibilities.length < 1) return [];
    let { data } = await getMultiplePaths({
      responsibilities: responsibilities
    });
    let tooltips = this.getFullPath(data);
    this.setState({ tooltips });
  };

  getFullPath = responsibilitiesPaths => {
    let tooltips = [];
    responsibilitiesPaths.forEach(path => {
      let tooltip = "";
      path.forEach(category => {
        tooltip += " /" + category.name;
      });
      tooltips.push(tooltip);
    });

    return tooltips;
  };

  populateUserDetails = async (userId, role) => {
    try {
      const { data: user } = await getUser(userId, role);
      const data = {};
      let responsibilities = [];
      let tooltips = [];
      let isAssignee = false;
      if (role === "assignee") {
        isAssignee = true;
        responsibilities = user.responsibilities;
        tooltips = this.getToolTips(responsibilities);
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
        isLoading: false,
        tooltips
      });
    } catch (error) {
      if (error.response && error.response.status === "404") {
        alert("user not found");
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

  handleOnCategorySeletion = async selectedCategory => {
    this.setState({
      tempSelectedCategory: selectedCategory,
      showLocationsDialog: true,
      showCategoriesDialog: false
    });
    // const responsibilities = [...this.state.responsibilities];
    // let category = responsibilities.find(c => c._id === selectedCategory._id);
    // if (!category) {
    //   responsibilities.push(selectedCategory);
    // }
    // this.setState({ responsibilities, showCategoriesDialog: false });
    // let { data: tooltip } = await getSinglePath(selectedCategory._id);
    // let arr = [tooltip];
    // let ttip = this.getFullPath(arr);
    // let { tooltips } = this.state;
    // tooltips.push(ttip[0]);
    // this.setState({ tooltips });
  };

  handleOnLocationSeletion = async selectedLocation => {
    this.setState({
      tempSelectedLocation: selectedLocation,
      showLocationsDialog: false
    });
    this.assignResponsibility();
  };

  assignResponsibility = () => {
    const {
      tempSelectedLocation,
      tempSelectedCategory,
      responsibilities
    } = this.state;
    let responsibility = {
      location: tempSelectedLocation,
      category: tempSelectedCategory
    };

    let index = responsibilities.findIndex(
      resp =>
        resp.location._id === tempSelectedLocation._id &&
        resp.category._id === tempSelectedCategory._id
    );
    if (index < 0) {
      responsibilities.push(responsibility);
    }
    this.setState({
      responsibilities,
      tempSelectedCategory: null,
      tempSelectedLocation: null
    });
  };

  handleDelete = ({ currentTarget }) => {
    const responsibilities = [...this.state.responsibilities];
    let responsibility = currentTarget.value;
    const index = responsibilities.indexOf(responsibility);
    responsibilities.splice(index, 1);
    this.setState({ responsibilities });
  };

  handleLocationsClose = () => {
    this.setState({ showLocationsDialog: false });
  };

  doSubmit = async () => {
    //only compare passwrods when complainer or assignee is creating account by themselves
    this.setState({ isLoading: true });
    let userId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      userId = id;
    }
    const { role } = this.state.currentUser;
    if (role !== "admin") {
      const error = this.validatePassword();
      const errors = { ...this.state.errors };
      if (error) {
        errors.confirmPassword = error;
        this.setState({ errors, isLoading: false });
        return;
      }
    }

    const fd = createFormData(this.state);
    try {
      if (userId) {
        await updateUser(userId, fd, this.state.isAssignee);
        this.setState({
          isEditView: false,
          isProfileView: true,
          isLoading: false
        });
        toast.success("User Successfully updated");
        return;
      } else {
        await registerUser(fd, this.state.isAssignee);

        toast.success("User create successfully.");
        this.setState({ isLoading: false });
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
        this.setState({ errors, isLoading: false });
      } else if (error.response && error.response.status === 404) {
        let errors = { ...this.state.errors };
        errors.email = error.response.data;
        this.setState({ errors, isLoading: false });
      }
    }
  };

  render() {
    let userId;
    if (this.props.match) {
      const { id } = this.props.match.params;
      userId = id;
    }
    const {
      isEditView,
      isProfileView,
      profile,
      isAssignee,
      currentUser,
      showCategoriesDialog,
      responsibilities,
      isLoading,
      tooltips,
      showLocationsDialog
    } = this.state;
    const { role } = currentUser;

    let heading = "Register";
    if (isEditView) heading = "Edit";
    if (isProfileView) heading = "Profile";
    return (
      <div>
        <div className="card w-50 mb-4 shadow-lg" style={{ minWidth: "400px" }}>
          {isLoading && <Loading />}
          <div className="card-header d-flex justify-content-center">
            <h5 className="h5 pt-2">
              {heading} {isAssignee ? "Assignee" : "Complainer"}
            </h5>
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
              {this.renderSwitch(
                "userType",
                "Is Assignee?",
                this.handleUserType,
                isAssignee,
                !this.props.stepper &&
                  (isProfileView || isEditView || currentUser.role === "guest")
              )}
              {this.renderInput("name", "Name", "text", isProfileView)}
              {this.renderInput("email", "Email", "text", isProfileView)}

              {/* create new component and put passwords input into that */}
              {!(isProfileView || isEditView) &&
              role !== "admin" &&
              !this.props.stepper
                ? this.renderPasswords()
                : null}

              {this.renderInput("phone", "Phone#", "tel", isProfileView)}

              {isAssignee && (
                <React.Fragment>
                  <AssignedCategoriesList
                    responsibilities={responsibilities}
                    onDelete={this.handleDelete}
                    hidden={
                      isProfileView || this.state.currentUser.role !== "admin"
                    }
                    tooltips={tooltips}
                  />
                  {this.state.currentUser.role === "admin" &&
                    this.renderCategoriesDialogButton(
                      this.handleCategoryDialogButton,
                      isProfileView
                    )}
                </React.Fragment>
              )}

              <Categories
                isLoading={true}
                onCategorySeletion={this.handleOnCategorySeletion}
                isOpen={showCategoriesDialog}
                onClose={this.handleDialogClose}
              />
              <Locations
                isLoading={true}
                onCategorySeletion={this.handleOnLocationSeletion}
                isOpen={showLocationsDialog}
                onClose={this.handleLocationsClose}
              />
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

export default RegisterForm;
