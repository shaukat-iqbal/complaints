import React, { Component } from "react";
import { getAdminComplaints } from "../../../services/complaintService";
import Pagination from "../../common/pagination";
import { paginate } from "../../../utils/paginate";
import ListGroup from "../../common/listGroup";
import { getCategories } from "../../../services/categoryService";
import AdminTable from "../AdminTable";
import _ from "lodash";
import SearchBox from "../../complainer/searchBox";
import openSocket from "socket.io-client";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner/Spinner";
import GraphBanner from "../../common/GraphsBanner";
import { countComplainers } from "../../../services/complainerService";
import ComplaintDetail from "../../common/ComplaintDetail";

class Dashboard extends Component {
  state = {
    complaints: [],
    categories: [],
    pageSize: 9,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    isLoading: false
  };
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.complaints.length < this.state.complaints) {
      let { data: months } = await countComplainers();
      this.setState({ countUsers: months });
    }
  }

  // aggregateMonthWiseComplaints = complaints => {
  //   let months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  //   for (let i = 0; i < complaints.length; i++) {
  //     const complaint = complaints[i];
  //     var date = new Date(complaint.timeStamp);
  //     let now = new Date();
  //     let year = date.getFullYear();
  //     if (now.getFullYear() !== year) continue;
  //     let index = date.getMonth();
  //     months[index]++;
  //   }
  //   let chartData = {};
  //   chartData.data = months;
  //   chartData.label = "Monthly Complaints";
  //   this.setState({ chartData, complaints });
  // };

  async componentDidMount() {
    this.getComplaints();
    this.checkingSocketConnection();
    let { data: months } = await countComplainers();

    this.setState({ countUsers: months });
    // const { data: allcategories } = await getCategories();
    // const categories = [{ _id: "", name: "All Categories" }, ...allcategories];

    // this.setState({ categories });
    // console.log("i am in CDM", complaints);
  }

  checkingSocketConnection = () => {
    const socket = openSocket("http://localhost:5000", { reconnection: true });
    socket.on("complaints", data => {
      if (data.action === "new complaint") {
        this.setState({ isLoading: true });
        this.createNewComplaint(data.complaint);
        toast.info(
          `New Complaint has been registered with title "${data.complaint.title}"`
        );
      } else if (data.action === "drop") {
        toast.warn(
          `Assignee has dropped responsibility with complaint title: "${data.complaint.title}" `
        );
        this.setState({ isLoading: true });
        this.createNewComplaintAfterDropping(data.complaint);

        // this.createNewComplaint(data.complaint);
      } else if (data.action === "status changed") {
        toast.info(
          `Complaints: "${data.complaint}'s" status is changed to  "${data.complaint.status}" `
        );
        this.setState({ isLoading: true });
        this.createNewComplaintAfterDropping(data.complaint);
      } else if (data.action === "feedback") {
        this.setState({ isLoading: true });
        this.createNewComplaintAfterDropping(data.complaint);
        toast.info(
          `Complainer has given feedback on Complaint with title "${data.complaint.title}"`
        );
      }
    });
  };

  // create new complaint that is created now
  createNewComplaint = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      updatedComplaints.unshift(complaint);
      return { complaints: updatedComplaints };
    });
    this.setState({ isLoading: false });
  };

  // handling after dropping complaint from assignee
  createNewComplaintAfterDropping = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];

      for (let i = 0; i < updatedComplaints.length; i++) {
        if (updatedComplaints[i]._id === complaint._id) {
          updatedComplaints.splice(i, 1, complaint);
          // return updatedComplaints.unshift(complaint);
        }
      }
      return { complaints: updatedComplaints };
    });
    this.setState({ isLoading: false });
  };

  // get complaints
  getComplaints = async () => {
    this.setState({ isLoading: true });
    const { data: complaints } = await getAdminComplaints();
    const { data: allcategories } = await getCategories();

    let temp = [];
    complaints.forEach(complaint => {
      let cat = allcategories.find(c => c._id === complaint.category._id);
      let available = temp.find(ca => ca._id === cat._id);
      if (!available) temp.push(cat);
    });
    const categories = [{ _id: "", name: "All Categories" }, ...temp];
    this.setState({ isLoading: false, complaints, categories });
    // this.aggregateMonthWiseComplaints(complaints);
  };

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

  // render
  render() {
    // get paged data
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery
    } = this.state;
    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <>
          {this.state.isLoading && (
            <div className="d-flex justify-content-center mt-5">
              <Spinner />
            </div>
          )}
          {count === 0 && <h4>There are no complaints.</h4>}
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
        {this.state.isLoading && (
          <div className="d-flex justify-content-center mt-5">
            <Spinner />
          </div>
        )}

        {/* <Showcase resolved={resolved} inprogress={inprogress} closed={closed} /> */}
        <div className="container">
          {this.state.selectedComplaint && (
            <ComplaintDetail
              isOpen={this.state.isDetailFormEnabled}
              onClose={this.handleClose}
              complaint={this.state.selectedComplaint}
            />
          )}
          {this.state.complaints.length > 0 && (
            <GraphBanner
              complaints={this.state.complaints}
              usersCount={this.state.countUsers}
            />
          )}
          {count !== 0 && (
            <>
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

                  <AdminTable
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
            </>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Dashboard;
