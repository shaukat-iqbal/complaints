import React, { Component } from "react";
import { Accordion, Card } from "react-bootstrap";

class Acc extends Component {
  state = {};
  render() {
    const { category, onEdit, onDelete, onAddChild, onDragStart } = this.props;
    return (
      <Accordion defaultActiveKey="">
        <Card>
          <Accordion.Toggle as={Card.Header} eventKey="0">
            shaykar
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <div className="d-flex ">
                <button
                  className="btn btn-primary btn-sm mr-1"
                  onClick={onEdit}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary btn-sm mr-1"
                  onClick={onAddChild}
                >
                  Add Child
                </button>
                <button className="btn btn-danger btn-sm" onClick={onDelete}>
                  Delete
                </button>
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
}

export default Acc;
