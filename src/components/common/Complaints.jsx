import React, { Component } from "react";
import SearchBox from "./searchBox";
import { paginate } from "../../utils/paginate";
import ListGroup from "./listGroup";
import Pagination from "./pagination";
import ComplaintsTable from "./ComplaintsTable";
import _ from "lodash";
import ComplaintDetail from "./ComplaintDetail";
import { getAdminComplaints } from "../../services/complaintService";
class Complaints extends Component {
  constructor(props) {
    super(props);
    this.state.complaints = props.complaints;
    this.state.categories = props.categories;
    this.state.itemsCount = props.itemsCount;
  }
  state = {
    pageSize: 3,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    searchBy: "title"
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
    const { pageSize } = this.state;
    const response = await getAdminComplaints(
      page,
      pageSize,
      searchBy,
      searchKeyword,
      keywordType
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
    let { searchBy, pageSize } = this.state;
    const response = await getAdminComplaints(1, pageSize, searchBy, query);
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

  render() {
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery,
      itemsCount
    } = this.state;
    const { length: count } = this.state.complaints;
    let filtered = allComplaints;
    if (searchQuery) {
      filtered = allComplaints.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedCategory && selectedCategory._id) {
      filtered = allComplaints.filter(
        c => c.category._id === selectedCategory._id
      );
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const complaints = sorted;
    // const complaints = paginate(sorted, currentPage, pageSize);
    return (
      <>
        {count <= 0 ? (
          <div className="container  ">
            <h4>There are no complaints.</h4>
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
                <ListGroup
                  items={this.props.uniqueCategories}
                  selectedItem={this.state.selectedCategory}
                  onItemSelect={this.handleCategorySelect}
                />
              </div>
              <div className="col-md-10">
                <p>
                  Showing {filtered.length} of {this.state.itemsCount}{" "}
                  complaints
                </p>

                <SearchBox value={searchQuery} onChange={this.handleSearch} />

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
