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
    const response = await getAllUsers(this.props.type);
    this.setState({ users: response.data, isLoading: false });
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
  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      searchCriteria,
      users: allAssignees
    } = this.state;

    let filtered = allAssignees;
    if (searchQuery) {
      if (searchCriteria === "Name") {
        filtered = allAssignees.filter(assignee =>
          assignee.name.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
      } else {
        if (searchQuery === "null") {
          filtered = allAssignees.filter(
            assignee => !assignee.responsibilities.length
          );
        } else {
          filtered = allAssignees.filter(assignee => {
            if (!assignee.responsibilities.length) return null;
            let a = assignee.responsibilities.find(r =>
              r.category.name
                .toLowerCase()
                .startsWith(searchQuery.toLowerCase())
            );
            return a;
          });
        }
      }
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const users = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: users };
  };

  handleSearchCriteria = e => {
    let searchCriteria = e.target.value;
    this.setState({ searchCriteria });
  };
  render() {
    const { length: count } = this.state.users;
    const { pageSize, currentPage, searchQuery } = this.state;

    const { totalCount, data: users } = this.getPagedData();
    return (
      <div>
        {!this.state.isLoading ? (
          count < 1 ? (
            <p className="alert alert-info p-4">
              There are no users in the database.
              <Link to="/admin/users/register">Create an Account</Link>
            </p>
          ) : (
            <>
              <div className="d-flex flex-wrap flex-column mx-5 ">
                <div className="align-self-end mr-4 ">
                  <p className="m-0">Showing {totalCount} Users.</p>
                  <div className="input-group">
                    <SearchBox
                      value={searchQuery}
                      onChange={this.handleSearch}
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
                  </div>
                </div>

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
                      itemsCount={totalCount}
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
