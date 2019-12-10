import React, { Component } from "react";
import Childs from "./child";
import {
  getLocations,
  deleteLocation,
  updateMultipleLocations,
  deleteChildsOf
} from "../../services/locationService";
import Location from "./Location";
import LocationForm from "./LocationForm";
import LocationRenderer from "./LocationRenderer";
import { Accordion } from "react-bootstrap";
import uuid from "uuid";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { toast } from "react-toastify";
import Loading from "../common/loading";
import SearchBox from "../common/searchBox";
class LocationsList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: "",
    csvUploadComponent: false,
    searchQuery: "",
    checkedRootCategories: [],
    sidebarCategories: []
  };
  constructor(props) {
    super(props);
    if (props.categories) this.state.allCategories = props.categories;
  }

  async componentDidMount() {
    if (this.state.allCategories.length < 1) {
      const { data: allCategories } = await getLocations();
      // const { data: categories } = await getLocationsWithNoParent();
      let categories = allCategories.filter(c => c.name !== "Root");
      // let checkedRootCategories = categories.filter(c => !c.parentLocation);
      let sidebarCategories = allCategories.filter(c => !c.parentLocation);
      this.setState({ allCategories: categories, sidebarCategories });
    }
  }

  onDragStart = (ev, categoryId) => {
    console.log("Location being dragged", categoryId);
    ev.dataTransfer.setData("categoryId", categoryId);
  };

  onDragOver = ev => {
    ev.preventDefault();
  };

  onDrop = async event => {
    event.preventDefault();
    event.stopPropagation();
    const categoryId = event.dataTransfer.getData("categoryId");
    const parentCategoryId = event.target.id;
    console.log("Location that is going to be parent", parentCategoryId);
    console.log("Dropped categoy id", categoryId);
    const { allCategories } = this.state;
    console.log(allCategories);
    const categoryToUpdate = allCategories.find(
      category => category._id == categoryId
    );
    console.log(categoryToUpdate);
    //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    const oldSiblings = this.doesHaveSiblings(categoryToUpdate);

    //agar old parent ka child koi ni hai
    if (!oldSiblings) {
      //oldPArent should have hasChild false
      if (categoryToUpdate.parentLocation)
        allCategories.map(category => {
          if (category._id == categoryToUpdate.parentLocation)
            category.hasChild = false;

          return category;
        });
    }

    //agar null ha matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      let index = allCategories.findIndex(c => c._id == categoryId);
      if (index >= 0) allCategories[index].parentLocation = null;

      let orderChanged = this.state.orderChanged;
      if (!orderChanged) orderChanged = true;
      this.setState({ allCategories, orderChanged });
      return;
    }
    //agar null ni hai tou check karo khud ko khud pay drop kar raha h? do nothing
    if (categoryId == parentCategoryId) return;
    //check karo k kya dobara usi parent ka child ban raha hai? do nothing
    if (categoryToUpdate.parentLocation == parentCategoryId) return;

    const categoryTobeParent = allCategories.find(
      category => category._id == parentCategoryId
    );
    console.log("dragged category", categoryToUpdate);
    console.log("Location going to be parent ", categoryTobeParent);

    if (parentCategoryId) {
      categoryToUpdate.parentLocation = parentCategoryId;
      categoryTobeParent.hasChild = true;
    } else {
      categoryToUpdate.parentLocation = null;
    }

    console.log("Sending body", categoryToUpdate);
    let index = allCategories.findIndex(c => c._id == categoryId);
    if (index >= 0) allCategories[index] = categoryToUpdate;

    console.log("Categories updated ", allCategories);
    console.log("Location dropped is", categoryId);

    // Make sure some changes occured in hirarchi of categories
    let orderChanged = this.state.orderChanged;
    if (!orderChanged) orderChanged = true;
    this.setState({ allCategories, orderChanged });
  };

  doesHaveSiblings = category => {
    console.log(category, " The category I am tring to check who has siblings");
    if (!category.parentLocation) return false;

    const { allCategories } = this.state;
    const siblings = allCategories.filter(
      c => c.parentLocation == category.parentLocation
    );
    console.log("length of siblings before", siblings.length);
    if (siblings.length > 1) return true;
    return false;
  };

  handleSubmitCategoryForm = category => {
    if (category) {
      let { allCategories, sidebarCategories } = this.state;
      if (this.state.requestType === "addChild") {
        let parentCategoryIndex = allCategories.findIndex(
          c => c._id === category.parentLocation
        );
        if (parentCategoryIndex >= 0)
          allCategories[parentCategoryIndex].hasChild = true;
        console.log(parentCategoryIndex, allCategories[parentCategoryIndex]);
        allCategories.unshift(category);
      } else if (this.state.requestType === "edit") {
        let index = allCategories.findIndex(c => c._id === category._id);
        if (index >= 0) {
          allCategories[index] = category;
        }
        index = sidebarCategories.findIndex(c => c._id === category._id);
        if (index >= 0) {
          sidebarCategories[index] = category;
        }
      } else if (this.state.requestType === "new") {
        sidebarCategories.unshift(category);
        allCategories.unshift(category);
      }
      this.setState({
        allCategories,
        categoryFormEnabled: false,
        sidebarCategories
      });
    } else {
      this.setState({ categoryFormEnabled: false });
    }
    // window.location.reload();
  };
  handleCloseCategoryForm = () => {
    this.setState({ categoryFormEnabled: false });
  };
  handleNewCategory = () => {
    this.setState({ requestType: "new", categoryFormEnabled: true });
  };

  handleEditCategory = category => {
    this.setState({
      selectedCategory: category,
      categoryFormEnabled: true,
      requestType: "edit"
    });
  };

  handleAddChild = category => {
    this.setState({
      selectedCategory: category,
      categoryFormEnabled: true,
      requestType: "addChild"
    });
  };

  handleDeleteCategory = async category => {
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              if (!category.hasChild) {
                await deleteLocation(category._id);
                let { allCategories } = this.state;
                let updated = allCategories.filter(c => c._id !== category._id);
                if (category.parentLocation) {
                  if (!this.doesHaveSiblings(category)) {
                    let parentIndex = allCategories.findIndex(
                      c => c._id == category.parentLocation
                    );
                    if (parentIndex >= 0)
                      allCategories[parentIndex].hasChild = false;
                  }
                }
                let { sidebarCategories, checkedRootCategories } = this.state;
                sidebarCategories = sidebarCategories.filter(
                  c => c._id !== category._id
                );
                checkedRootCategories = checkedRootCategories.filter(
                  c => c._id !== category._id
                );
                this.setState({
                  allCategories: updated,
                  sidebarCategories,
                  checkedRootCategories
                });
              } else {
                toast.warn(
                  "We are sorry its not leaf node. Please adjust its decendents first then delete it."
                );
              }
            } catch (error) {
              console.log(error);
            }
          }
        },
        {
          label: "No"
        }
      ]
    });
  };

  handleSave = async () => {
    try {
      await updateMultipleLocations(this.state.allCategories);
      toast.success("Categories successfully updated.");
    } catch (error) {
      console.log(error);

      toast.error("Something wrong occured. Please try again.");
    }
  };
  handleCSVUpload = () => {
    this.setState({ csvUploadComponent: true });
  };

  handleHideCsvComponent = () => {
    this.setState({ csvUploadComponent: false });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  getPagedData = () => {
    const { searchQuery, allCategories, checkedRootCategories } = this.state;
    let categories = allCategories;
    if (checkedRootCategories.length > 0) categories = checkedRootCategories;
    let filtered = categories;
    if (searchQuery) {
      filtered = categories.filter(
        category =>
          !category.parentLocation &&
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = categories.filter(category => !category.parentLocation);
    }

    return { totalCount: filtered.length, data: filtered };
  };

  toggleChecked = e => {
    let { checkedRootCategories, allCategories } = this.state;
    if (e.target.checked) {
      let root = allCategories.find(c => c._id == e.target.name);
      if (root) checkedRootCategories.push(root);
    } else {
      let index = checkedRootCategories.findIndex(c => c._id == e.target.name);
      if (index >= 0) checkedRootCategories.splice(index, 1);
    }

    this.setState({ checkedRootCategories, [e.target.name]: e.target.checked });
  };

  handleDelete = () => {
    let { checkedRootCategories } = this.state;
    let { allCategories } = this.state;
    let updated = [];
    confirmAlert({
      title: "Confirm to submit",
      message:
        "Do you really want to delete All sub-categories of selected category(ies).",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            this.setState({ isLoading: true });

            for (let index = 0; index < checkedRootCategories.length; index++) {
              const category = checkedRootCategories[index];
              await this.deleteOperation(category);
              updated = allCategories.filter(
                c => c._id !== category._id || c.parentLocation === category._id
              );
              let sidebarCategories = updated.filter(c => !c.parentLocation);
              this.setState({
                allCategories: updated,
                sidebarCategories
              });
            }
            this.setState({ checkedRootCategories: [], isLoading: false });
          }
        },
        {
          label: "No"
        }
      ]
    });
  };

  deleteOperation = async selectedRootCategory => {
    console.log(selectedRootCategory);

    await deleteChildsOf(selectedRootCategory._id);
    await deleteLocation(selectedRootCategory._id);
  };
  render() {
    const { allCategories, sidebarCategories } = this.state;
    // const rootCategories = allCategories.filter(c => !c.parentLocation);
    // const length = rootCategories.length;
    // const { searchQuery } = this.state;

    const { totalCount: length, data: rootCategories } = this.getPagedData();
    return (
      <div>
        {this.state.isLoading && <Loading />}

        {/* <div className="p-3 border rounded-sm d-flex justify-content-center mb-1 gradiantHeading">
          <h3 style={{ color: "white" }}>Categories</h3>
        </div> */}
        {!this.state.csvUploadComponent ? (
          <div className="row">
            <div className=" col-md-2 ">
              {sidebarCategories.length > 0 && (
                <div
                  className="border border-light p-3 rounded-lg  ml-1"
                  style={{
                    backgroundColor: "#FDFDFD",
                    marginTop: "35px",
                    maxHeight: "400px",
                    overflow: "auto"
                  }}
                >
                  {sidebarCategories.map(category => {
                    return (
                      <div className="form-check p-1">
                        <input
                          className=" form-check-input"
                          type="checkbox"
                          checked={this.state[category._id]}
                          onClick={e => this.toggleChecked(e)}
                          name={category._id}
                          key={uuid()}
                        />
                        <label className="form-check-label" htmlFor="">
                          {category.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="col-md-10">
              <div className="container card p-1  ">
                <div className="card-body">
                  <div className="d-flex ">
                    <div className="d-flex mr-auto">
                      <button
                        className="btn btn-secondary rounded-pill mb-3 "
                        onClick={this.handleNewCategory}
                      >
                        Create Location...
                      </button>

                      <button
                        className="btn btn-primary rounded-pill ml-1 mb-3"
                        onClick={this.handleCSVUpload}
                      >
                        Upload Csv
                      </button>
                    </div>
                    {this.state.checkedRootCategories.length > 0 && (
                      <button
                        className="btn btn-primary btn-round mb-3"
                        onClick={this.handleDelete}
                      >
                        Delete
                      </button>
                    )}
                    {this.state.orderChanged && (
                      <button
                        className="btn btn-primary btn-round mb-3"
                        onClick={this.handleSave}
                      >
                        Save
                      </button>
                    )}
                  </div>

                  <SearchBox
                    value={this.state.searchQuery}
                    onChange={this.handleSearch}
                  />

                  <Accordion defaultActiveKey="">
                    <div
                      className="p-3 shadow-lg"
                      onDragOver={this.onDragOver}
                      onDrop={this.onDrop}
                      id={null}
                    >
                      {length > 0 &&
                        rootCategories.map(category =>
                          category.hasChild ? (
                            <div key={category._id + "parent"}>
                              <Location
                                key={uuid()}
                                category={category}
                                onEdit={this.handleEditCategory}
                                onAddChild={this.handleAddChild}
                                onDelete={this.handleDeleteCategory}
                                onDragStart={this.onDragStart}
                              />
                              <Childs
                                key={uuid()}
                                category={category}
                                onEdit={this.handleEditCategory}
                                onAddChild={this.handleAddChild}
                                onDelete={this.handleDeleteCategory}
                                allCategories={allCategories}
                                onDragOver={this.onDragOver}
                                onDrop={this.onDrop}
                                onDragStart={this.onDragStart}
                              />
                            </div>
                          ) : (
                            <div
                              onDragOver={this.onDragOver}
                              id={category._id}
                              onDrop={this.onDrop}
                              key={category._id + "single"}
                            >
                              <Location
                                key={uuid()}
                                category={category}
                                onEdit={this.handleEditCategory}
                                onAddChild={this.handleAddChild}
                                onDelete={this.handleDeleteCategory}
                                onDragOver={this.onDragOver}
                                onDragStart={this.onDragStart}
                              />
                            </div>
                          )
                        )}
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <LocationRenderer
            isStepper={false}
            hideComponent={this.handleHideCsvComponent}
          />
        )}
        {this.state.categoryFormEnabled && (
          <LocationForm
            requestType={this.state.requestType}
            category={this.state.selectedCategory}
            isOpen={this.state.categoryFormEnabled}
            onSubmitForm={this.handleSubmitCategoryForm}
            allCategories={allCategories}
            onClose={this.handleCloseCategoryForm}
          />
        )}
      </div>
    );
  }
}

export default LocationsList;
