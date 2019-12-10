import React, { Component } from "react";

import {
  getCategoriesWithParent,
  getParentCategory,
  getCategoriesWithNoParent
} from "../../services/locationService";

class Location extends Component {
  state = {
    selectedCategories: "",
    selectedCategory: "",
    categoryWithParent1: "",
    categoryWithParent2: "",
    categoryWithParent3: "",
    sentimentCategory: "",
    categoryId: "",
    isLoading: true
  };

  noParent = React.createRef();
  withParent1 = React.createRef();
  withParent2 = React.createRef();
  withParent3 = React.createRef();

  async componentDidMount() {
    const { data } = await getCategoriesWithNoParent();
    this.setState({ selectedCategories: data });
    this.setState(prevState => {
      return {
        sentimentCategory: this.props.category ? this.props.category : ""
      };
    });

    const { sentimentCategory } = this.state;
    if (sentimentCategory === "") {
      return;
    }

    if (!sentimentCategory.parentLocation) {
      setTimeout(() => {
        this.setState({ isLoading: false });
        this.noParent.current.value = sentimentCategory._id;
      }, 3000);

      this.getCategory(sentimentCategory._id);
    } else {
      const parentLocation = sentimentCategory.parentLocation;

      const { data: data1 } = await getParentCategory(parentLocation); //haras2

      if (!data1.parentLocation) {
        this.getCategory(data1._id);

        setTimeout(() => {
          this.setState({ isLoading: false });
          this.noParent.current.value = data1._id;
          this.withParent1.current.value = sentimentCategory._id;
        }, 3000);

        this.getCategory1(sentimentCategory._id);

        console.log(sentimentCategory._id);
      } else {
        const { data: data2 } = await getParentCategory(data1.parentLocation); // plumbing
        if (!data2.parentLocation) {
          setTimeout(() => {
            this.setState({ isLoading: false });
            this.noParent.current.value = data2._id;
          }, 3000);

          await this.getCategory(data2._id);
          setTimeout(async () => {
            this.withParent1.current.value = data1._id;

            await this.getCategory1(data1._id);

            this.withParent2.current.value = sentimentCategory._id;

            await this.getCategory2(sentimentCategory._id);
          }, 3000);
        } else {
          const { data: data3 } = await getParentCategory(data2.parentLocation); // electrical
          if (!data3.parentLocation) {
            setTimeout(async () => {
              this.setState({ isLoading: false });
              this.noParent.current.value = data3._id;
              await this.getCategory(data3._id);
              this.withParent1.current.value = data2._id;
              await this.getCategory1(data2._id);
              this.withParent2.current.value = data1._id;
              await this.getCategory2(data1._id);
              this.withParent3.current.value = sentimentCategory._id;
            }, 3000);
          }
        }
      }
      // else end
    }

    console.log(this.props.category);
  }

  handleChange = ({ currentTarget: input }) => {
    if (input.value === "") {
      return this.setState({
        categoryWithParent1: "",
        categoryWithParent2: "",
        categoryWithParent3: ""
      });
    }
    this.setState({ selectedCategory: input.value });
    this.getCategory(input.value);
    console.log("categoryId");
  };

  getCategory = async categoryid => {
    const { data } = await getCategoriesWithParent(categoryid);

    if (data.length === 0) {
      this.setState({ categoryId: this.state.selectedCategory });
      this.props.onCategoryId(this.state.categoryId);
      return this.setState({
        categoryWithParent1: "",
        categoryWithParent2: "",
        categoryWithParent3: ""
      });
    }
    this.setState(prev => {
      return { categoryWithParent1: data };
    });
    return true;
  };

  handleChange1 = ({ currentTarget: input }) => {
    if (input.value === "") {
      return this.setState({
        categoryWithParent2: "",
        categoryWithParent3: ""
      });
    }
    this.setState({ selectedCategory: input.value });
    this.setState({ categoryId: input.value });
    setTimeout(() => {}, 1000);
    this.props.onCategoryId(this.state.categoryId || input.value);

    this.getCategory1(input.value);
  };

  getCategory1 = async categoryid => {
    const { data } = await getCategoriesWithParent(categoryid);

    if (data.length === 0) {
      //   this.setState({ categoryId: this.state.selectedCategory });

      this.props.onCategoryId(this.state.categoryId);

      return this.setState({
        categoryWithParent2: "",
        categoryWithParent3: ""
      });
    }
    this.setState({ categoryWithParent2: data });
  };

  handleChange2 = ({ currentTarget: input }) => {
    if (input.value === "") {
      return this.setState({
        categoryWithParent3: ""
      });
    }
    this.setState({ selectedCategory: input.value });
    this.setState({ categoryId: input.value });
    setTimeout(() => {}, 1000);
    this.props.onCategoryId(this.state.categoryId || input.value);

    this.getCategory2(input.value);
  };

  getCategory2 = async categoryid => {
    const { data } = await getCategoriesWithParent(categoryid);

    if (data.length === 0) {
      //   this.setState({ categoryId: this.state.categoryWithParent2 });
      this.props.onCategoryId(this.state.categoryId);
      return this.setState({
        categoryWithParent3: ""
      });
    }
    this.setState({ categoryWithParent3: data });
  };

  handleChange3 = ({ currentTarget: input }) => {
    this.setState({ categoryId: input.value });
    setTimeout(() => {}, 1000);
    this.props.onCategoryId(this.state.categoryId || input.value);
    if (input.value === "") {
      return alert("Please choose");
    }
  };

  getCategory3 = async categoryid => {
    const { data } = await getCategoriesWithParent(categoryid);

    if (data.length === 0) {
      return this.setState({ categoryId: this.state.categoryWithParent3 });
    }

    this.setState({ categoryId: data });
  };

  render() {
    const {
      selectedCategories,
      categoryWithParent1,
      categoryWithParent2,
      categoryWithParent3,
      isLoading
    } = this.state;
    return (
      <div className="mb-2">
        {isLoading === false ? (
          <>
            <div className="form-group d-inline">
              {/* no parent  */}
              {selectedCategories.length > 0 && (
                <>
                  <select
                    className="form-control-sm"
                    name="editOptions"
                    id="editOption"
                    onChange={this.handleChange}
                    ref={this.noParent}
                  >
                    <option value="" />
                    {selectedCategories.map(sc => (
                      <option key={sc._id} value={sc._id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                  <span className="ml-3">
                    {categoryWithParent1.length > 0 && (
                      <select
                        className="form-control-sm"
                        name="editOptions"
                        id="editOption"
                        onChange={this.handleChange1}
                        ref={this.withParent1}
                      >
                        <option value="" />

                        {categoryWithParent1.map(sc => (
                          <>
                            <option value={sc._id}>{sc.name}</option>
                          </>
                        ))}
                      </select>
                    )}
                  </span>
                  <span className="ml-3">
                    {categoryWithParent2.length > 0 && (
                      <select
                        className="form-control-sm"
                        name="editOptions"
                        id="editOption"
                        onChange={this.handleChange2}
                        ref={this.withParent2}
                      >
                        <option value="" />

                        {categoryWithParent2.map(sc => (
                          <>
                            <option value={sc._id}>{sc.name}</option>
                          </>
                        ))}
                      </select>
                    )}
                  </span>
                  <span className="ml-3">
                    {categoryWithParent3.length > 0 && (
                      <select
                        className="form-control-sm"
                        name="editOptions"
                        id="editOption"
                        onChange={this.handleChange3}
                        ref={this.withParent3}
                      >
                        <option value="" />

                        {categoryWithParent3.map(sc => (
                          <>
                            <option value={sc._id}>{sc.name}</option>
                          </>
                        ))}
                      </select>
                    )}
                  </span>
                </>
              )}
            </div>

            <p className="text-muted mt-2" style={{ fontSize: "10px" }}>
              We have choosed this category for you. if u think this does not
              match your problem, you can change it
            </p>
          </>
        ) : (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Location;
