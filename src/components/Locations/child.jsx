import React, { Component } from "react";
// import { getChildsOf } from "../services/categoryService";
import uuid from "uuid";
import Location from "./Location";
class Childs extends Component {
  state = { childs: [] };
  async componentDidMount() {
    const { category, allLocations } = this.props;
    //getChildsOfCategory
    if (category && category._id) {
      let childs = this.getChildsOf(category, allLocations);
      // const { data: childs } = await getChildsOf(category._id);
      this.setState({ childs, allLocations });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { category, allLocations } = this.props;
    //getChildsOfCategory
    if (category && category._id) {
      let childs = this.getChildsOf(category, allLocations);
      // const { data: childs } = await getChildsOf(category._id);
      if (
        prevState.childs.length !== childs.length ||
        prevState.allLocations !== this.props.allLocations
      )
        this.setState({ childs, allLocations });
    }
  }

  getChildsOf = (category, allLocations) => {
    const childs = allLocations.filter(c => category._id == c.parentLocation);
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
                <Location
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
                  allLocations={this.props.allLocations}
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
                <Location
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
