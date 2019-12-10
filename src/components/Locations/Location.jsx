import React from "react";
import "./location.css";
import { Accordion, Card } from "react-bootstrap";
import uuid from "uuid";
const Location = ({
  category,
  onEdit,
  onDelete,
  onAddChild,
  onDragStart,
  onDragOver
}) => {
  let classes = "d-flex align-self-start p-2";
  if (category.error) classes += " bg-warning";
  return (
    <div
      className=" p-0 bg-danger m-1"
      onDragStart={e => onDragStart(e, category._id)}
      draggable
      onDragOver={onDragOver}
      key={uuid()}
      id={category._id}
    >
      <div key={uuid()}>
        <div key={uuid()}>
          {/* <Accordion defaultActiveKey=""> */}
          <Card>
            <Accordion.Toggle as={Card.text} bg="dark" eventKey={category._id}>
              <div className="category-design" style={{ position: "relative" }}>
                <div className={classes}>{category.name}</div>
                <div
                  onDragStart={e => onDragStart(e, category._id)}
                  onDragOver={onDragOver}
                  key={uuid()}
                  id={category._id}
                  data-toggle="collapse"
                  data-target={category._id}
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    left: "0",
                    height: "100%",
                    width: "100%"
                  }}
                ></div>
              </div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={category._id}>
              <Card.Body>
                {category.error && (
                  <div className="alert alert-danger">
                    {JSON.stringify(category.error)}
                  </div>
                )}
                <div className="d-flex flex-wrap ">
                  <button
                    className="btn btn-primary btn-sm mr-1 mb-1"
                    onClick={() => onEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm mr-1 mb-1"
                    onClick={() => onAddChild(category)}
                  >
                    Add Child
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          {/* </Accordion> */}
        </div>
      </div>
    </div>
  );
};

export default Location;
