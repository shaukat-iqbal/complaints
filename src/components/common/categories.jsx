import React, { Component } from "react";
import CategoriesList from "./categoriesList";
import {
  getCategoriesWithNoParent,
  getSiblingsOf,
  getChildsOf
} from "../../services/categoryService";
import "./../admin/usersManagement/categories.css";

class Categories extends Component {
  state = {
    categories: [],
    isLoading: true,
    isOpen: false
  };

  async componentDidMount() {
    const { data: categories } = await getCategoriesWithNoParent();

    this.setState({
      categories,
      isLoading: false,
      isOpen: this.props.isOpen,
      parentCategoryName: "Root Categories"
    });
  }

  handleClick = async event => {
    const id = event.target.value;

    let { parentCategoryName } = this.state;
    let location = this.state.categories.find(l => l._id === id);
    if (location) parentCategoryName = location.name;

    const { data: categories } = await getChildsOf(id);
    if (categories.length > 0) {
      this.setState({ categories, parentCategoryName });
      return;
    }
    const { categories: allCategories } = this.state;
    let selected = allCategories.find(c => c._id === id);
    if (selected) {
      this.props.onCategorySeletion(selected);
    }
  };
  // to close the opened categories dialog
  handleClose = () => {
    this.setState({ isOpen: false });
  };

  handleBack = async () => {
    try {
      const { data: siblingCategories } = await getSiblingsOf(
        this.state.categories[0].parentCategory
      );
      console.log(siblingCategories, "Siblings");

      if (siblingCategories.length > 0) {
        this.setState({ categories: siblingCategories });
      }
    } catch (error) {}
  };

  render() {
    return (
      <CategoriesList
        categories={this.state.categories}
        parentCategoryName={this.state.parentCategoryName}
        isLoading={this.state.isLoading}
        onClick={this.handleClick}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        onBack={this.handleBack}
        onTick={this.props.onCategorySeletion}
        isCrud={this.props.isCrud}
      />
    );
  }
}

export default Categories;
