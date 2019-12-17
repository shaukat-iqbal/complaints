import React, { Component } from "react";
import Childs from "./child";
import {
  getLocations,
  deleteLocation,
  updateMultipleLocations,
  deleteChildsOf,
  deleteMany
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
import RootSideBar from "../common/RootSideBar";
class LocationsList extends Component {
  state = {
    allLocations: [],
    categoryFormEnabled: false,
    selectedCategory: "",
    csvUploadComponent: false,
    searchQuery: "",
    checkedRootLocations: [],
    sidebarLocations: [],
    checkedItems: {}
  };
  constructor(props) {
    super(props);
    if (props.locations && props.locations.length > 0)
      this.state.allLocations = props.locations;
  }

  async componentDidMount() {
    if (this.state.allLocations.length < 1) {
      const { data: allLocations } = await getLocations();
      // const { data: locations } = await getLocationsWithNoParent();
      let locations = allLocations.filter(c => c.name !== "Root");
      // let checkedRootLocations = locations.filter(c => !c.parentLocation);
      let sidebarLocations = allLocations.filter(c => !c.parentLocation);
      this.setState({ allLocations: locations, sidebarLocations });
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
    const { allLocations } = this.state;
    console.log(allLocations);
    const categoryToUpdate = allLocations.find(
      category => category._id == categoryId
    );
    console.log(categoryToUpdate);
    //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    const oldSiblings = this.doesHaveSiblings(categoryToUpdate);

    //agar old parent ka child koi ni hai
    if (!oldSiblings) {
      //oldPArent should have hasChild false
      if (categoryToUpdate.parentLocation)
        allLocations.map(category => {
          if (category._id == categoryToUpdate.parentLocation)
            category.hasChild = false;

          return category;
        });
    }

    //agar null ha matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      let index = allLocations.findIndex(c => c._id == categoryId);
      if (index >= 0) allLocations[index].parentLocation = null;

      let orderChanged = this.state.orderChanged;
      if (!orderChanged) orderChanged = true;
      this.setState({ allLocations, orderChanged });
      return;
    }
    //agar null ni hai tou check karo khud ko khud pay drop kar raha h? do nothing
    if (categoryId == parentCategoryId) return;
    //check karo k kya dobara usi parent ka child ban raha hai? do nothing
    if (categoryToUpdate.parentLocation == parentCategoryId) return;

    const categoryTobeParent = allLocations.find(
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
    let index = allLocations.findIndex(c => c._id == categoryId);
    if (index >= 0) allLocations[index] = categoryToUpdate;

    console.log("Categories updated ", allLocations);
    console.log("Location dropped is", categoryId);

    // Make sure some changes occured in hirarchi of locations
    let orderChanged = this.state.orderChanged;
    if (!orderChanged) orderChanged = true;
    this.setState({ allLocations, orderChanged });
  };

  doesHaveSiblings = category => {
    console.log(category, " The category I am tring to check who has siblings");
    if (!category.parentLocation) return false;

    const { allLocations } = this.state;
    const siblings = allLocations.filter(
      c => c.parentLocation == category.parentLocation
    );
    console.log("length of siblings before", siblings.length);
    if (siblings.length > 1) return true;
    return false;
  };

  handleSubmitCategoryForm = category => {
    if (category) {
      let { allLocations, sidebarLocations } = this.state;
      if (this.state.requestType === "addChild") {
        let parentCategoryIndex = allLocations.findIndex(
          c => c._id === category.parentLocation
        );
        if (parentCategoryIndex >= 0)
          allLocations[parentCategoryIndex].hasChild = true;
        console.log(parentCategoryIndex, allLocations[parentCategoryIndex]);
        allLocations.unshift(category);
      } else if (this.state.requestType === "edit") {
        let index = allLocations.findIndex(c => c._id === category._id);
        if (index >= 0) {
          allLocations[index] = category;
        }
        index = sidebarLocations.findIndex(c => c._id === category._id);
        if (index >= 0) {
          sidebarLocations[index] = category;
        }
      } else if (this.state.requestType === "new") {
        sidebarLocations.unshift(category);
        allLocations.unshift(category);
      }
      this.setState({
        allLocations,
        categoryFormEnabled: false,
        sidebarLocations
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
                let { allLocations } = this.state;
                let updated = allLocations.filter(c => c._id !== category._id);
                if (category.parentLocation) {
                  if (!this.doesHaveSiblings(category)) {
                    let parentIndex = allLocations.findIndex(
                      c => c._id == category.parentLocation
                    );
                    if (parentIndex >= 0)
                      allLocations[parentIndex].hasChild = false;
                  }
                }
                let { sidebarLocations, checkedRootLocations } = this.state;
                sidebarLocations = sidebarLocations.filter(
                  c => c._id !== category._id
                );
                checkedRootLocations = checkedRootLocations.filter(
                  c => c._id !== category._id
                );
                this.setState({
                  allLocations: updated,
                  sidebarLocations,
                  checkedRootLocations
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
      await updateMultipleLocations(this.state.allLocations);
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
    const { searchQuery, allLocations, checkedRootLocations } = this.state;
    let locations = allLocations;
    if (checkedRootLocations.length > 0) locations = checkedRootLocations;
    let filtered = locations;
    if (searchQuery) {
      filtered = locations.filter(
        category =>
          !category.parentLocation &&
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = locations.filter(category => !category.parentLocation);
    }

    return { totalCount: filtered.length, data: filtered };
  };

  toggleChecked = e => {
    let { checkedRootLocations, allLocations, checkedItems } = this.state;
    console.log(e.target.checked);
    if (e.target.checked) {
      let root = allLocations.find(c => c._id == e.target.name);
      if (root) checkedRootLocations.push(root);
    } else {
      let index = checkedRootLocations.findIndex(c => c._id == e.target.name);
      if (index >= 0) checkedRootLocations.splice(index, 1);
    }
    checkedItems[e.target.name] = e.target.checked;
    this.setState({ checkedRootLocations, checkedItems });
  };

  handleDelete = () => {
    let { allLocations } = this.state;
    confirmAlert({
      title: "Confirm to submit",
      message:
        "Do you really want to delete All sub-locations of selected category(ies).",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            this.setState({ isLoading: true });
            let toBeDeleted = this.getToBeDeleted();

            let updated = [...allLocations];
            toBeDeleted.forEach(id => {
              updated = updated.filter(location => location._id !== id);
            });

            let sidebarLocations = updated.filter(
              location => !location.parentLocation
            );
            this.setState({
              allLocations: updated,
              sidebarLocations,
              checkedRootLocations: [],
              isLoading: false
            });

            try {
              await deleteMany({ locations: toBeDeleted });
            } catch (error) {}
          }
        },
        {
          label: "No"
        }
      ]
    });
  };

  getToBeDeleted = () => {
    let { checkedRootLocations, allLocations } = this.state;
    let toBeDeleted = [];
    for (let index = 0; index < checkedRootLocations.length; index++) {
      const rootLocation = checkedRootLocations[index];
      toBeDeleted.push(rootLocation._id);
      allLocations.forEach(location => {
        if (location.parentLocation === rootLocation._id) {
          toBeDeleted.push(location._id);
        }
      });
    }
    return toBeDeleted;
  };

  deleteOperation = async selectedRootCategory => {
    console.log(selectedRootCategory);

    await deleteChildsOf(selectedRootCategory._id);
    await deleteLocation(selectedRootCategory._id);
  };
  render() {
    const {
      allLocations,
      sidebarLocations,
      checkedItems,
      isLoading
    } = this.state;
    // const rootCategories = allLocations.filter(c => !c.parentLocation);
    // const length = rootCategories.length;
    // const { searchQuery } = this.state;

    const { totalCount: length, data: rootCategories } = this.getPagedData();
    return (
      <div>
        {isLoading && <Loading />}

        {/* <div className="p-3 border rounded-sm d-flex justify-content-center mb-1 gradiantHeading">
          <h3 style={{ color: "white" }}>Categories</h3>
        </div> */}
        {!this.state.csvUploadComponent ? (
          <div className="row">
            <div className=" col-md-2 ">
              <RootSideBar
                items={sidebarLocations}
                onCheck={this.toggleChecked}
                checkedItems={checkedItems}
              />
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
                    {this.state.checkedRootLocations.length > 0 && (
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
                                allLocations={allLocations}
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
            location={this.state.selectedCategory}
            isOpen={this.state.categoryFormEnabled}
            onSubmitForm={this.handleSubmitCategoryForm}
            onClose={this.handleCloseCategoryForm}
          />
        )}
      </div>
    );
  }
}

export default LocationsList;
