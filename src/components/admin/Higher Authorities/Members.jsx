import React, { Component } from "react";
import _ from "lodash";
import { paginate } from "../../../utils/paginate";
import Pagination from "../../common/pagination";
import SearchBox from "../../common/searchBox";
import HigherAuthoritiesTable from "./membersTable";
import { Link } from "react-router-dom";
import Loading from "../../common/loading";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import MemberForm from "./memberForm";

import {
  deleteMember,
  getHigherAuthorityMembers
} from "../../../services/HigherAuthoritiesService";

class Members extends Component {
  state = {
    users: [],
    currentPage: 1,
    pageSize: 5,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" },
    isLoading: true,
    showMemberForm: false
  };

  async componentDidMount() {
    const { data: members } = await getHigherAuthorityMembers();
    this.setState({ users: members, isLoading: false });
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
      await deleteMember(user._id);
    } catch (ex) {
      this.setState({ users: originalUsers });
      if (ex.response && ex.response.status === 404) {
        // toast.error("This user has already been deleted.");
      }
    }
  };

  handleEdit = user => {
    this.setState({
      selectedMember: user,
      showMemberForm: true,
      isEditView: true
    });
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
  handleShowForm = () => {
    this.setState({ showMemberForm: true });
  };

  handleAddMember = member => {
    let members = [...this.state.users];
    if (this.state.isEditView) {
      let index = members.findIndex(m => m._id === member._id);
      members[index] = member;
    } else {
      members.push(member);
    }
    this.setState({
      users: members,
      showMemberForm: false,
      isEditView: false,
      selectedMember: null
    });
    return;
  };
  handleClose = () => {
    this.setState({ showMemberForm: false });
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
              There are no Members in the database.
              <Link to="/admin/users/register">Create an Account</Link>
            </p>
          ) : (
            <div className="d-flex flex-wrap flex-column mx-1 ">
              <div className="align-self-end mr-4 ">
                <p>Showing {totalCount} Users.</p>
                <SearchBox value={searchQuery} onChange={this.handleSearch} />
              </div>
              {totalCount > 0 ? (
                <div className="d-flex flex-column align-content-between justify-content-between ">
                  <div className="card container shadow-lg mb-3">
                    <div className="card-body ">
                      <button
                        className="btn btn-sm btn-info rounded-pill mb-1"
                        onClick={this.handleShowForm}
                      >
                        Add New...
                      </button>
                      <HigherAuthoritiesTable
                        members={users}
                        onDelete={this.handleDelete}
                        onEdit={this.handleEdit}
                        onSort={this.handleSort}
                        sortColumn={this.state.sortColumn}
                      />
                      {this.state.showMemberForm && (
                        <MemberForm
                          isOpen={this.state.showMemberForm}
                          onClose={this.handleClose}
                          isEditView={this.state.isEditView}
                          selectedMember={this.state.selectedMember}
                          onSuccess={this.handleAddMember}
                        />
                      )}
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
                <div>No Member Found</div>
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

export default Members;
