import React, { Component } from "react";
import SearchBox from "./searchBox";
import ListGroup from "./listGroup";
import Pagination from "./pagination";
import ComplaintsTable from "./ComplaintsTable";
import _ from "lodash";
import ComplaintDetail from "./ComplaintDetail";
import { getComplaintsByRole } from "../../services/complaintService";
import { getCurrentUser } from "../../services/authService";
class Complaints extends Component {
  constructor(props) {
    super(props);
    this.state.complaints = props.complaints;
    this.state.itemsCount = props.itemsCount;
    this.state.user = getCurrentUser();
  }

  state = {
    pageSize: 10,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    searchBy: "title",
    user: {}
  };

  //WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  componentWillReceiveProps(nextProps) {
    this.setState({ complaints: nextProps.complaints });
  }
  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.setState({ selectedComplaint: complaint, isDetailFormEnabled: true });
  };
  handleClose = () => {
    this.setState({ selectedComplaint: null, isDetailFormEnabled: false });
  };

  // handle pagination
  handlePageChange = async page => {
    if (this.state.selectedCategory) {
      await this.getComplaints(
        page,
        "category",
        this.state.selectedCategory._id,
        "ObjectId"
      );
    } else {
      await this.getComplaints(page);
    }
  };

  getComplaints = async (
    page = 1,
    searchBy = "",
    searchKeyword = "",
    keywordType = "string"
  ) => {
    const { pageSize, user } = this.state;
    const response = await getComplaintsByRole(
      page,
      pageSize,
      searchBy,
      searchKeyword,
      keywordType,
      user.role
    );
    let complaints = response.data;
    console.log(complaints, "got response");
    let itemsCount = response.headers["itemscount"];
    this.setState({ complaints, itemsCount, currentPage: page });
  };

  // handle Category Select
  handleCategorySelect = async category => {
    await this.getComplaints(1, "category", category._id, "ObjectId");
    this.setState({
      selectedCategory: category,
      searchQuery: "",
      currentPage: 1
    });
  };

  // handle Sort
  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  // handle Search
  handleSearch = async query => {
    let { searchBy, pageSize, user } = this.state;
    const response = await getComplaintsByRole(
      1,
      pageSize,
      searchBy,
      query,
      "string",
      user.role
    );
    let complaints = response.data;
    console.log(complaints, " Search result");
    let itemsCount = response.headers["itemscount"];

    this.setState({
      searchQuery: query,
      selectedCategory: null,
      currentPage: 1,
      itemsCount,
      complaints
    });
  };

  handleSearchKeyword = query => {
    this.setState({ searchQuery: query });
  };

  searchBar = searchQuery => {
    return (
      <>
        <div className="align-self-end mr-4 ">
          <div className="input-group">
            <SearchBox
              value={searchQuery}
              onChange={this.handleSearchKeyword}
            />

            <button
              className="btn btn-info my-3"
              type="button"
              onClick={() => {
                this.handleSearch(searchQuery);
              }}
            >
              Search
            </button>
          </div>
        </div>
      </>
    );
  };

  render() {
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      searchQuery,
      itemsCount
    } = this.state;
    const { length: count } = this.state.complaints;
    let filtered = allComplaints;

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const complaints = sorted;
    // const complaints = paginate(sorted, currentPage, pageSize);
    return (
      <>
        {count <= 0 ? (
          <div className="container  ">
            <h4>There are no complaints.</h4>
            {this.searchBar(searchQuery)}
          </div>
        ) : (
          <div className="container">
            {this.state.selectedComplaint && (
              <ComplaintDetail
                isOpen={this.state.isDetailFormEnabled}
                onClose={this.handleClose}
                complaint={this.state.selectedComplaint}
              />
            )}
            <div className="row">
              <div className="col-md-2">
                {this.props.uniqueCategories &&
                  this.props.uniqueCategories.length > 0 && (
                    <ListGroup
                      items={this.props.uniqueCategories}
                      selectedItem={this.state.selectedCategory}
                      onItemSelect={this.handleCategorySelect}
                    />
                  )}
              </div>
              <div className="col-md-10">
                <div>
                  Showing {filtered.length} of {this.state.itemsCount}{" "}
                  complaints
                  {this.state.selectedCategory ? (
                    <p>
                      Category:{" "}
                      <strong>{this.state.selectedCategory.name}</strong>
                    </p>
                  ) : (
                    ""
                  )}
                </div>

                {this.searchBar(searchQuery)}

                <ComplaintsTable
                  complaints={complaints}
                  sortColumn={sortColumn}
                  onSort={this.handleSort}
                  onDetail={this.handleDetail}
                />
                <Pagination
                  itemsCount={itemsCount}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={this.handlePageChange}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Complaints;
