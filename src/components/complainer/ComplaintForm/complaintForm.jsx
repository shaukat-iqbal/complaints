import React from "react";
import Joi from "joi-browser";
import { DialogActions } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { toast } from "react-toastify";
import { compressImage } from "../../../services/imageService";
import Form from "../../common/form";
import {
  getCategories,
  getSentimentCategory
} from "../../../services/categoryService";
import { saveComplaint } from "../../../services/complaintService";
import Modal from "../../common/Modal/Modal";
import Spinner from "../../common/Spinner/Spinner";
import Categories from "../../common/categories";
import { getAllowedAttachments } from "../../../services/attachmentsService";
import "./complaintForm.css";
import { MyLocation } from "@material-ui/icons";
import { getConfigToken } from "../../../services/configurationService";
class ComplaintForm extends Form {
  state = {
    data: {
      title: "",
      location: ""
    },
    categoryId: "",
    details: "",
    sentimentCategory: "",
    categoryError: "",
    detailsError: "",
    errors: {},
    categories: [],
    isLoading: true,
    isDialogOpen: false,
    selectedFile: null,
    open: true,
    showCategoriesDialog: false
  };

  schema = {
    title: Joi.string()
      .required()
      .min(5)
      .max(1024)
      .label("Title"),

    location: Joi.string()
      .min(5)
      .max(255)
      .label("Location")
  };
  constructor(props) {
    super(props);
    let token = getConfigToken();
    if (token) {
      this.state.configToken = token;
      this.schema.severity = Joi.string()
        .min(1)
        .label("Severity");
    }
  }
  // componentDidMount
  async componentDidMount() {
    await this.populateCategories();
    this.setState({ isLoading: false });
  }

  getLocation = () => {
    window.navigator.geolocation.getCurrentPosition(position => {
      this.setState({ coords: position.coords });
    });
  };
  async populateCategories() {
    const { data: categories } = await getCategories();
    this.setState({ categories });
  }

  handleCategorySelect = categoryId => {
    this.setState({ categoryError: "" });
    this.setState({ categoryId: categoryId });
  };

  ToggleConfirmation = e => {
    e.preventDefault();
    console.log(this.state);
    if (this.state.details.length <= 10) {
      return this.setState({
        detailsError: "Details must be atleast 10 characters long."
      });
    }

    if (!this.state.categoryId) {
      return this.setState({
        categoryError: "Category is not allowed to be empty"
      });
    }

    this.setState({ isLoading: false });
    this.setState({ isDialogOpen: true });
  };

  cancelDialog = () => {
    this.setState({ isDialogOpen: false });
  };

  handleFileChange = async e => {
    let { attachments } = this.state;
    // if (this.checkMimeType(e)) {
    if (!e.target.files[0]) return;
    let file = e.target.files[0];
    if (!attachments) {
      let { data } = await getAllowedAttachments();
      this.setState({ allowedAttachments: data });
      attachments = data;
    }
    let type = attachments.find(
      a =>
        a.extentionName.toLowerCase() === file.name.split(".")[1].toLowerCase()
    );
    if (!type) {
      toast.error(
        "You cannot attach '." +
          file.name.split(".")[1].toLowerCase() +
          "' type file."
      );
      return;
    }
    this.setState({ selectedFile: file });

    let compressedImg = await compressImage(file);
    console.log("Un KBs", file.size / 1024);
    console.log("compressed KBs", compressedImg.size / 1024);
    if (compressedImg.size / 1024 > +type.maxSize) {
      toast.error("The file size is larger than allowed size.");
      this.setState({ selectedFile: null });

      return;
    }
    this.setState({ selectedFile: compressedImg });
  };

  doSubmit = async () => {
    this.setState({ isDialogOpen: false });
    this.setState({ isLoading: true });

    const data = new FormData();
    data.append("title", this.state.data.title);
    data.append("details", this.state.details);
    data.append("location", this.state.data.location);
    data.append("categoryId", this.state.categoryId);
    data.append("complaint", this.state.selectedFile);
    if (this.state.data.longitude && this.state.data.latitude) {
      data.append("longitude", this.state.coords.longitude);
      data.append("latitude", this.state.coords.latitude);
    }
    if (this.state.data.severity)
      data.append("severity", this.state.data.severity);
    try {
      await saveComplaint(data);
      toast.success("Complaint is successfully registered.");
      this.props.history.replace("/complainer");
    } catch (error) {
      toast.error("Could not lodge a complaint");
    }
    this.setState({ isLoading: false });
  };

  // for file
  checkMimeType = event => {
    //getting file object
    let file = event.target.files[0];
    //define message container
    let err = "";
    // list allow mime type
    const types = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    // loop access array
    if (types.every(type => file.type !== type)) {
      // create error message and assign to container
      err += file.type + " is not a supported format\n";
    }

    if (err !== "") {
      // if message not same old that mean has error
      event.target.value = null; // discard selected file
      console.log(err);
      // toast.error(err);
      return false;
    }
    return true;
  };

  handleClose = () => {
    this.setState({ open: false });
    this.props.history.replace("/complainer");
  };

  handleDetailsChange = ({ currentTarget: input }) => {
    this.setState({ detailsError: "" });
    this.setState(prevState => {
      return {
        details: input.value
      };
    });
  };
  handleCategoryButton = () => {
    this.setState({ showCategoriesDialog: true });
  };
  handleOnCategorySeletion = id => {
    const categories = this.state.categories;
    const category = categories.find(c => c._id === id);

    if (category) {
      this.setState({
        sentimentCategory: category,
        categoryId: id,
        showCategoriesDialog: false,
        categoryError: ""
      });
    }
  };

  handleDialogClose = () => {
    this.setState({ showCategoriesDialog: false });
  };

  handleDetailsBlur = async () => {
    const details = { details: this.state.details };
    const { data } = await getSentimentCategory(details);
    this.setState(prevState => {
      return {
        sentimentCategory: data,
        categoryId: data._id
      };
    });
    console.log(this.state.sentimentCategory);
  };

  render() {
    return (
      <React.Fragment>
        <Dialog
          open={this.state.open}
          // onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          scroll={"paper"}
        >
          <Modal show={this.state.isDialogOpen}>
            <p>You can't edit complaint after registering</p>
            <div className="float-right">
              <button className="btn btn-danger" onClick={this.cancelDialog}>
                Cancel
              </button>
              <button
                className="btn ml-3  btn-success"
                onClick={this.handleSubmit}
              >
                Ok
              </button>
            </div>
          </Modal>

          {this.state.isLoading && (
            <div className="d-flex justify-content-center">
              <Spinner />
            </div>
          )}

          {!this.state.isLoading && (
            <>
              {/* <h3 className="pb-2">Please Fill this Form Carefully</h3> */}
              <DialogTitle id="form-dialog-title">
                <div>
                  <h5 className="stylishHeading">Complaint</h5>
                </div>
              </DialogTitle>
              <DialogContent>
                <form onSubmit={this.ToggleConfirmation}>
                  <div className="form-group">
                    <label htmlFor="details">Complaint Description</label>
                    <textarea
                      name="details"
                      id="details"
                      className="form-control"
                      value={this.state.details}
                      onChange={this.handleDetailsChange}
                      onBlur={this.handleDetailsBlur}
                      cols="70"
                      rows="4"
                    />
                  </div>
                  {this.state.detailsError && (
                    <div className="alert alert-danger">
                      {this.state.detailsError}
                    </div>
                  )}
                  <p
                    className="text-muted text-sm-left"
                    style={{ fontSize: "10px" }}
                  >
                    Write your Complaint's detail elaborative because your
                    Complaint's "severity" will be automatically set based on
                    your Complaint's detail.
                    <br />
                    In order to get category automatically selected, You have to
                    leave "details" input after writing
                  </p>

                  {/* category  */}

                  {this.state.sentimentCategory && (
                    <>
                      <label>Selected Category</label>
                      <button
                        className="btn button-primary"
                        onClick={this.handleCategoryButton}
                        type="button"
                      >
                        {this.state.sentimentCategory.name}
                        <i className="fa fa-edit pl-3"></i>
                      </button>
                      <p
                        className="text-muted text-sm-left mt-2"
                        style={{ fontSize: "10px" }}
                      >
                        You may change the category by clicking the category
                        name
                      </p>

                      <Categories
                        isLoading={true}
                        onCategorySeletion={this.handleOnCategorySeletion}
                        isOpen={this.state.showCategoriesDialog}
                        onClose={this.handleDialogClose}
                        categories={this.state.categories}
                      />

                      {/* <Category
                          onCategoryId={this.handleCategorySelect}
                          category={this.state.sentimentCategory}
                        /> */}
                    </>
                  )}
                  {/* category end  */}

                  {this.state.categoryError && (
                    <div className="alert alert-danger">
                      {this.state.categoryError}
                    </div>
                  )}
                  {/* {this.renderSelect(
                      "categoryId",
                      "Choose category",
                      this.state.categories
                    )} */}
                  {this.renderInput("title", "Title")}
                  {this.state.configToken &&
                    this.state.configToken.isSeverity &&
                    this.renderSelect("severity", "Severity", [
                      { _id: "1", name: "Low" },
                      { _id: "2", name: "Medium" },
                      { _id: "3", name: "High" }
                    ])}
                  {this.renderInput("location", "Enter Location")}

                  <div className="custom-file my-3">
                    <input
                      name="complaint"
                      id="complaint"
                      type="file"
                      className="custom-file-input"
                      onChange={this.handleFileChange}
                      ref={this.file}
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      Choose file
                    </label>
                  </div>
                  {this.state.selectedFile && (
                    <p>{this.state.selectedFile.name}</p>
                  )}

                  <div
                    style={{
                      position: "relative"
                    }}
                  >
                    <div
                      className="background overlayed "
                      style={{
                        border: "2px solid black",
                        borderLeft: "none",
                        borderRight: "none"
                      }}
                    ></div>
                    <div className="overlayed">
                      <button
                        className="centered-button rounded-circle btn btn-light shadow-sm "
                        type="button"
                        onClick={this.getLocation}
                      >
                        <MyLocation />
                      </button>
                      <div className="row mx-1" style={{ height: "100%" }}>
                        <div
                          className="col-6"
                          style={{ borderRight: "2px solid #999999" }}
                        >
                          Get your current location
                        </div>
                        <div className="col-6 d-flex flex-column p-0 m-0">
                          <div
                            className="mb-1 pr-2 pt-2 mr-0 d-flex flex-column justify-content-start
                             align-items-end"
                            style={{
                              borderBottom: "2px solid #999999",
                              height: "50%",
                              marginRight: "15px"
                            }}
                          >
                            {this.state.coords && (
                              <>
                                <p className="mb-0">
                                  <strong>Longitude</strong>
                                </p>
                                <p>{this.state.coords.longitude}</p>
                              </>
                            )}
                          </div>
                          <div
                            className="mb-1 pr-2 pt-2 mr-0 d-flex flex-column justify-content-start
                             align-items-end"
                          >
                            {this.state.coords && (
                              <>
                                <p className="mb-0">
                                  <strong>Latitude</strong>
                                </p>
                                <p>{this.state.coords.latitude}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <Map /> */}
                </form>
              </DialogContent>
              <DialogActions>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn button-secondary mr-3"
                    onClick={this.handleClose}
                  >
                    Close
                  </button>
                  <button
                    className="btn button-secondary mr-3"
                    onClick={this.ToggleConfirmation}
                  >
                    Register
                  </button>
                </div>
              </DialogActions>
            </>
          )}
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ComplaintForm;
