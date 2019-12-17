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
    try {
      const { data: allLocations } = await getLocations();
      this.setState({ allLocations });

      this.populateForm(this.props.location, allLocations);
    } catch (error) {
      this.setState({ isLoading: false });
      this.populateForm(this.props.location);
    }
  }

  populateForm = async location => {
    let { data } = this.state;
    let parentLocationName = null;
    if (this.props.requestType === "addChild") {
      data.parentLocation = location._id;
      parentLocationName = this.getparentLocationName(location._id).name;
    } else if (this.props.requestType === "edit") {
      data.name = location.name;
      data.hasChild = location.hasChild;
      if (location.parentLocation) {
        data.parentLocation = location.parentLocation;
        parentLocationName = this.getparentLocationName(location.parentLocation)
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
      location,
      isLoading: false
    });
  };

  getparentLocationName = id => {
    let parentLocation = this.state.allLocations.find(c => c._id === id);
    return parentLocation;
  };
  handleOnLocationSeletion = id => {
    let { data } = this.state;
    data.parentLocation = id;
    let parentLocationName = this.getparentLocationName(id).name;
    this.setState({
      data,
      parentLocationName,
      showCategoriesDialog: false
    });
  };

  doSubmit = async () => {
    this.setState({ isLoading: true });
    try {
      let location = null;
      if (this.state.requestType === "edit") {
        let { data } = await updateLocationById(
          this.state.location._id,
          this.state.data
        );
        location = data.location;
        console.log(location);
      } else if (this.state.requestType === "addChild") {
        let { data } = await createLocation(this.state.data);
        location = data;
      } else if (this.state.requestType === "new") {
        let { data } = await createLocation(this.state.data);
        location = data;
      }
      this.props.onSubmitForm(location);
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
                  onCategorySeletion={this.handleOnLocationSeletion}
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
