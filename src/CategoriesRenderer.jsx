import React from "react";
import Papa from "papaparse";
import { insertMultipleCategories } from "./services/categoryService";
import TemporaryCategoriesList from "./categories/TemporaryCategoriesList";
import { toast } from "react-toastify";

class CategoriesRenderer extends React.Component {
  state = {
    data: [],
    csvFile: null,
    allCategories: []
  };

  childsOf = id => {
    return this.state.allCategories.filter(c => c.parentCategory === id);
  };

  findCategoryByName = (name, arr) => {
    return arr.find(c => c.name === name);
  };

  getRootCategories = () => {
    return this.state.allCategories.filter(c => !c.parentCategory);
  };

  saveData = result => {
    this.setState({ data: result.data });
    this.done();
    console.log(this.state.allCategories);
  };

  done = () => {
    const { allCategories, data } = this.state;
    data.shift();
    data.forEach(path => {
      const rootCategories = this.getRootCategories();
      let root = this.findCategoryByName(path[0], rootCategories);
      let childs = [];
      if (!root) {
        root = { _id: allCategories.length + 1, name: path[0] };
        if (path.length > 1) {
          root.hasChild = true;
        }
        allCategories.push(root);
      }
      childs = this.childsOf(root._id);
      let parentId = root._id;
      for (let i = 0; i < path.length; i++) {
        if (i == 0) continue;
        const name = path[i];
        let category = this.findCategoryByName(name, childs);
        if (!category) {
          let obj = {
            _id: allCategories.length + 1,
            name: name,
            parentCategory: parentId,
            hasChild: false
          };
          if (i < path.length - 1) {
            obj.hasChild = true;
            if (name == "Food") {
              console.log(path);
            }
          }
          allCategories.push(obj);
          parentId = obj._id;
          childs = [];
        } else {
          let cIndex = allCategories.findIndex(c => c._id === category._id);
          allCategories[cIndex].hasChild = true;
          parentId = category._id;
          childs = this.childsOf(category._id);
        }
      }
    });
    this.setState({ allCategories });
  };

  renderCategories = () => {
    if (!this.state.csvFile) {
      toast.warn("Kindly attach the CSV file first");
      return;
    }
    Papa.parse(this.state.csvFile, {
      complete: this.saveData
    });
  };

  handleSave = async () => {
    await insertMultipleCategories(this.state.allCategories);
  };

  handleFileInput = event => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      this.setState({ csvFile: file });
    }
  };

  render() {
    return (
      <div className="container">
        <div className="d-flex jumbotron bg-white flex-column shadow-lg ">
          <p className="display-5">
            Upload <strong>Csv File</strong> to create categories
          </p>
          <input
            type="file"
            name="categories"
            accept=".csv"
            onChange={this.handleFileInput}
            style={{ cursor: "pointer" }}
          />
          <button
            className="mt-5 btn btn-sm button-primary align-self-center"
            onClick={this.renderCategories}
            name="categories"
          >
            Render categories
          </button>
        </div>
        {
          <div>
            <TemporaryCategoriesList categories={this.state.allCategories} />
            {this.state.allCategories.length > 0 && (
              <button onClick={this.handleSave}>Save</button>
            )}
          </div>
        }
      </div>
    );
  }
}

export default CategoriesRenderer;
