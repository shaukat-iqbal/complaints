import React, { Component } from "react";
import Childs from "./child";
import { getCategories, deleteCategory } from "../services/categoryService";
import Category from "./category";
import CategoryForm from "./categoryForm";

import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
class CategoriesList extends Component {
  state = {
    allCategories: [],
    categoryFormEnabled: false,
    selectedCategory: ""
  };

  async componentDidMount() {
    const { data: allCategories } = await getCategories();
    // const { data: categories } = await getCategoriesWithNoParent();
    this.setState({ allCategories });
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
    const { allCategories } = this.state;

    const categoryToUpdate = allCategories.find(
      category => category._id === categoryId
    );
    //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    const oldSiblings = this.doesHaveSiblings(categoryToUpdate);

    //agar old parent ka child koi ni hai
    if (!oldSiblings) {
      //oldPArent should have hasChild false
      if (categoryToUpdate.parentCategory)
        allCategories.map(category => {
          if (category._id === categoryToUpdate.parentCategory)
            category.hasChild = false;

          return category;
        });
    }

    //agar null har matlab category ko root category bna do by deleting parent category id
    if (!parentCategoryId) {
      allCategories.map(c => {
        if (c._id === categoryId) delete c.parentCategory;
        return c;
      });
      this.setState({ allCategories });
      return;
    }
    //agar null ni hai tou check karo khud ko khud pay drop kar raha h? do nothing
    if (categoryId === parentCategoryId) return;
    //check karo k kya dobara usi parent ka child ban raha hai? do nothing
    if (categoryToUpdate.parentCategory === parentCategoryId) return;

    const categoryTobeParent = allCategories.find(
      category => category._id === parentCategoryId
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
      if (c._id === categoryToUpdate._id) c = categoryToUpdate;
      return c;
    });
    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);

    this.setState({ allCategories });
  };

  doesHaveSiblings = category => {
    if (!category.parentCategory) return false;

    const { allCategories } = this.state;
    const siblings = allCategories.filter(
      c => c.parentCategory === category.parentCategory
    );
    console.log("length of siblings before", siblings.length);
    if (siblings.length > 1) return true;
    return false;
  };

  handleCLoseCategoryForm = () => {
    this.setState({ categoryFormEnabled: false });
    window.location.reload();
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
                window.location.reload();
              } else {
                alert("We are sorry its no leaf node");
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
  render() {
    const { allCategories } = this.state;
    const rootCategories = allCategories.filter(c => !c.parentCategory);
    const length = rootCategories.length;

    return (
      <div className="container p-5 ">
        <button
          className="btn btn-primary rounded-pill "
          onClick={this.handleNewCategory}
        >
          Create Category
        </button>
        <div
          className="p-3 bg-dark shadow-lg"
          onDragOver={this.onDragOver}
          onDrop={this.onDrop}
          id={null}
        >
          {length &&
            rootCategories.map(category =>
              category.hasChild ? (
                <div key={category._id + "parent"}>
                  <Category
                    category={category}
                    onEdit={this.handleEditCategory}
                    onAddChild={this.handleAddChild}
                    onDelete={this.handleDeleteCategory}
                    onDragStart={this.onDragStart}
                  />
                  <Childs
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
                  className="border border-dark"
                  onDragOver={this.onDragOver}
                  id={category._id}
                  onDrop={this.onDrop}
                  key={category._id + "single"}
                >
                  <Category
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
        {this.state.categoryFormEnabled && (
          <CategoryForm
            requestType={this.state.requestType}
            category={this.state.selectedCategory}
            isOpen={this.state.categoryFormEnabled}
            onClose={this.handleCLoseCategoryForm}
            allCategories={allCategories}
          />
        )}
      </div>
    );
  }
}

export default CategoriesList;
