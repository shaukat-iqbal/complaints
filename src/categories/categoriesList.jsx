import React, { Component } from "react";
import Childs from "./child";
import { getCategories, updateCategoryById } from "../services/categoryService";
class CategoriesList extends Component {
  state = {};
  async componentDidMount() {
    const { data: allCategories } = await getCategories();
    const root = allCategories.filter(category => !category.parentCategory)[0];
    // const { data: categories } = await getCategoriesWithNoParent();
    this.setState({ root, allCategories });
  }

  onDragStart = (ev, categoryId) => {
    console.log("Category being dragged", categoryId);
    ev.dataTransfer.setData("categoryId", categoryId);
  };

  onDragOver = ev => {
    // ev.target.style.border = "4px dotted green";
    ev.preventDefault();
    // ev.target.appendChild("div").style.border = "4px dotted green";
  };

  onDrop = async event => {
    event.preventDefault();
    event.stopPropagation();
    const categoryId = event.dataTransfer.getData("categoryId");
    const parentCategoryId = event.target.id;

    const { allCategories } = this.state;

    const categoryToUpdate = allCategories.find(
      category => category._id === categoryId
    );

    const categoryTobeParent = allCategories.find(
      category => category._id === parentCategoryId
    );
    console.log("dragged category", categoryToUpdate);
    console.log("Category going to be parent ", categoryTobeParent);

    //kya jo category drag hui hai us k parent k pas koi our child rehta h?
    const oldSiblings = this.getSiblingsOf(categoryToUpdate);
    //agar old parent ka child koi ni hai
    if (!oldSiblings) {
      //oldPArent should have hasChild false
      allCategories.map(category => {
        if (category._id === categoryToUpdate.parentCategory)
          category.hasChild = false;
        return category;
      });
    }

    //kya jo parent ban rahi hai us ka has child
    if (parentCategoryId) {
      categoryToUpdate.parentCategory = parentCategoryId;
    } else {
      delete categoryToUpdate.parentCategory;
    }
    delete categoryToUpdate._id;
    delete categoryToUpdate.__v;
    console.log("Sending body", categoryToUpdate);

    try {
      const { data: res } = await updateCategoryById(
        categoryId,
        categoryToUpdate
      );
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
    // allCategories.map(category => {
    //   if (category._id === categoryId) {
    //     category.parentCategory = parentCategoryId;
    //   }
    //   return category;
    // });
    console.log("Categories updated ", allCategories);
    console.log("Category dropped is", categoryId);
    // console.log("Category dropped on ", event.target.id);
    const root = allCategories.filter(category => !category.parentCategory)[0];
    // const { data: categories } = await getCategoriesWithNoParent();
    // event.target.style.border = null;
    this.setState({ root, allCategories });

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

  render() {
    let { root, allCategories } = this.state;

    return (
      <div className="p-1 bg-dark" id={root ? root._id : null}>
        {root && (
          <Childs
            category={root}
            onDragOver={this.onDragOver}
            onDrop={this.onDrop}
            onDragStart={this.onDragStart}
            allCategories={allCategories}
          />
        )
        // ) : (
        // ? root.map(category =>
        //     category.hasChild ? (
        //       <React.Fragment>
        //         <Category
        //           category={category}
        //           onDragStart={this.onDragStart}
        //         />
        //         <Childs
        //           category={category}
        //           onDragOver={this.onDragOver}
        //           onDrop={this.onDrop}
        //           onDragStart={this.onDragStart}
        //         />
        //       </React.Fragment>
        //     ) : (
        //       <div
        //         className="border border-dark"
        //         onDragOver={this.onDragOver}
        //         id={category._id}
        //         onDrop={this.onDrop}
        //       >
        //         <Category
        //           category={category}
        //           onDragStart={this.onDragStart}
        //         />
        //       </div>
        //     )
        //   )
        // "no category"
        // )
        }
      </div>
    );
  }
}

export default CategoriesList;
