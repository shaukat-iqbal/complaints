import React, { Component } from "react";
// import { getChildsOf } from "../services/categoryService";
import Category from "./category";
class Childs extends Component {
  state = { childs: [] };
  async componentDidMount() {
    const { category, allCategories } = this.props;
    //getChildsOfCategory
    if (category && category._id) {
      let childs = this.getChildsOf(category, allCategories);
      // const { data: childs } = await getChildsOf(category._id);
      this.setState({ childs });
    }
  }
  getChildsOf = (category, allCategories) => {
    const childs = allCategories.filter(c => category._id === c.parentCategory);
    return childs;
  };

  render() {
    const { onDragOver, onDrop, category, onDragStart } = this.props;
    return (
      <div
        id={category._id}
        className="pl-5"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {this.state.childs.length > 0
          ? this.state.childs.map(childCategory =>
              childCategory.hasChild ? (
                <React.Fragment>
                  <Category
                    category={childCategory}
                    onDragStart={onDragStart}
                  />
                  <Childs
                    category={childCategory}
                    onDragOver={onDragOver}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                  />
                </React.Fragment>
              ) : (
                <div
                  className="m-1 p-1 bg-info border border-dark"
                  onDragOver={this.onDragOver}
                  id={childCategory._id}
                  onDrop={this.onDrop}
                >
                  <Category
                    category={childCategory}
                    onDragStart={onDragStart}
                  />
                </div>
              )
            )
          : null}
      </div>
    );
  }
}

export default Childs;
