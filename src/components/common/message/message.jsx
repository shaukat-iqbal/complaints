/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import openSocket from "socket.io-client";
import config from "../../../config.json";

import { sendMessage, getAllMessages } from "../../../services/messageService";
import authService, { getCurrentUser } from "../../../services/authService";
import styles from "./styles.module.css";
import { getSpecificAssignee } from "../../../services/assigneeService.js";
import { getSpecificAdmin } from "../../../services/userService.js";
import { toast } from "react-toastify";
import { userInfo } from "os";

const socket = openSocket(config.apiEndpoint);

class Message extends React.Component {
  state = {
    message: "",
    allMessages: [],
    selectedFile: null,
    assignee: ""
  };

  scroll = React.createRef();

  async componentDidMount() {
    this.scroll.current.scrollIntoView();
    this.getAllMessages();

    try {
      const { data: assignee } = await getSpecificAssignee(
        this.props.match.params.id
      );

      this.setState({ assignee: assignee });
    } catch (ex) {
      if (ex.response && ex.response.status == 404) {
        const { data: assignee } = await getSpecificAdmin(
          this.props.match.params.id
        );
        this.setState({ assignee: assignee });
      }
    }
  }

  getAllMessages = async () => {
    let user = getCurrentUser();
    const data = {
      sender: user._id,
      receiver: this.props.match.params.id
    };
    const { data: msgs } = await getAllMessages(data);

    // msgs.sort((a, b) => {
    //   return a.createdAt.localeCompare(b.createdAt);
    // });
    msgs.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    this.setState({ allMessages: msgs });
    this.scroll.current.scrollIntoView();

    socket.on("msg", data => {
      console.log(data);
      if (
        (data.sender === this.props.match.params.id &&
          data.receiver === user._id) ||
        (data.sender === user._id &&
          data.receiver === this.props.match.params.id)
      ) {
        try {
          this.setState(prevState => {
            const allMessages = [...prevState.allMessages];
            allMessages.push(data);
            return { allMessages: allMessages };
          });
          this.scroll.current.scrollIntoView();
        } catch (error) {
          // if(data.snde)
          // toast.success("Message Sent");
        }
      }

      // if (data.receiver != user._id && data.sender != user._id) {
      //   console.log(user, data);
      //   return;
      // }
    });
    this.scroll.current.scrollIntoView();
  };

  //componentWillUnmount() {
  // socket.disconnect(true);
  //}

  handleChange = ({ currentTarget: input }) => {
    this.setState({ message: input.value });
  };

  handleSend = async e => {
    e.preventDefault();
    if (this.state.selectedFile) {
      const formData = new FormData();
      formData.append("messageBody", this.state.selectedFile);
      formData.append("sender", authService.getCurrentUser()._id);
      formData.append("receiver", this.props.match.params.id);

      await sendMessage(formData);
    } else {
      const data = {
        messageBody: this.state.message,
        sender: authService.getCurrentUser()._id,
        receiver: this.props.match.params.id
      };
      await sendMessage(data);
    }
    this.setState({ message: "" });
    this.scroll.current.scrollIntoView();
  };

  handleSendFromEnter = async e => {
    e.preventDefault();
    if (e.keyCode === 13) {
      const data = {
        messageBody: this.state.message,
        sender: authService.getCurrentUser()._id,
        receiver: this.props.match.params.id
      };
      await sendMessage(data);
      this.setState({ message: "" });
      this.scroll.current.scrollIntoView();
    }
  };

  handleFileChange = async e => {
    this.setState({
      selectedFile: e.target.files[0],
      message: e.target.files[0]
    });
  };

  displayMessage = msg => {
    if (msg.messageBody.includes("cmp-")) {
      return (
        <a
          href={`${config.apiUrl}/messages/file/${msg._id}/${msg.messageBody}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white"
        >
          <i className="fa fa-file" /> attachment
        </a>
      );
    } else {
      return <span>{msg.messageBody}</span>;
    }
  };

  render() {
    console.log("render");
    return (
      <div className="">
        {/* <Navbar  */}
        <div className={styles.chat}>
          <div className={styles.chat__sidebar}>
            {this.state.assignee && (
              <div className="mt-5 ml-4 ">
                Chat with <br />
                <h5 className="mt-2"> {this.state.assignee.name}</h5>
              </div>
            )}

            <Link to="/complainer" className="btn btn-outline-light m-1">
              &larr; Back to Dashboard
            </Link>
          </div>
          <div className={styles.chat__main}>
            <div className={styles.chat__messages}>
              <div className="scrollable">
                {this.state.allMessages.length > 0 ? (
                  this.state.allMessages.map(a => (
                    <>
                      <p
                        key={a._id}
                        ref={this.scroll}
                        className={
                          a.sender === authService.getCurrentUser()._id
                            ? "p-2 my-3 text-white bg-messenger1 d-inline-block"
                            : "p-2 my-3 bg-messenger2 d-inline-block"
                        }
                        style={{ borderRadius: "20px" }}
                      >
                        {a.sender === authService.getCurrentUser()._id ? (
                          <span className={styles.message__name}>You: </span>
                        ) : (
                          <span className={styles.message__name}>
                            {this.state.assignee && (
                              <span>
                                {this.state.assignee.name.split(" ")[0]}
                              </span>
                            )}
                            :
                          </span>
                        )}
                        {/* <span> {a.messageBody && <> {a.messageBody}</>}</span> */}
                        {/* <span> {this.displayMessage(a)}</span> */}
                        <span>
                          {a.messageBody.includes("cmp-") ? (
                            <span>
                              <a
                                href={`${config.apiUrl}/messages/file/${a._id}/${a.messageBody}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white"
                              >
                                <i className="fa fa-file" /> attachment
                              </a>
                            </span>
                          ) : (
                            <>
                              <span>{a.messageBody}</span>
                              <br></br>
                              {/* <span>{new Date(a.createdAt).getTime()}</span> */}
                            </>
                          )}
                        </span>
                      </p>
                      <br />
                    </>
                  ))
                ) : (
                  <p ref={this.scroll}>
                    <span className="display-4">
                      You have not started the conversation
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className={styles.compose}>
              <input
                type="text"
                className="writeable form-control"
                value={this.state.message}
                onChange={this.handleChange}
                onKeyUp={this.handleSendFromEnter}
                autoFocus
              />
              <input
                type="file"
                name="file"
                id="file"
                style={{ display: "none" }}
                onChange={this.handleFileChange}
                ref={fileInput => (this.fileInput = fileInput)}
              />
              <span className="d-inline-block mr-3">
                <i
                  className="fa fa-file-o fa-2x clickable"
                  aria-hidden="true"
                  title="Pick file"
                  onClick={() => this.fileInput.click()}
                />{" "}
              </span>
              <button
                onClick={this.handleSend}
                className="btn button-secondary"
                disabled={this.state.message ? false : true}
              >
                <i className="fa fa-paper-plane" aria-hidden="true"></i>
              </button>
              {/* {this.state.selectedFile && <p>{this.state.selectedFile.name}</p>} */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Message;
