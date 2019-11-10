import React, { Component } from "react";
import _ from "lodash";
import { paginate } from "../../../utils/paginate";
import Pagination from "../../common/pagination";
import SearchBox from "../../common/searchBox";
import Loading from "../../common/loading";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

import {
  getAllowedAttachments,
  deleteAttachment
} from "../../../services/attachmentsService";
import AttachmentsTable from "./attachmentsTable";
import AttachmentForm from "./attachmentForm";
import { toast } from "react-toastify";

class Attachments extends Component {
  state = {
    attachments: [],
    currentPage: 1,
    pageSize: 5,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" },
    isLoading: true,
    showMemberForm: false
  };

  async componentDidMount() {
    const { data: attachments } = await getAllowedAttachments();
    this.setState({ attachments: attachments, isLoading: false });
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
    const originalAttachments = this.state.attachments;
    const attachments = originalAttachments.filter(u => u._id !== user._id);
    this.setState({ attachments });

    try {
      await deleteAttachment(user._id);
      toast.info("Deleted Successfully");
    } catch (ex) {
      this.setState({ attachments: originalAttachments });
      if (ex.response && ex.response.status === 404) {
        toast.warn("Already deleted");
        // toast.error("This user has already been deleted.");
      }
    }
  };

  handleEdit = user => {
    this.setState({
      selectedAttachment: user,
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
      attachments: allAttachments
    } = this.state;

    let filtered = allAttachments;
    if (searchQuery)
      filtered = allAttachments.filter(attachment =>
        attachment.extentionName
          .toLowerCase()
          .startsWith(searchQuery.toLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const attachments = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: attachments };
  };

  handleShowForm = () => {
    this.setState({ showMemberForm: true });
  };

  handleAddMember = attachment => {
    let attachments = [...this.state.attachments];
    if (this.state.isEditView) {
      let index = attachments.findIndex(a => a._id === attachment._id);
      attachments[index] = attachment;
    } else {
      attachments.unshift(attachment);
    }
    this.setState({
      attachments: attachments,
      showMemberForm: false,
      isEditView: false,
      selectedAttachment: null
    });
    if (this.props.enableNext) this.props.enableNext();
  };
  handleClose = () => {
    this.setState({
      showMemberForm: false,
      isEditView: false,
      selectedAttachment: null
    });
  };

  render() {
    const { length: count } = this.state.attachments;
    const { pageSize, currentPage, searchQuery } = this.state;
    const { totalCount, data: attachments } = this.getPagedData();

    return (
      <div>
        {!this.state.isLoading ? (
          count < 1 ? (
            <p className="alert alert-info p-4">
              There are no allowed attachments in the database.
              <button
                className="btn btn-sm btn-info rounded-pill mb-1"
                onClick={this.handleShowForm}
              >
                Add New...
              </button>
            </p>
          ) : (
            <div className="d-flex flex-wrap flex-column mx-1 ">
              <div className="align-self-end mr-4 ">
                <p>Showing {totalCount} atttachments.</p>
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
                      <AttachmentsTable
                        attachments={attachments}
                        onDelete={this.handleDelete}
                        onEdit={this.handleEdit}
                        onSort={this.handleSort}
                        sortColumn={this.state.sortColumn}
                      />
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
        {this.state.showMemberForm && (
          <AttachmentForm
            isOpen={this.state.showMemberForm}
            onClose={this.handleClose}
            isEditView={this.state.isEditView}
            selectedAttachment={this.state.selectedAttachment}
            onSuccess={this.handleAddMember}
          />
        )}
      </div>
    );
  }
}

export default Attachments;
