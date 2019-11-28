import React from "react";
import Papa from "papaparse";
import TemporaryCategoriesList from "./TemporaryCategoriesList";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import { getSample } from "../services/csvService";
import FileSaver from "file-saver";

class CategoriesRenderer extends React.Component {
  state = {
    data: [],
    csvFile: null,
    allCategories: []
  };
  schema = {
    name: Joi.string()
      .min(4)
      .required(),
    parentCategory: Joi.string(),
    hasChild: Joi.boolean()
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

  validate = category => {
    const { error } = Joi.validate(category, this.schema, {
      abortEarly: false
    });

    if (!error) return null;

    const errors = {};

    for (let item of error.details) errors[item.path[0]] = item.message;

    return errors;
  };

  done = result => {
    let { allCategories, thereExistsError } = this.state;
    let { data } = result;

    data.shift();
    data.forEach(path => {
      const rootCategories = this.getRootCategories();
      //As first name on will be consider root category so check if already exists in root categories?
      let root = this.findCategoryByName(path[0], rootCategories);
      let childs = [];
      if (!root) {
        root = { name: path[0] };
        if (path.length > 1) {
          root.hasChild = true;
        }
        const error = this.validate(root);
        if (error) {
          root.error = error;
          thereExistsError = true;
        }
        root._id = allCategories.length + 1 + "";
        allCategories.push(root);
      }
      childs = this.childsOf(root._id);
      let parentId = root._id;
      for (let i = 0; i < path.length; i++) {
        if (i === 0) continue;
        const name = path[i];
        let category = this.findCategoryByName(name, childs);
        if (!category) {
          let obj = {
            name: name,
            parentCategory: parentId,
            hasChild: false
          };
          if (i < path.length - 1) {
            obj.hasChild = true;
          }

          const error = this.validate(obj);
          if (error) {
            obj.error = error;
            thereExistsError = true;
          }
          obj._id = allCategories.length + 1 + "";
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
    this.setState({ allCategories, thereExistsError });
  };

  renderCategories = () => {
    if (!this.state.csvFile) {
      toast.warn("Kindly attach the CSV file first");
      return;
    }
    Papa.parse(this.state.csvFile, {
      complete: this.done
    });
  };

  handleFileInput = event => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      this.setState({ csvFile: file });
    }
  };

  hanndleClearAll = () => {
    this.setState({ allCategories: [] });
  };

  handleDownload = async fileName => {
    console.log(fileName);
    const response = await getSample(fileName + "");
    const file = new Blob([response.data], { type: "application/csv" });
    FileSaver.saveAs(file, "sample.csv");
  };
  render() {
    return (
      <div className="container">
        <div className="row ">
          <div className="col-md-9 col-sm-12">
            <TemporaryCategoriesList
              {...this.props}
              clearAll={this.hanndleClearAll}
              categories={this.state.allCategories}
              thereExistsError={this.state.thereExistsError}
              {...this.props}
            />
          </div>

          <div
            className="col-md-3 col-sm-12 d-flex jumbotron bg-white flex-column shadow-sm"
            style={{ width: "300px", height: "300px" }}
          >
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-sm btn-info"
                data-toggle="tooltip"
                data-placement="top"
                title="Download Sample"
                type="button"
                onClick={() => this.handleDownload("categories")}
                style={{ width: "50px" }}
              >
                <i className="fa fa-question"></i>
              </button>
            </div>
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
        </div>
      </div>
    );
  }
}

export default CategoriesRenderer;
