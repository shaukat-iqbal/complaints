import React, { Component } from "react";
import _ from "lodash";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

import SearchBox from "../../complainer/searchBox";
import AssigneeTable from "../AssigneeTable";
import Pagination from "../../common/pagination";
import ListGroup from "../../common/listGroup";

import {
  dropResponsibility,
  calculateAggregate
} from "../../../services/complaintService";
import { paginate } from "../../../utils/paginate";
import { toast } from "react-toastify";
import { getAssigneeCategories } from "../../../services/categoryService";
import SpamList from "../spamlist";
import GraphBanner from "../../common/GraphsBanner";
import ComplaintDetail from "../../common/ComplaintDetail";
import Loading from "../../common/loading";

class AssigneeDashboard extends Component {
  state = {
    complaints: [],
    spamComplaints: [],
    displaySpamList: false,
    categories: [],
    pageSize: 7,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    checkedComplaint: null,
    defaultChecked: false,
    confirmSpam: false,
    confirmDrop: false
  };
  constructor(props) {
    super(props);
    this.state.complaints = this.props.complaints;
  }

  //WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  componentWillReceiveProps(nextProps) {
    this.setState({ complaints: nextProps.complaints });
  }
  async componentDidMount() {
    let { data: analytics } = await calculateAggregate();
    this.setState({ analytics });
    this.getAllCategories();
  }

  //getting categories
  getAllCategories = async () => {
    const { data: responsibilities } = await getAssigneeCategories();
    console.log(responsibilities);
    const categories = [
      { _id: "", name: "All Categories" },
      ...responsibilities
    ];
    this.setState({ categories });
  };

  getSpamList = async () => {
    this.setState({ displaySpamList: true });
  };

  // handleCheckSpamDisplay
  handleCheckSpamDisplay = display => {
    this.setState({ displaySpamList: display });
  };

  // handle detail
  handleDetail = complaint => {
    //
    this.props.history.replace(`/assignee/${complaint._id}`);
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

  // handle CheckBoxChecked
  handleCheckBoxChecked = complaint => {
    this.setState({ checkedComplaint: complaint });
  };

  // drop confirmation

  handleDropConfirmation = complaint => {
    this.handleDropResponsibility(complaint);
    this.setState({ confirmDrop: false, checkedComplaint: "" });
  };

  // handle drop responsibility
  handleDropResponsibility = async complaint => {
    this.setState({ isLoading: true });
    let { complaints: original } = this.state;
    try {
      await dropResponsibility(complaint._id);
      let complaints = original.filter(c => c._id !== complaint._id);
      this.setState({ complaints, isLoading: false });
    } catch (ex) {
      if (ex.response && ex.response.status === "400") {
        return toast.warn("Something went wrong");
      }
      this.setState({ complaints: original, isLoading: false });
    }

    toast.success("You have successfully dropped Responsibility");

    // const { data: complaints } = await getAssigneeComplaints();
    // this.setState({ complaints });

    // setTimeout(() => {
    //   toast.success("Complaint is assigned to ADMIN for Further Assignment");
    // }, 900);
  };

  // handle spam
  handleSpamConfirmation = complaint => {
    this.props.onSpam(complaint);
    this.setState({ confirmSpam: false });
  };

  // handle close alert
  handleCloseAlert = () => {
    this.setState({ checkedComplaint: null });
  };

  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.setState({ selectedComplaint: complaint, isDetailFormEnabled: true });
  };
  handleClose = () => {
    this.setState({ selectedComplaint: null, isDetailFormEnabled: false });
  };
  // render
  render() {
    // get paged data
    const {
      // complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery,
      checkedComplaint,
      confirmSpam,
      confirmDrop,
      displaySpamList
    } = this.state;
    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <div className="container mt-3">
          <h4>There are no complaints in the database</h4>
          <button
            className="btn button-outline-secondary btn-block mb-3"
            onClick={this.getSpamList}
          >
            Spam List
          </button>
          {displaySpamList && (
            <SpamList
              displaySpamList={displaySpamList}
              checkDisplay={this.handleCheckSpamDisplay}
            />
          )}
        </div>
      );
    }

    let filtered = this.state.complaints;
    if (searchQuery) {
      filtered = this.state.complaints.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedCategory && selectedCategory._id) {
      filtered = this.state.complaints.filter(
        c => c.category._id === selectedCategory._id
      );
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const complaints = paginate(sorted, currentPage, pageSize);

    // get paged data end
    return (
      <React.Fragment>
        <>
          {this.state.isLoading && <Loading />}
          {displaySpamList && (
            <SpamList
              displaySpamList={displaySpamList}
              checkDisplay={this.handleCheckSpamDisplay}
            />
          )}
          {confirmDrop && (
            <Dialog
              open={confirmDrop}
              onClose={() => {
                this.setState({ confirmDrop: false });
              }}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                Are you sure you want to drop responsibility?
              </DialogTitle>

              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ confirmDrop: false });
                  }}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => this.handleDropConfirmation(checkedComplaint)}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          )}
          {confirmSpam && (
            <Dialog
              open={confirmSpam}
              onClose={() => {
                this.setState({ confirmSpam: false });
              }}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                Are you sure you want to mark this complaint as spam?
              </DialogTitle>

              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ confirmSpam: false });
                  }}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => this.handleSpamConfirmation(checkedComplaint)}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          )}
          {/* <Showcase
            resolved={resolved}
            inprogress={inprogress}
            closed={closed}
          /> */}
          <div className="container">
            {this.state.analytics &&
              this.state.analytics.monthwise &&
              this.state.analytics.monthwise.length > 0 && (
                <GraphBanner
                  analytics={this.state.analytics}
                  complaints={this.state.complaints}
                />
              )}

            {this.state.selectedComplaint && (
              <ComplaintDetail
                isOpen={this.state.isDetailFormEnabled}
                onClose={this.handleClose}
                complaint={this.state.selectedComplaint}
              />
            )}
            {checkedComplaint && (
              <div
                className="alert alert-info dismissible fade show"
                role="alert"
              >
                {/* <span className="d-flex justify-content-end"> */}
                <button
                  className="btn button-primary mr-3"
                  onClick={() => {
                    this.setState({ confirmSpam: true });
                  }}
                >
                  Mark Spam
                </button>
                <button
                  className="btn button-primary"
                  onClick={() => {
                    this.setState({ confirmDrop: true });
                  }}
                >
                  Drop responsibility
                </button>
                {/* </span> */}
                <button
                  type="button"
                  className="close"
                  data-dismiss="alert"
                  aria-label="Close"
                  onClick={this.handleCloseAlert}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            {count !== 0 && (
              <>
                <div className="row">
                  <div className="col-md-2">
                    <button
                      className="btn button-outline-secondary btn-block mb-3"
                      onClick={this.getSpamList}
                    >
                      Spam List
                    </button>
                    <ListGroup
                      items={this.state.categories}
                      selectedItem={this.state.selectedCategory}
                      onItemSelect={this.handleCategorySelect}
                    />
                  </div>
                  <div className="col-md-10">
                    <p>Showing {filtered.length} complaints</p>

                    <SearchBox
                      value={searchQuery}
                      onChange={this.handleSearch}
                    />
                    {sorted.length > 0 ? (
                      <>
                        <AssigneeTable
                          complaints={complaints}
                          sortColumn={sortColumn}
                          onSort={this.handleSort}
                          onDetail={this.handleDetail}
                          onCheckBoxChecked={this.handleCheckBoxChecked}
                          // defaultChecked={defaultChecked}
                          checkedComplaint={checkedComplaint}
                        />
                        <Pagination
                          itemsCount={filtered.length}
                          pageSize={pageSize}
                          currentPage={currentPage}
                          onPageChange={this.handlePageChange}
                        />
                      </>
                    ) : (
                      <h4>No Complaint</h4>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      </React.Fragment>
    );
  }
}

export default AssigneeDashboard;
