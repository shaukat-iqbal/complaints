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
class CategoriesList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: "",
    csvUploadComponent: false
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
      this.setState({ allCategories: categories });
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
      allCategories.map(c => {
        if (c._id == categoryId) delete c.parentCategory;
        return c;
      });
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
      delete categoryToUpdate.parentCategory;
    }

    console.log("Sending body", categoryToUpdate);

    allCategories.map(c => {
      if (c._id == categoryToUpdate._id) c = categoryToUpdate;
      return c;
    });
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
      toast.error("Something wrong occured. Please try again.");
    }
  };

  handleCSVUpload = () => {
    this.setState({ csvUploadComponent: true });
  };
  render() {
    const { allCategories } = this.state;
    const rootCategories = allCategories.filter(c => !c.parentCategory);
    const length = rootCategories.length;

    return (
      <div>
        {!this.state.csvUploadComponent ? (
          <div className="container card p-1  ">
            <div className="card-header">
              <p className="h5">All categories</p>
            </div>
            <div className="card-body">
              <div className="d-flex mb-3">
                <div className="d-flex mr-auto">
                  <button
                    className="btn btn-secondary rounded-pill "
                    onClick={this.handleNewCategory}
                  >
                    Create Category...
                  </button>

                  <button
                    className="btn btn-primary rounded-pill ml-1"
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
              <Accordion defaultActiveKey="">
                <div
                  className="p-3 shadow-lg"
                  onDragOver={this.onDragOver}
                  onDrop={this.onDrop}
                  id={null}
                >
                  {length &&
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
        ) : (
          <CategoriesRenderer isStepper={false} />
        )}
      </div>
    );
  }
}

export default CategoriesList;
