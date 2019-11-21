import React, { Component } from "react";
import Childs from "./child";
import Category from "./category";
import { Accordion } from "react-bootstrap";
import uuid from "uuid";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import PlainCategoryForm from "./PlainCategoryForm";
import { toast } from "react-toastify";
import { insertMultipleCategories } from "../services/categoryService";
import SearchBox from "../components/common/searchBox";
import { getCurrentUser } from "../services/authService";
class TemporaryCategoriesList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: ""
  };
  constructor(props) {
    super(props);
    this.state.allCategories = props.categories;
  }

  //intializing the thereExists with props coming from parent
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      thereExistsError: nextProps.thereExistsError,
      allCategories: nextProps.categories
    });
  }

  handleSearch = query => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  getPagedData = () => {
    const { searchQuery, allCategories } = this.state;

    let filtered = allCategories;
    if (searchQuery) {
      filtered = allCategories.filter(
        category =>
          !category.parentCategory &&
          category.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    } else {
      filtered = allCategories.filter(category => !category.parentCategory);
    }

    return { totalCount: filtered.length, data: filtered };
  };
  onDragStart = (ev, categoryId) => {
    console.log("Category being dragged", categoryId);
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
    console.log("Category that is going to be parent", parentCategoryId);
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
      if (categoryToUpdate.parentCategory)
        allCategories.map(category => {
          if (category._id == categoryToUpdate.parentCategory)
            category.hasChild = false;

          return category;
        });
    }

    //agar null har matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      let index = allCategories.findIndex(c => c._id == categoryId);
      if (index >= 0) allCategories[index].parentCategory = null;
      this.setState({ allCategories });
      return;
    }
    //agar null ni hai tou check karo khud ko khud pay drop kar raha h? do nothing
    if (categoryId == parentCategoryId) return;
    //check karo k kya dobara usi parent ka child ban raha hai? do nothing
    if (categoryToUpdate.parentCategory == parentCategoryId) return;

    const categoryTobeParent = allCategories.find(
      category => category._id == parentCategoryId
    );
    console.log("dragged category", categoryToUpdate);
    console.log("Category going to be parent ", categoryTobeParent);

    if (parentCategoryId) {
      categoryToUpdate.parentCategory = parentCategoryId;
      categoryTobeParent.hasChild = true;
    } else {
      delete categoryToUpdate.parentCategory;
    }

    console.log("Sending body", categoryToUpdate);

    let index = allCategories.findIndex(c => c._id == categoryId);
    if (index >= 0) allCategories[index] = categoryToUpdate;

    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);

    this.setState({ allCategories });
  };

  doesHaveSiblings = category => {
    console.log(category, " The category I am tring to check who has siblings");
    if (!category.parentCategory) return false;

    const { allCategories } = this.state;
    const siblings = allCategories.filter(
      c => c.parentCategory == category.parentCategory
    );
    console.log("length of siblings before", siblings.length);
    if (siblings.length > 1) return true;
    return false;
  };

  handleSubmitCategoryForm = category => {
    let { allCategories } = this.state;

    if (category) {
      if (category.parentCategory === "0") {
        delete category.parentCategory;
      }
      if (this.state.requestType === "edit") {
        let cIndex = allCategories.findIndex(c => c._id == category._id);
        allCategories[cIndex] = category;
      } else if (this.state.requestType === "addChild") {
        allCategories.push(category);
        let cIndex = allCategories.findIndex(
          c => c._id == category.parentCategory
        );
        console.log(cIndex);
        if (cIndex >= 0) allCategories[cIndex].hasChild = true;
      } else {
        allCategories.push(category);
      }
      this.setState({ allCategories, categoryFormEnabled: false });
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
                // await deleteCategory(category._id);
                let { allCategories } = this.state;
                let updated = allCategories.filter(c => c._id !== category._id);
                if (category.parentCategory) {
                  if (!this.doesHaveSiblings(category)) {
                    let parentIndex = allCategories.findIndex(
                      c => c._id == category.parentCategory
                    );
                    if (parentIndex >= 0)
                      allCategories[parentIndex].hasChild = false;
                  }
                }
                this.setState({ allCategories: updated });
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

  // checkErrors = () => {
  //   const { allCategories } = this.state;
  //   let thereExistsError = allCategories.filter(c => c.error);
  //   if (thereExistsError.length > 0)
  //     alert("There exists " + thereExistsError.length + " error(s)");
  //   else alert("There are no errors.Now Click SAVE button");
  //   this.setState({
  //     thereExistsError: thereExistsError.length > 0 ? true : false
  //   });
  // };

  checkErrors = () => {
    const { allCategories } = this.state;
    let errors = allCategories.filter(c => c.error);
    return errors.length > 0 ? true : false;
  };

  handleSave = async () => {
    if (this.checkErrors()) {
      alert("Kindly solve errors of yellow categories first then hit save. ");
      return;
    }
    try {
      await insertMultipleCategories({
        categories: this.state.allCategories,
        companyId: getCurrentUser().companyId
      });
      toast.success("Categories successfully created.");
      if (!this.props.isStepper) window.location = "/admin/users/categories";
      if (this.props.enableNext) this.props.enableNext();
    } catch (error) {
      toast.error("Something wrong occured. Please try again.");
    }
  };

  clearAll = () => {
    this.setState({ allCategories: [] });
    this.props.clearAll();
  };

  render() {
    const { allCategories } = this.state;
    // const rootCategories = allCategories.filter(c => !c.parentCategory);
    // const length = rootCategories.length;
    const { totalCount: length, data: rootCategories } = this.getPagedData();

    return (
      <div className="container card p-1">
        <div className="card-body">
          <div className="d-flex">
            {!this.props.isStepper && (
              <button
                className="btn button-outline-primary mb-3 mr-1"
                onClick={this.props.hideComponent}
              >
                <i className="fa fa-arrow-left"></i>
              </button>
            )}
            <button
              className="btn button-secondary rounded-pill mb-3 mr-auto "
              onClick={this.handleNewCategory}
            >
              Create Category...
            </button>

            {this.state.allCategories.length > 0 && (
              <div>
                <button
                  className="btn btn-danger btn-round mb-3 ml-1"
                  onClick={this.clearAll}
                >
                  <i className="fa fa-refresh"></i>Clear All
                </button>
                <button
                  className="btn btn-primary btn-round mb-3 ml-1"
                  onClick={this.handleSave}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          {length > 0 && (
            <SearchBox
              value={this.state.searchQuery}
              onChange={this.handleSearch}
            />
          )}
          {this.state.allCategories.length > 0 ? (
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
                        <Category
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
                        <Category
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
          ) : (
            <p>
              Select one of two methods i.e{" "}
              <u>
                <strong>CSV or Create Category</strong>
              </u>{" "}
              button to create categories.
            </p>
          )}
        </div>
        {this.state.categoryFormEnabled && (
          <PlainCategoryForm
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

export default TemporaryCategoriesList;
