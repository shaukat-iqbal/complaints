import React, { useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";

import { getComplaint, giveFeedback } from "../../../services/complaintService";
// import { setChatWith } from "../../../services/assigneeService";
// import Navbar from "../navbar/navbar";
import { toast } from "react-toastify";
// import authService from "../../../services/authService";

export default function ComplaintDetail(props) {
  const [complaint, setComplaint] = useState([]);
  const [displayFeedback, setDisplayFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    feedbackRemarks: "",
    feedbackTags: ""
  });
  const [error, setError] = useState("");
  // const [openMessage, setOpenMessage] = useState(false);

  useEffect(() => {
    const id = props.match.params.id;
    fetchComplaint(id);
  }, []);

  // calculate days
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

  // handle back
  function handleBack() {
    props.history.replace("/complainer");
  }

  // fetch single complaint
  const fetchComplaint = async id => {
    const { data } = await getComplaint(id);
    setComplaint(data);
    setFeedback({
      feedbackRemarks: data.feedbackRemarks,
      feedbackTags: data.feedbackTags
    });

    // const { data: image } = await fetchFile(id);
    // setImage(image);
  };

  // handle give feedback
  const handleDisplayFeedback = id => {
    console.log(id);
    setDisplayFeedback(true);
  };

  // handle feedback
  const handleFeedbackArea = ({ currentTarget: input }) => {
    setFeedback({ feedbackRemarks: input.value });
    setError("");
  };

  // handle satisfaction -- yes
  const handleSatisfaction = () => {
    setFeedback({ ...feedback, feedbackTags: "yes" });
    console.log(feedback.feedbackRemarks);
  };

  // handle not satisfaction -- not
  const handleDisSatisfaction = () => {
    setFeedback({ ...feedback, feedbackTags: "no" });
    console.log(feedback.feedbackRemarks);
  };

  // handle feedback completion
  const handleGiveFeedback = async (id, e) => {
    e.preventDefault();
    if (feedback.feedbackRemarks === "" || feedback.feedbackTags === "") {
      return setError("Please write feedback and choose your satisfaction");
    }
    await giveFeedback(id, feedback);
    setError("");
    setDisplayFeedback(false);
    toast.success("Thankyou for your Feedback");
  };

  // handle Messaging
  const handleMessaging = async assignee => {
    console.log("handle messaging", assignee);

    // window.open(`/c/message/${assignee._id}`, "_blank");
    // window.location = ("/c/message/", assignee._id);
    props.history.replace(`/c/message/${assignee._id}`);
  };

  // display feedback dialog box
  function FeedbackDialogBox() {
    return (
      <>
        <Dialog
          open={displayFeedback}
          onClose={() => {
            setDisplayFeedback(false);
          }}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          <div className="text-center">
            <DialogTitle id="form-dialog-title">
              Rate this complaint resolution
            </DialogTitle>
            <p className="text-muted text-center">Please write your feedback</p>
          </div>
          <div className="container">
            <div className="form-group mt-4">
              <textarea
                className="form-control"
                name="feedback"
                id="feedback"
                value={feedback.feedbackRemarks}
                onChange={e => handleFeedbackArea(e)}
                cols="5"
                rows="2"
                minLength="5"
                placeholder="Write feedback here..."
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <hr />
            <label htmlFor="">
              Are you satisfied with the complaint resolution?
            </label>
            <br />
            <div className="btn-group" role="group">
              <button
                type="button"
                onClick={handleSatisfaction}
                className={
                  feedback.feedbackTags === "yes"
                    ? "btn btn-success"
                    : "btn btn-light"
                }
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleDisSatisfaction}
                className={
                  feedback.feedbackTags === "no"
                    ? "btn btn-danger"
                    : "btn btn-light"
                }
              >
                No
              </button>
            </div>
            <DialogActions>
              <Button
                onClick={() => {
                  setDisplayFeedback(false);
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={e => handleGiveFeedback(complaint._id, e)}
                color="primary"
              >
                Submit
              </Button>
            </DialogActions>
          </div>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      {FeedbackDialogBox()}
      <div className="container mt-4">
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
          <div className="card-body m-2">
            {!complaint && <h3>No Complaint found with this ID.</h3>}
            <div className="row">
              <div className="overflow-auto">
                <strong> Title:</strong> {complaint.title} <br /> <br />
                <strong> Details:</strong> {complaint.details} <br /> <br />
                <strong> Location:</strong> {complaint.location} <br /> <br />
                {complaint.assignedTo && complaint.category && (
                  <>
                    <strong> Assigned to:</strong> {complaint.assignedTo.name}{" "}
                    <br />
                    <br />
                    <strong> Category:</strong> {complaint.category.name} <b />
                  </>
                )}
                <br />
                <br />
                <strong> Remarks:</strong> &nbsp;
                {complaint.remarks === "" ? (
                  <>
                    <span>No Remarks yet</span> <br /> <br />{" "}
                  </>
                ) : (
                  <span>
                    {complaint.remarks} <br /> <br />
                  </span>
                )}
                <b> Status:</b> {complaint.status} <br />
              </div>
            </div>
            <br />
            <button
              className="btn button-outline-primary"
              onClick={() => handleMessaging(complaint.assignedTo)}
            >
              Message
            </button>
            <br />
            {/* display feedback */}
            {complaint.status !== "in-progress" && (
              <button
                className="btn btn-block button-outline-primary mt-2"
                onClick={() => handleDisplayFeedback(complaint._id)}
              >
                Give Feedback <i className="fa fa-comment-o ml-2"></i>
              </button>
            )}
          </div>
          {/* display feedback  end*/}

          <div className="card-footer text-muted text-center">
            {calculateDays()}
          </div>
        </div>
      </div>
    </>
  );
}
