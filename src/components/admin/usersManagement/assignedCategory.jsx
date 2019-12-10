import React from "react";

const AssignedCategory = ({ responsibility, onDelete, hidden, tooltip }) => {
  return (
    <div className="d-flex mb-1">
      <div
        className="flex-grow-1"
        data-toggle="tooltip"
        data-placement="top"
        title={`${tooltip}`}
      >
        <button
          type="button"
          className=" list-group-item list-group-item-action"
        >
          Category:{" " + responsibility.category.name}
          <br />
          Location:{" " + responsibility.location.name}
        </button>
      </div>
      <div hidden={hidden}>
        <button
          style={{ height: "100%" }}
          type="button"
          className=" list-group-item list-group-item-action d-flex justify-content-center align-items-center"
          value={responsibility}
          onClick={onDelete}
        >
          <i className="fa fa-trash fa-2x" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default AssignedCategory;
