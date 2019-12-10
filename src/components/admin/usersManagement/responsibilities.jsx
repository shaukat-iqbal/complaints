import React from "react";
import AssignedCategory from "./assignedCategory";
const AssignedCategoriesList = ({
  responsibilities,
  onDelete,
  hidden,
  tooltips
}) => {
  return (
    <div className="list-group mb-2">
      <fieldset className="border p-2">
        <legend className="w-auto" style={{ color: "#777", fontSize: "14px" }}>
          Assigned Responsibilities
        </legend>

        {responsibilities.length === 0 ? (
          <p>No responsibility assigned</p>
        ) : (
          responsibilities.map((responsibility, index) => (
            <AssignedCategory
              key={responsibility.category._id}
              responsibility={responsibility}
              onDelete={onDelete}
              hidden={hidden}
              tooltip={tooltips[index]}
            />
          ))
        )}
      </fieldset>
    </div>
  );
};

export default AssignedCategoriesList;
