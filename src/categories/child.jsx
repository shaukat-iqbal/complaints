import React, { Component } from "react";
// import { getChildsOf } from "../services/categoryService";
import uuid from "uuid";
import Category from "./category";
class Childs extends Component {
  state = { childs: [] };
  async componentDidMount() {
    const { category, allCategories } = this.props;
    //getChildsOfCategory
    if (category && category._id) {
      let childs = this.getChildsOf(category, allCategories);
      // const { data: childs } = await getChildsOf(category._id);
      this.setState({ childs, allCategories });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { category, allCategories } = this.props;
    //getChildsOfCategory
    if (category && category._id) {
      let childs = this.getChildsOf(category, allCategories);
      // const { data: childs } = await getChildsOf(category._id);
      if (
        prevState.childs.length !== childs.length ||
        prevState.allCategories !== this.props.allCategories
      )
        this.setState({ childs, allCategories });
    }
  }

  getChildsOf = (category, allCategories) => {
    const childs = allCategories.filter(c => category._id == c.parentCategory);
    return childs;
  };

  render() {
    const { onDragOver, onDrop, category, onDragStart } = this.props;
    // alert("Child of" + category.name);
    const { childs } = this.state;
    return (
      <div
        id={category._id}
        className="ml-5"
        onDragOver={onDragOver}
        onDrop={onDrop}
        key={uuid()}
      >
        {childs.length &&
          childs.map(childCategory =>
            childCategory.hasChild ? (
              <React.Fragment>
                <Category
                  key={uuid()}
                  category={childCategory}
                  onEdit={this.props.onEdit}
                  onAddChild={this.props.onAddChild}
                  onDelete={this.props.onDelete}
                  onDragOver={onDragOver}
                  onDragStart={onDragStart}
                />
                <Childs
                  key={uuid()}
                  allCategories={this.props.allCategories}
                  category={childCategory}
                  onEdit={this.props.onEdit}
                  onAddChild={this.props.onAddChild}
                  onDelete={this.props.onDelete}
                  onDragOver={onDragOver}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                />
              </React.Fragment>
            ) : (
              <div
                onDragOver={this.onDragOver}
                id={childCategory._id}
                onDrop={this.onDrop}
                key={uuid()}
              >
                <Category
                  key={uuid()}
                  category={childCategory}
                  onEdit={this.props.onEdit}
                  onAddChild={this.props.onAddChild}
                  onDelete={this.props.onDelete}
                  onDragOver={onDragOver}
                  onDragStart={onDragStart}
                />
              </div>
            )
          )}
      </div>
    );
  }
}

export default Childs;
