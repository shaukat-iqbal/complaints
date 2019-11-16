import React, { Component } from "react";
import SearchBox from "./searchBox";
import { paginate } from "../../utils/paginate";
import ListGroup from "./listGroup";
import Pagination from "./pagination";
import ComplaintsTable from "./ComplaintsTable";
import _ from "lodash";
import ComplaintDetail from "./ComplaintDetail";
class Complaints extends Component {
  constructor(props) {
    super(props);
    this.state.complaints = props.complaints;
    this.state.categories = props.categories;
  }
  state = {
    pageSize: 9,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null
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
  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  // handle Category Select
  handleCategorySelect = category => {
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
  handleSearch = query => {
    this.setState({
      searchQuery: query,
      selectedCategory: null,
      currentPage: 1
    });
  };

  render() {
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery
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

    const complaints = paginate(sorted, currentPage, pageSize);
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
                  items={this.state.categories}
                  selectedItem={this.state.selectedCategory}
                  onItemSelect={this.handleCategorySelect}
                />
              </div>
              <div className="col-md-10">
                <p>Showing {filtered.length} complaints</p>

                <SearchBox value={searchQuery} onChange={this.handleSearch} />

                <ComplaintsTable
                  complaints={complaints}
                  sortColumn={sortColumn}
                  onSort={this.handleSort}
                  onDetail={this.handleDetail}
                />
                <Pagination
                  itemsCount={filtered.length}
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
