import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from "@material-ui/core/DialogContentText";

import {
  getComplaintForAdmin,
  taskAssignment
} from "../../services/complaintService";
import { getAllAssignees } from "../../services/assigneeService.js";
import { toast } from "react-toastify";
import Users from "./usersManagement/users";

export default function ComplaintDetail(props) {
  const [openAssigneeDialog, setopenAssigneeDialog] = useState(true);
  const [complaint, setComplaint] = useState([]);
  const [displayAssignees, setDisplayAssignees] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");
  // const [categories, setCategories] = useState([]);

  useEffect(() => {
    const id = props.match.params.id;
    fetchComplaint(id);
  }, []);

  function calculateDays() {
    var date = new Date(complaint.timeStamp);
    let d = new Date();
    let da = (
      Math.ceil(Math.abs(d.getTime() - date.getTime()) / (1000 * 3600 * 24)) - 1
    ).toString();
    if (da === "0") {
      return <>Today</>;
    } else {
      return <>{da} day(s) ago</>;
    }
  }

  // getting all assignees
  const getAssignees = async () => {
    const { data: assignees } = await getAllAssignees();

    setAssignees(assignees);
  };

  // handle close main dialog
  function handleClose() {
    props.history.replace("/admin");
  }

  // handle close assignee selection dialog
  function handleCloseAssigneeDialog() {
    setopenAssigneeDialog(false);
    props.history.replace(`/admin/${complaint._id}`);
  }

  // fetching single complaint
  const fetchComplaint = async id => {
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    if (!checkForHexRegExp.test(id)) {
      return setError("Please Enter a valid ID.");
    } else {
      setError("");
      const result = await getComplaintForAdmin(id);
      setComplaint(result.data);
    }
  };

  //handle Assign complaint
  const handleAssign = async complaint => {
    setopenAssigneeDialog(true);
    setDisplayAssignees(true);
    getAssignees();
  };

  // handle file download
  const handleFileDownload = async complaint => {
    window.location =
      "http://localhost:5000/api/complainer-complaints/download/image/" +
      complaint._id;
  };

  // handle file download
  const handleFileView = async complaint => {
    window.open(
      "http://localhost:5000/api/complainer-complaints/view/image/" +
        complaint._id,
      "_blank"
    );
  };

  // // getSpecific categories
  // const getSpecificCategory = async categoryId => {
  //   const { data } = await getSpecificCategories(categoryId);
  //   console.log(data);
  //   setCategories(data);
  // };

  // // render category
  // const renderCategory = categoryId => {
  //   getSpecificCategory(categoryId);
  //   return (
  //     <ul className="list-inline">
  //       {categories.map(c => (
  //         <li key={uuid()} className="list-inline-item">
  //           {c.name}
  //         </li>
  //       ))}
  //     </ul>
  //   );
  // };
  const handleUserSelected = user => {
    setAssignees(user);
    setopenAssigneeDialog(false);
    handleAssignTask(user);
  };

  // handle Assign Task
  const handleAssignTask = async user => {
    const { data: newcomplaint } = await taskAssignment(
      complaint._id,
      user._id
    );
    setComplaint(newcomplaint);
    props.history.replace("/admin");
    toast.success("Complaint is successfully assigned.");
  };

  return (
    <div className="container">
      <button
        className="btn button-outline-secondary mb-2"
        onClick={handleClose}
      >
        &larr; Back to Dashboard
      </button>
      {!complaint.assignedTo && (
        <button
          onClick={() => handleAssign(complaint)}
          className="btn button-outline-primary mb-2 ml-2"
        >
          Assign
        </button>
      )}

      {/* display assignee list */}
      {displayAssignees && (
        <Dialog
          open={openAssigneeDialog}
          onClose={handleCloseAssigneeDialog}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          <div className="card-header mb-2">
            <h5>Assignees List</h5>
          </div>
          <DialogContent>
            <Users
              type="assignees"
              isAssigning={true}
              onUserSelected={handleUserSelected}
            />
          </DialogContent>
          {/* <DialogContent>
            <div className="row">
              <div className="form-group d-inline">
                <strong className="mb-4">Name</strong> &nbsp; &nbsp;
                <select className="form-control-sm" ref={selectedAssignee}>
                  {assignees &&
                    assignees.map(a => (
                      <option key={uuid()} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* <div className="col-md-6">
                 Categories will go here
                </div> 
           </div>
          </DialogContent> 
          */}
          <DialogActions>
            <Button onClick={handleCloseAssigneeDialog} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* display assignee list end */}

      {!error ? (
        <>
          <div className="card shadow-lg">
            <div className="card-header">
              <h3>Complaint Details</h3>
            </div>
            <div className="card-body m-2">
              {!complaint && <h3>No Complaint found with this ID.</h3>}

              <div className="row">
                <div className="col-md-3">
                  <strong> Title:</strong>
                </div>
                <div className="col-md-3">{complaint.title} </div>

                <div className="col-md-3">
                  <strong> Details:</strong>
                </div>
                <div className="col-md-3">{complaint.details} </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <strong> Location:</strong>
                </div>
                <div className="col-md-3">{complaint.location} </div>

                <div className="col-md-3">
                  <strong> Complainer:</strong>
                </div>
                <div className="col-md-3">
                  {complaint.complainer && (
                    <>
                      <span> {complaint.complainer.name}</span> <br />
                    </>
                  )}
                </div>
              </div>
              {complaint.assignedTo && complaint.category && (
                <>
                  <div className="row">
                    <div className="col-md-3">
                      <strong> Assigned to:</strong>
                    </div>
                    <div className="col-md-3">{complaint.assignedTo.name}</div>

                    <div className="col-md-3">
                      <strong> Category:</strong>
                    </div>
                    <div className="col-md-3">{complaint.category.name}</div>
                  </div>
                </>
              )}

              <div className="row">
                <div className="col-md-3">
                  {" "}
                  <strong> Remarks:</strong>
                </div>
                <div className="col-md-3">
                  {complaint.remarks === "" ? (
                    <>
                      {" "}
                      <span>No Remarks yet</span> <br /> <br />{" "}
                    </>
                  ) : (
                    <span>{complaint.remarks}</span>
                  )}
                </div>
                <div className="col-md-3">
                  <strong>Status</strong>
                </div>
                <div className="col-md-3"> {complaint.status} </div>
              </div>

              <div className="row">
                <div className="col-md-3 ">
                  {" "}
                  <strong>Feedback:</strong>
                </div>
                <div className="col-md-6">
                  {" "}
                  {complaint.feedbackRemarks || "No Feedback Yet"}
                </div>
              </div>

              {complaint.files !== "" && (
                <>
                  <button
                    className="btn button-outline-secondary my-2 mr-2"
                    onClick={() => handleFileDownload(complaint)}
                  >
                    Download File(s)
                  </button>
                  <button
                    to="/"
                    className="btn button-outline-secondary my-2"
                    onClick={() => handleFileView(complaint)}
                  >
                    View File
                  </button>{" "}
                  <br />
                </>
              )}
            </div>
            <div className="card-footer text-muted text-center">
              {calculateDays()}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center alert alert-danger">{error}</div>
      )}
    </div>
  );
}
