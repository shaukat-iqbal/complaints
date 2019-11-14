import React, { Component } from "react";
import Childs from "./child";
import {
  getCategories,
  deleteCategory,
  updateMultipleCategories
} from "../services/categoryService";
import Category from "./category";
import CategoryForm from "./categoryForm";
import CategoriesRenderer from "./CategoriesRenderer";
import { Accordion } from "react-bootstrap";
import uuid from "uuid";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { toast } from "react-toastify";
import SearchBox from "../components/common/searchBox";
class CategoriesList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: "",
    csvUploadComponent: false,
    searchQuery: ""
  };
  constructor(props) {
    super(props);
    if (props.categories) this.state.allCategories = props.categories;
  }

  async componentDidMount() {
    if (this.state.allCategories.length < 1) {
      const { data: allCategories } = await getCategories();
      // const { data: categories } = await getCategoriesWithNoParent();
      let categories = allCategories.filter(c => c.name !== "Root");
      let checkedRootCategories = categories.filter(c => !c.parentCategory);
      this.setState({ allCategories: categories, checkedRootCategories });
    }
  }

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

    //agar null ha matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      let index = allCategories.findIndex(c => c._id == categoryId);
      if (index >= 0) allCategories[index].parentCategory = null;

      let orderChanged = this.state.orderChanged;
      if (!orderChanged) orderChanged = true;
      this.setState({ allCategories, orderChanged });
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
      categoryToUpdate.parentCategory = null;
    }

    console.log("Sending body", categoryToUpdate);
    let index = allCategories.findIndex(c => c._id == categoryId);
    if (index >= 0) allCategories[index] = categoryToUpdate;

    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);

    // Make sure some changes occured in hirarchi of categories
    let orderChanged = this.state.orderChanged;
    if (!orderChanged) orderChanged = true;
    this.setState({ allCategories, orderChanged });
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
    if (category) {
      let { allCategories } = this.state;

      if (this.state.requestType === "addChild") {
        let parentCategoryIndex = allCategories.findIndex(
          c => c._id === category.parentCategory
        );
        if (parentCategoryIndex >= 0)
          allCategories[parentCategoryIndex].hasChild = true;
        console.log(parentCategoryIndex, allCategories[parentCategoryIndex]);
      }
      allCategories.unshift(category);
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
                await deleteCategory(category._id);
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

  handleSave = async () => {
    try {
      await updateMultipleCategories(this.state.allCategories);
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

    let filtered = allCategories;
    if (searchQuery) {
      filtered = allCategories.filter(
        category =>
          !category.parentCategory &&
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = allCategories.filter(category => !category.parentCategory);
    }

    return { totalCount: filtered.length, data: filtered };
  };

  toggleChecked = e => {
    alert(e.target.checked);
    let { checkedRootCategories, allCategories } = this.state;
    let index = checkedRootCategories.findIndex(c => c._id === e.target.name);
    if (index >= 0) checkedRootCategories.splice(index, 1);
    else {
      let root = allCategories.find(c => c._i === e.target.name);
      if (root) checkedRootCategories.push(root);
    }
    this.setState({ checkedRootCategories });
  };
  render() {
    const { allCategories } = this.state;
    // const rootCategories = allCategories.filter(c => !c.parentCategory);
    // const length = rootCategories.length;
    // const { searchQuery } = this.state;

    const { totalCount: length, data: rootCategories } = this.getPagedData();
    return (
      <div>
        <div className="p-3 border rounded-sm d-flex justify-content-center mb-1 gradiantHeading">
          <h3 style={{ color: "white" }}>Categories</h3>
        </div>
        {/* {allCategories.length > 0 && (
          <div className="border border-primary p-3 ">
            {allCategories.map(category => {
              if (category.parentCategory) return null;
              return (
                <div className="form-check">
                  <input
                    className=" form-check-input"
                    type="checkbox"
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
        )} */}

        {!this.state.csvUploadComponent ? (
          <>
            <div className="container card p-1  ">
              <div className="card-body">
                <div className="d-flex ">
                  <div className="d-flex mr-auto">
                    <button
                      className="btn btn-secondary rounded-pill mb-3 "
                      onClick={this.handleNewCategory}
                    >
                      Create Category...
                    </button>

                    <button
                      className="btn btn-primary rounded-pill ml-1 mb-3"
                      onClick={this.handleCSVUpload}
                    >
                      Upload Csv
                    </button>
                  </div>

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
              </div>
              {this.state.categoryFormEnabled && (
                <CategoryForm
                  requestType={this.state.requestType}
                  category={this.state.selectedCategory}
                  isOpen={this.state.categoryFormEnabled}
                  onSubmitForm={this.handleSubmitCategoryForm}
                  allCategories={allCategories}
                  onClose={this.handleCloseCategoryForm}
                />
              )}
            </div>
          </>
        ) : (
          <CategoriesRenderer
            isStepper={false}
            hideComponent={this.handleHideCsvComponent}
          />
        )}
      </div>
    );
  }
}

export default CategoriesList;
