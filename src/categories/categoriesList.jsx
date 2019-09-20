import React, { Component } from "react";
import Childs from "./child";
import { getCategories, updateCategoryById } from "../services/categoryService";
import Category from "./category";
class CategoriesList extends Component {
  state = {
    allCategories: []
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
    // ev.target.style.border = "4px dotted green";
    ev.preventDefault();
    // console.log("Category on Div having id", ev.target.id);
    // const div = Document.createElement("div");
    // div.height = "100px";
    // div.width = "100px";

    // ev.target.appendChild(div).style.border = "4px dotted green";
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

    // //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    // const oldSiblings = this.doesHaveSiblings(categoryToUpdate);
    // //agar old parent ka child koi ni hai
    // if (!oldSiblings) {
    //   //oldPArent should have hasChild false
    //   allCategories.map(category => {
    //     if (category._id === categoryToUpdate.parentCategory)
    //       category.hasChild = false;

    //     return category;
    //   });
    // }

    // if (category._id === categoryTobeParent._id) category.hasChild = true;
    //kya jo parent ban rahi hai us ka has child

    if (parentCategoryId) {
      categoryToUpdate.parentCategory = parentCategoryId;
      categoryTobeParent.hasChild = true;
    } else {
      delete categoryToUpdate.parentCategory;
    }

    console.log("Sending body", categoryToUpdate);

    // try {
    //   const { data: res } = await updateCategoryById(
    //     categoryId,
    //     categoryToUpdate
    //   );
    //   console.log("res", res);
    // } catch (error) {
    //   console.log(error);
    // }
    // allCategories.map(category => {
    //   if (category._id === categoryId) {
    //     category.parentCategory = parentCategoryId;
    //   }
    //   return category;
    // });
    allCategories.map(c => {
      if (c._id === categoryToUpdate._id) c = categoryToUpdate;
      return c;
    });
    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);
    // console.log("Category dropped on ", event.target.id);
    // const root = allCategories.filter(category => !category.parentCategory)[0];
    // const { data: categories } = await getCategoriesWithNoParent();
    // event.target.style.border = null;
    this.setState({ allCategories });

    // let tasks = this.state.tasks.filter(task => {
    //   if (task.name === id) {
    //     task.category = cat;
    //   }
    //   return task;
    // });

    // this.setState({
    //   ...this.state,
    //   tasks
    // });
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

  render() {
    const { allCategories } = this.state;
    const rootCategories = allCategories.filter(c => !c.parentCategory);
    const length = rootCategories.length;

    return (
      <div
        className="p-1 bg-dark"
        onDragOver={this.onDragOver}
        onDrop={this.onDrop}
        id={null}
      >
        {length &&
          rootCategories.map(category =>
            category.hasChild ? (
              <div key={category._id + "parent"}>
                <Category category={category} onDragStart={this.onDragStart} />
                <Childs
                  category={category}
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
                  onDragOver={this.onDragOver}
                  onDragStart={this.onDragStart}
                />
              </div>
            )
          )}
      </div>
    );
  }
}

export default CategoriesList;
