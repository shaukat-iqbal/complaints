import React, { Component } from "react";
import { deleteAssignee } from "../../../services/assigneeService";
import _ from "lodash";
import { paginate } from "./../../../utils/paginate";
import Pagination from "./../../common/pagination";
import SearchBox from "./../../common/searchBox";
import { getAllUsers } from "../../../services/userService";
import { deleteComplainer } from "../../../services/complainerService";
import { Link } from "react-router-dom";
import Loading from "../../common/loading";
import User from "./user";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import uuid from "uuid";
class Users extends Component {
  state = {
    users: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" },
    isLoading: true,
    searchCriteria: "Name"
  };

  async componentDidMount() {
    let { pageSize } = this.state;
    const response = await getAllUsers(
      1,
      pageSize,
      "",
      "",
      "string",
      this.props.type
    );
    let itemsCount = response.headers["itemscount"];
    this.setState({ users: response.data, itemsCount, isLoading: false });
  }

  handleDelete = async user => {
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteUser(user)
        },
        {
          label: "No"
        }
      ]
    });
  };

  deleteUser = async user => {
    const originalUsers = this.state.users;
    const users = originalUsers.filter(u => u._id !== user._id);
    this.setState({ users });

    try {
      //call function based on user type
      if (this.props.type === "assignees") await deleteAssignee(user._id);
      else await deleteComplainer(user._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // toast.error("This user has already been deleted.");
      }
    }
  };

  // handle pagination
  handlePageChange = async page => {
    // if (this.state.selectedCategory) {
    //   await this.getComplaints(
    //     page,
    //     "category",
    //     this.state.selectedCategory._id,
    //     "ObjectId"
    //   );
    // } else {
    // }
    await this.getUsers(page);
  };

  getUsers = async (
    page = 1,
    searchBy = "",
    searchKeyword = "",
    keywordType = "string"
  ) => {
    let { pageSize } = this.state;
    const response = await getAllUsers(
      page,
      pageSize,
      searchBy,
      searchKeyword,
      keywordType,
      this.props.type
    );
    let itemsCount = response.headers["itemscount"];
    console.log(response.data, "got users");
    this.setState({
      users: response.data,
      itemsCount,
      isLoading: false,
      currentPage: page
    });
  };

  // handle Search
  handleSearch = async query => {
    let { searchCriteria: searchBy } = this.state;
    searchBy = searchBy.toLowerCase();
    await this.getUsers(1, searchBy, query, "string");
    console.log("search results");
    this.setState({ searchQuery: query });
  };

  handleSearchKeyword = query => {
    this.setState({ searchQuery: query });
  };
  handleProfile = user => {
    this.props.history.push(
      `/admin/users/profile/${user._id}/${this.props.type}`
    );
  };
  handleEdit = user => {
    this.props.history.replace(
      "/admin/users/edit/" + user._id + "/" + this.props.type
    );
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const { sortColumn, users: allUsers } = this.state;

    let filtered = allUsers;
    // if (searchQuery) {
    //   if (searchCriteria === "Name") {
    //     filtered = allUsers.filter(user =>
    //       user.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    //     );
    //   } else {
    //     if (searchQuery === "null") {
    //       filtered = allUsers.filter(
    //         assignee => !assignee.responsibilities.length
    //       );
    //     } else {
    //       filtered = allUsers.filter(assignee => {
    //         if (!assignee.responsibilities.length) return null;
    //         let a = assignee.responsibilities.find(r =>
    //           r.category.name
    //             .toLowerCase()
    //             .startsWith(searchQuery.toLowerCase())
    //         );
    //         return a;
    //       });
    //     }
    //   }
    // }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);
    return { totalCount: filtered.length, data: sorted };
  };

  handleSearchCriteria = e => {
    let searchCriteria = e.target.value;
    this.setState({ searchCriteria });
  };

  searchBar = (totalCount, searchQuery) => {
    return (
      <>
        <div className="align-self-end mr-4 ">
          <p className="m-0">Showing {totalCount} Users.</p>
          <div className="input-group">
            <SearchBox
              value={searchQuery}
              onChange={this.handleSearchKeyword}
            />

            {this.props.type === "assignees" && (
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary dropdown-toggle my-3"
                  style={{ width: "100px" }}
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {this.state.searchCriteria}
                </button>
                <div className="dropdown-menu">
                  <option
                    className="dropdown-item"
                    value="Name"
                    onClick={e => this.handleSearchCriteria(e)}
                  >
                    Name
                  </option>
                  <option
                    className="dropdown-item"
                    value="Category"
                    onClick={e => this.handleSearchCriteria(e)}
                  >
                    Category
                  </option>
                </div>
              </div>
            )}
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
    const { length: count } = this.state.users;
    const { pageSize, currentPage, searchQuery, itemsCount } = this.state;

    const { totalCount, data: users } = this.getPagedData();
    return (
      <div>
        {!this.state.isLoading ? (
          count < 1 ? (
            <>
              <p className="alert alert-info p-4">
                There are no users in the database.
                <Link to="/admin/users/register">Create an Account</Link>
              </p>
              {this.searchBar(totalCount, searchQuery)}
            </>
          ) : (
            <>
              <div className="d-flex flex-wrap flex-column mx-5 ">
                {this.searchBar(totalCount, searchQuery)}
                {totalCount > 0 ? (
                  <div
                    style={{ minHeight: "500px" }}
                    className="d-flex flex-column align-content-between justify-content-between "
                  >
                    <div className="card container shadow-lg mb-3">
                      <div className="card-body">
                        {users.map(user => (
                          <User
                            key={uuid()}
                            showCrudBtns={!this.props.isAssigning}
                            user={user}
                            onProfileView={this.handleProfile}
                            onDelete={this.handleDelete}
                            onEdit={this.handleEdit}
                            onUserSelected={this.props.onUserSelected}
                          />
                        ))}
                      </div>
                    </div>

                    <Pagination
                      itemsCount={itemsCount}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div>
                ) : (
                  <div>No User Found</div>
                )}
              </div>
            </>
          )
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}

export default Users;
