import React, { Component } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import Navbar from "./navbar/navbar";
import auth from "../../services/authService";
import { getComplaints } from "../../services/complaintService";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ListGroup from "../common/listGroup";
import { getCategories } from "../../services/categoryService";
import CompalinerTable from "./complainerTable/complainerTable";
import SearchBox from "./searchBox";
import openSocket from "socket.io-client";
import GraphBanner from "../common/GraphsBanner";
import ComplaintForm from "./ComplaintForm/complaintForm";
import Loading from "../common/loading";
import ComplaintDetail from "../common/ComplaintDetail";
import { getAllNotifications } from "../../services/notificationService";
import config from "./../../config.json";
const socket = openSocket(config.apiEndpoint);

class Complainer extends Component {
  state = {
    complaints: [],
    categories: [],
    assignees: [],
    notifications: [],
    pageSize: 9,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    isLoading: false
  };
  componentWillUnmount() {
    socket.disconnect(true);
  }
  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      const user = auth.getCurrentUser();
      if (!user || user.role !== "complainer") {
        toast.error("Access denied to this Route!");
        this.props.history.replace("/");
      }
      const { data } = await getAllNotifications();
      console.log("notifications", data);
      this.setState({ user, notifications: data });
    } catch (ex) {
      window.location = "/login";
    }

    this.getAllComplaints();

    const user = auth.getCurrentUser();
    socket.on("msg", data => {
      if (data.receiver === user._id) {
        toast.info("New Message: " + data.messageBody);
      }
    });

    socket.on("complaints", data => {
      if (
        user.companyId !== data.notification.companyId ||
        user._id !== data.notification.receivers.id
      ) {
        return;
      }

      if (data.action === "status changed") {
        this.replaceUpdatedComplaint(data.complaint);
        toast.info(
          `Complaints: "${data.complaint}'s" status is changed to "${data.status}"`
        );
        this.setState(prevState => {
          const updatednotifications = [...prevState.notifications];
          updatednotifications.unshift(data.notification);
          return { notifications: updatednotifications };
        });
        // this.getAllComplaints();
      }
    });
  }
  // handling after dropping complaint from assignee
  replaceUpdatedComplaint = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      let index = updatedComplaints.findIndex(c => c._id === complaint._id);
      if (index >= 0) updatedComplaints[index] = complaint;
      return { complaints: updatedComplaints, isLoading: false };
    });
  };

  // getting all complaints
  getAllComplaints = async () => {
    this.setState({ isLoading: true });
    const { data: complaints } = await getComplaints();
    const { data: allcategories } = await getCategories();

    let temp = [];
    // To render side bar of only those categories of which complainer has made a complaint
    complaints.forEach(complaint => {
      let cat = allcategories.find(c => c._id === complaint.category._id);
      let available = temp.find(ca => ca._id === cat._id);
      if (!available) temp.push(cat);
    });
    const categories = [{ _id: "", name: "All Categories" }, ...temp];

    this.setState({ complaints, categories, isLoading: false });
    const uniqueAssignees = this.getUniqueAssignees(complaints);
    this.setState(prevState => {
      return {
        assignees: uniqueAssignees,
        isLoading: false
      };
    });
  };

  getUniqueAssignees = complaints => {
    if (!complaints.length) return [];
    let arr = [];

    for (let i = 0; i < complaints.length; i++) {
      if (complaints[i].assignedTo) {
        arr.push(complaints[i].assignedTo);
      }
    }

    const uniqueAssignees = _.uniqBy(arr, function(o) {
      return o._id;
    });
    return uniqueAssignees;
  };

  // // handle detail
  // handleDetail = complaint => {
  //   // console.log(complaint);
  //   this.props.history.replace(`/complainer/${complaint._id}`);
  // };
  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.setState({ selectedComplaint: complaint, isDetailFormEnabled: true });
  };

  handleClose = () => {
    this.setState({ selectedComplaint: null, isDetailFormEnabled: false });
  };

  // handle Category Select
  handleCategorySelect = category => {
    this.setState({
      selectedCategory: category,
      searchQuery: "",
      currentPage: 1
    });
  };

  // handle pagination
  handlePageChange = page => {
    this.setState({ currentPage: page });
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

  closeComplaintForm = complaint => {
    if (complaint) {
      let { complaints } = this.state;
      complaints.unshift(complaint);
      this.setState({ complaints });
    }
    this.toggleComplaintForm();
  };

  toggleComplaintForm = () => {
    let isFormEnabled = this.state.isFormEnabled;
    let now = !isFormEnabled;
    this.setState({ isFormEnabled: now });
  };
  // render
  render() {
    // get paged data
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery,
      assignees,
      notifications,
      isLoading
    } = this.state;
    // const { length: count } = this.state.complaints;
    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <>
          <Navbar
            user={this.state.user}
            assignees={assignees}
            notifications={notifications}
            {...this.props}
          />

          <div className="container">
            {isLoading && <Loading />}
            <button
              type="button"
              onClick={this.toggleComplaintForm}
              // to="/complainer/new-complaint"
              className="btn button-primary mb-2"
            >
              New Complaint &rarr;
            </button>
            <h4>There are no complaints in the database</h4>
          </div>
        </>
      );
    }

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

    // get paged data end
    return (
      <React.Fragment>
        {this.state.selectedComplaint && (
          <ComplaintDetail
            isOpen={this.state.isDetailFormEnabled}
            onClose={this.handleClose}
            complaint={this.state.selectedComplaint}
          />
        )}
        <Navbar
          user={this.state.user}
          assignees={assignees}
          notifications={notifications}
          {...this.props}
        />
        {this.state.isLoading && <Loading />}

        <div className="container">
          {/* {this.state.user && <h3>Hello {this.state.user.name} !</h3>}
          <hr /> */}
          {/* <Showcase
            resolved={resolved}
            inprogress={inprogress}
            closed={closed}
          /> */}
          {this.state.complaints.length > 0 && (
            <GraphBanner complaints={this.state.complaints} />
          )}
          <ComplaintForm
            isOpen={this.state.isFormEnabled}
            onSuccess={this.closeComplaintForm}
            onClose={this.toggleComplaintForm}
          />
          {count !== 0 && (
            <div className="row">
              <div className="col-md-2 mb-2">
                <ListGroup
                  items={this.state.categories}
                  selectedItem={this.state.selectedCategory}
                  onItemSelect={this.handleCategorySelect}
                />
              </div>
              <div className="col-md-10">
                <button
                  type="button"
                  onClick={this.toggleComplaintForm}
                  // to="/complainer/new-complaint"
                  className="btn button-primary mb-2"
                >
                  New Complaint &rarr;
                </button>

                {sorted.length > 0 ? (
                  <>
                    <p>Showing {filtered.length} complaints</p>

                    <SearchBox
                      value={searchQuery}
                      onChange={this.handleSearch}
                    />

                    <CompalinerTable
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
                  </>
                ) : (
                  <>
                    <h4 className="mt-2">No Complaint </h4>
                    <SearchBox
                      value={searchQuery}
                      onChange={this.handleSearch}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Complainer;
