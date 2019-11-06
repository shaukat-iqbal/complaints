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
      isOpen: this.props.isOpen
    });
  }

  handleClick = async event => {
    const id = event.target.value;
    const { data: categories } = await getChildsOf(id);
    if (categories.length > 0) {
      this.setState({ categories });
      return;
    }
    this.props.onCategorySeletion(id);
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
      if (siblingCategories.length > 0)
        this.setState({ categories: siblingCategories });
    } catch (error) {}
  };

  render() {
    return (
      <CategoriesList
        categories={this.state.categories}
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
