import React, { useState, useEffect, useRef } from "react";
import uuid from "uuid/v1";
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

export default function ComplaintDetail(props) {
  const [openAssigneeDialog, setopenAssigneeDialog] = useState(true);
  const [complaint, setComplaint] = useState([]);
  const [displayAssignees, setDisplayAssignees] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [error, setError] = useState("");
  // const [categories, setCategories] = useState([]);

  const selectedAssignee = useRef();

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

  // handle Assign Task
  const handleAssignTask = async () => {
    console.log(selectedAssignee.current.value);
    const { data: newcomplaint } = await taskAssignment(
      complaint._id,
      selectedAssignee.current.value
    );
    setComplaint(newcomplaint);
    setopenAssigneeDialog(false);
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
      {complaint.assigned === false && (
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
                </div> */}
            </div>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseAssigneeDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAssignTask} color="primary">
              Assign Task
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* display assignee list end */}

      {!error ? (
        <>
          <div className="card">
            <div className="card-header">
              <h3>Details</h3>
            </div>
            <div className="card-body m-2">
              {!complaint && <h3>No Complaint found with this ID.</h3>}
              <div className="row">
                <div className="overflow-auto">
                  <strong> Title:</strong> {complaint.title} <br /> <br />
                  <strong> Details:</strong> {complaint.details} <br /> <br />
                  <strong> Location:</strong> {complaint.location} <br /> <br />
                  {complaint.complainer && (
                    <>
                      <strong> Complainer:</strong>
                      <span> {complaint.complainer.name}</span> <br />
                    </>
                  )}
                  <br />
                  {complaint.assignedTo && complaint.category && (
                    <>
                      <strong> Assigned to:</strong> {complaint.assignedTo.name}
                      <br />
                      <br />
                      <strong> Category:</strong> {complaint.category.name}{" "}
                      <b />
                    </>
                  )}
                  <br />
                  <br />
                  <strong> Remarks:</strong> &nbsp;
                  {complaint.remarks === "" ? (
                    <>
                      {" "}
                      <span>No Remarks yet</span> <br /> <br />{" "}
                    </>
                  ) : (
                    <span>
                      {complaint.remarks} <br /> <br />
                    </span>
                  )}
                  <strong>Status:</strong>&nbsp; &nbsp; {complaint.status}{" "}
                  <br /> <br />
                  <strong>Feedback:</strong>&nbsp; &nbsp;{" "}
                  {complaint.feedbackRemarks}
                </div>

                <br />
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
