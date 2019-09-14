import React from "react";
import "./category.css";

const Category = ({ category, onEdit, onDelete, onAddChild, onDragStart }) => {
  return (
    <div
      className="card p-0 m-1"
      onDragStart={e => onDragStart(e, category._id)}
      draggable
      key={category._id + " " + category.name}
    >
      <div
        className="card-header category "
        data-toggle="collapse"
        data-target={`#${category.name.replace(/\s+/g, "")}`}
        aria-expanded="false"
        aria-controls={category.name.replace(/\s+/g, "")}
        key={category.name}
      >
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
    </div>
  );
};

export default Category;
