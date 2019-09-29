import React from "react";
import "./category.css";
import { Accordion, Card } from "react-bootstrap";

const Category = ({
  category,
  onEdit,
  onDelete,
  onAddChild,
  onDragStart,
  onDragOver
}) => {
  return (
    <div
      className="card border-danger p-0 bg-danger m-1"
      onDragStart={e => onDragStart(e, category._id)}
      draggable
      onDragOver={onDragOver}
      key={category._id + " " + category.name}
      id={category._id}
    >
      {/* <div className="card-header category " key={category.name}>
        {category.name}
      </div>

      <div
        className="card-body collapse"
        id={category.name.replace(/\s+/g, "")}
        key={category._id}
      >
        <div className="d-flex mt-2">
          <button className="btn btn-primary btn-sm mr-1" onClick={onEdit}>
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
      </div>
    */}
      <div style={{ position: "relative" }}>
        <div>
          {/* <Accordion defaultActiveKey=""> */}
          <Card>
            <Accordion.Toggle as={Card.Header} eventKey={category._id}>
              <div className="btn btn-info">{category.name}</div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={category._id}>
              <Card.Body>
                <div className="d-flex ">
                  <button
                    className="btn btn-primary btn-sm mr-1"
                    onClick={() => onEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm mr-1"
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
        <div
          onDragStart={e => onDragStart(e, category._id)}
          draggable
          onDragOver={onDragOver}
          key={category._id + "64t " + category.name}
          id={category._id}
          data-toggle="collapse"
          data-target={category._id}
          style={{
            height: "60px",
            width: "80%",
            position: "absolute",
            top: "0",
            right: "0",
            left: "20%"
          }}
        ></div>
      </div>
    </div>
  );
};

export default Category;
