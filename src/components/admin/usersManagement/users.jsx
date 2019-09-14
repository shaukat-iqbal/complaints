import React, { Component } from "react";
import { deleteAssignee } from "../../../services/assigneeService";
import _ from "lodash";
import { paginate } from "./../../../utils/paginate";
import Pagination from "./../../common/pagination";
import SearchBox from "./../../common/searchBox";
import UsersTable from "./usersTable";
import { getAllUsers } from "../../../services/userService";
import { deleteComplainer } from "../../../services/complainerService";
import { Link } from "react-router-dom";
import Loading from "../../common/loading";

class Users extends Component {
  state = {
    users: [],
    currentPage: 1,
    pageSize: 8,
    searchQuery: "",
    selectedGenre: null,
    sortColumn: { path: "name", order: "asc" },
    isLoading: true
  };

  async componentDidMount() {
    const { data: users } = await getAllUsers(this.props.role);

    this.setState({ users, isLoading: false });
  }

  handleDelete = async user => {
    const originalUsers = this.state.users;
    const users = originalUsers.filter(u => u._id !== user._id);
    this.setState({ users });

    try {
      //call function based on user type
      if (this.props.role === "assignees") await deleteAssignee(user._id);
      else await deleteComplainer(user._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // toast.error("This user has already been deleted.");
      }
    }
  };
  handleEdit = user => {
    this.props.history.replace(
      "/admin/users/edit/" + user._id + "/" + this.props.role
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
      users: allAssignees
    } = this.state;

    let filtered = allAssignees;
    if (searchQuery)
      filtered = allAssignees.filter(assignee =>
        assignee.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const users = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: users };
  };

  render() {
    const { length: count } = this.state.users;
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;

    // if (count === 0)
    //   return (
    //     <p className="alert alert-info p-4">
    //       There are no users in the database.
    //       <Link to="/admin/users/register">Create an Account</Link>
    //     </p>
    //   );

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
            <div className="d-flex flex-wrap flex-column mx-5 ">
              <div className="align-self-end ">
                <p>Showing {totalCount} Users.</p>
                <SearchBox value={searchQuery} onChange={this.handleSearch} />
              </div>
              {totalCount > 0 ? (
                <div
                  style={{ minHeight: "500px" }}
                  className="d-flex flex-column align-content-between justify-content-between "
                >
                  <UsersTable
                    users={users}
                    sortColumn={sortColumn}
                    onDelete={this.handleDelete}
                    onEdit={this.handleEdit}
                    onSort={this.handleSort}
                    role={this.props.role}
                  />

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
          )
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}

export default Users;
