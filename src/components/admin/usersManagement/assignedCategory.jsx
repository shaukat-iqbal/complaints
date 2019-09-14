import React from "react";

const AssignedCategory = ({ category, onDelete, hidden }) => {
  return (
    <div className="d-flex mb-1">
      <div className="flex-grow-1">
        <button
          type="button"
          className=" list-group-item list-group-item-action"
        >
          {category.name}
        </button>
      </div>
      <div>
        <button
          style={{ height: "46px" }}
          type="button"
          className=" list-group-item list-group-item-action"
          value={category}
          onClick={onDelete}
          hidden={hidden}
        >
          <i className="fa fa-trash fa-2x" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default AssignedCategory;
