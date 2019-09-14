import React, { useState, useEffect, useRef } from "react";

import {
  getComplaintForAdmin,
  changeStatus
} from "../../services/complaintService";

export default function ComplaintDetail(props) {
  const [complaint, setComplaint] = useState([]);
  const [edit, setEdit] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const statusValue = useRef(null);

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

  const fetchComplaint = async id => {
    const { data: complaint } = await getComplaintForAdmin(id);
    setComplaint(complaint);
    setRemarks(complaint.remarks);
  };

  useEffect(() => {
    const id = props.match.params.id;
    fetchComplaint(id);
  }, []);

  // handle Edit
  const handleEdit = () => {
    setEdit(true);
  };

  // handle save
  const handleSave = async id => {
    const value = statusValue.current.value;

    if (remarks.length < 5) {
      return setError("Remarks length should be atleast 5 charaters long.");
    }

    const { data: complaint } = await changeStatus(id, value, remarks);
    setEdit(false);
    setComplaint(complaint);
    // window.location = `/assignee/${complaint._id}`;
  };

  // handle remarks
  const handleRemarks = ({ currentTarget: input }) => {
    setRemarks(input.value);
  };

  // handle Back to Dashbaord
  function handleBack() {
    props.history.replace("/assignee/dashboard");
  }

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

  return (
    <div className="container">
      <button
        className="btn button-outline-secondary mb-2"
        onClick={handleBack}
      >
        &larr; Back to Dashboard
      </button>
      <div className="card">
        <div className="card-header">
          <h3>Details</h3>
        </div>

        <div className="card-body">
          {!complaint && <h3>No Complaint found with this ID.</h3>}
          <div className="row">
            <div className="col-md-12 col-sm-12 mb-2 overflow-auto">
              <strong> Title:</strong> {complaint.title} <br /> <br />
              <strong> Details:</strong> {complaint.details} <br /> <br />
              <strong> Location:</strong> {complaint.location} <br /> <br />
              {/* {complaint.assignedTo && complaint.category && (
                <>
                  <strong> Assigned to:</strong> {complaint.assignedTo.name}{" "}
                  <br />
                  <br />
                  <strong> Category:</strong> {complaint.category.name}
                </>
              )} */}
              <span>
                <strong> Remarks:</strong> &nbsp;
                {complaint.remarks === "" ? (
                  <>
                    {" "}
                    <span>No Remarks yet</span> <br />
                  </>
                ) : (
                  <span>
                    {complaint.remarks} <br />
                  </span>
                )}
                <br />
                <strong>Feedback:</strong>&nbsp; &nbsp;
                {complaint.feedbackRemarks} <br /> <br />
                <strong>Status:</strong>&nbsp; &nbsp;
                {!edit && <span>{complaint.status}</span>}
                {/* display drop down */}
                {edit && (
                  <>
                    <div className="form-group d-inline">
                      <select
                        className="form-control-sm"
                        name="editOptions"
                        id="editOption"
                        ref={statusValue}
                      >
                        <option value="in-progress">in-progress</option>
                        <option value="closed - relief granted">
                          closed - relief granted
                        </option>
                        <option value="closed - partial relief granted">
                          closed - partial relief granted
                        </option>
                        <option value="closed - relief can't be granted">
                          closed - relief can't be granted
                        </option>
                      </select>
                    </div>
                    <div className="form-group mt-4">
                      <textarea
                        className="form-control"
                        name="remarks"
                        id="remarks"
                        value={remarks}
                        onChange={e => handleRemarks(e)}
                        cols="10"
                        rows="5"
                        minLength="5"
                        placeholder="Your remarks..."
                      />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                  </>
                )}
                <button className="btn  ml-2 mb-2" onClick={handleEdit}>
                  <i className="fa fa-pencil" /> &nbsp;
                </button>
              </span>
              {edit && (
                <button
                  className="btn button-primary ml-2 mb-2"
                  onClick={() => {
                    return handleSave(complaint._id);
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {complaint.files !== "" && (
            <>
              <button
                className="btn button-secondary my-2 mr-2"
                onClick={() => handleFileDownload(complaint)}
              >
                Download File(s)
              </button>
              <button
                to="/"
                className="btn button-secondary my-2"
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
    </div>
  );
}
