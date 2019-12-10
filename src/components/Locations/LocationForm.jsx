import React from "react";
import Form from "../../components/common/form";
import Locations from "../../components/common/Locations";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Joi from "joi-browser";
import {
  createLocation,
  updateLocationById,
  getLocations,
  getRootLocation
} from "../../services/locationService";
import Loading from "../common/loading";
class LocationForm extends Form {
  state = {
    data: {
      name: "",
      parentLocation: "",
      hasChild: "false"
    },
    errors: {}
  };
  schema = {
    name: Joi.string()
      .min(4)
      .required(),
    parentLocation: Joi.string(),
    hasChild: Joi.boolean()
  };
  async componentDidMount() {
    this.setState({ isLoading: true });
    const { data: allCategories } = await getLocations();
    this.setState({ allCategories });
    this.populateForm(this.props.category, allCategories);
  }

  populateForm = async (category, allCategories) => {
    let { data } = this.state;
    let parentLocationName = null;
    if (this.props.requestType === "addChild") {
      data.parentLocation = category._id;
      parentLocationName = this.getparentCategoryName(category._id).name;
    } else if (this.props.requestType === "edit") {
      data.name = category.name;
      data.hasChild = category.hasChild;
      if (category.parentLocation) {
        data.parentLocation = category.parentLocation;
        parentLocationName = this.getparentCategoryName(category.parentLocation)
          .name;
      } else {
        let { data: root } = await getRootLocation();
        if (root) {
          data.parentLocation = root._id;
          parentLocationName = "Root";
        }
      }
    } else if (this.props.requestType === "new") {
      data.hasChild = false;
      let { data: root } = await getRootLocation();
      console.log(root);
      data.parentLocation = root._id;
    }
    this.setState({
      data,
      requestType: this.props.requestType,
      parentLocationName,
      category,
      isLoading: false
    });
  };

  getparentCategoryName = id => {
    let parentLocation = this.state.allCategories.find(c => c._id === id);
    return parentLocation;
  };
  handleOnCategorySeletion = id => {
    let { data } = this.state;
    data.parentLocation = id;
    let parentLocationName = this.getparentCategoryName(id).name;
    this.setState({
      data,
      parentLocationName,
      showCategoriesDialog: false
    });
  };

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      let category = null;
      if (this.state.requestType === "edit") {
        let { data } = await updateLocationById(
          this.state.category._id,
          this.state.data
        );
        category = data.location;
        console.log(category);
      } else if (this.state.requestType === "addChild") {
        let { data } = await createLocation(this.state.data);
        category = data;
      } else if (this.state.requestType === "new") {
        let { data } = await createLocation(this.state.data);
        category = data;
      }
      this.props.onSubmitForm(category);
    } catch (error) {
      console.log(error);
    }
    this.setState({ isLoading: false });
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
          height="500px"
        >
          <DialogTitle id="form-dialog-title">Category</DialogTitle>
          <form onSubmit={this.handleSubmit}>
            <DialogContent dividers={true}>
              <div className="card-body sahdow-lg">
                {this.state.isLoading && <Loading />}
                {this.renderInput("name", "Category Name")}
                <label className="d-inline-block">Parent Category</label>
                <div className=" ml-3 d-inline-block">
                  {this.renderCategoriesDialogButton(
                    this.handleCategoryDialogButton,
                    false,
                    this.state.parentLocationName
                      ? this.state.parentLocationName
                      : "Root Category",
                    this.props.requestType === "addChild"
                  )}
                </div>
                <Locations
                  isLoading={true}
                  onCategorySeletion={this.handleOnCategorySeletion}
                  isOpen={this.state.showCategoriesDialog}
                  onClose={this.handleDialogClose}
                  isCrud={true}
                />
              </div>
            </DialogContent>
            <DialogActions>
              {this.renderButton("Submit")}
              <button
                className="btn btn-primary rounded-pill"
                onClick={this.props.onClose}
              >
                Close
              </button>
            </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default LocationForm;
