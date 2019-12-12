import React from "react";
import openSocket from "socket.io-client";
import { sendMessage, getAllMessages } from "../../../services/messageService";
import config from "../../../config.json";

import authService, { getCurrentUser } from "../../../services/authService";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import { getSpecificComplainer } from "../../../services/complainerService";
import { toast } from "react-toastify";

const socket = openSocket(config.apiEndpoint);

class AssigneeMessage extends React.Component {
  state = {
    message: "",
    allMessages: [],
    selectedFile: null,
    complainer: ""
  };

  scroll = React.createRef();

  async componentDidMount() {
    this.getAllMessages();

    const { data: complainer } = await getSpecificComplainer(
      this.props.match.params.id
    );
    this.setState({ complainer });
  }

  getAllMessages = async () => {
    let user = getCurrentUser();
    const data = {
      sender: this.props.match.params.id,
      receiver: user._id
    };
    const { data: msgs } = await getAllMessages(data);

    msgs.sort((a, b) => {
      return a.createdAt.localeCompare(b.createdAt);
    });
    // msgs.sort((a, b) => {
    //   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    // });
    this.listen(user);

    this.setState({ allMessages: msgs });
    this.scroll.current.scrollIntoView();
  };

  listen = user => {
    socket.on("msg", data => {
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
          // toast.success("Message Sent");
        }
      }
    });
  };

  // componentWillUnmount() {
  //   socket.disconnect(true);
  // }

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
      this.setState({ message: "" });
      this.scroll.current.scrollIntoView();
    } else {
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
    this.setState({ selectedFile: e.target.files[0] });

    this.setState({ message: e.target.files[0].name });
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
          <i className="fa fa-file " /> attachment
        </a>
      );
    } else {
      return <span>{msg.messageBody}</span>;
    }
  };

  render() {
    return (
      <div className="">
        <div className={styles.chat}>
          <div className={styles.chat__sidebar}>
            {this.state.complainer && (
              <div className="mt-5 ml-4 ">
                Chat with <br />
                <h5 className="mt-2"> {this.state.complainer.name}</h5>
              </div>
            )}

            <Link
              to={`/${getCurrentUser().role}`}
              className="btn btn-outline-light m-1"
            >
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
                            {this.state.complainer && (
                              <span>{this.state.complainer.name}</span>
                            )}
                            :
                          </span>
                        )}
                        {/* <span> {this.displayMessage(a)}</span> */}
                        <span>
                          {a.messageBody.includes("cmp-") ? (
                            <>
                              <a
                                href={`${config.apiUrl}/messages/file/${a._id}/${a.messageBody}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white"
                              >
                                <i className="fa fa-file" /> attachment
                              </a>
                            </>
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
                <i class="fa fa-paper-plane" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AssigneeMessage;
