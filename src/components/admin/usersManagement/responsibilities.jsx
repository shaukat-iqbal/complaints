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
          Assigned categories
        </legend>

        {responsibilities.length === 0 ? (
          <p>No category assigned</p>
        ) : (
          responsibilities.map((category, index) => (
            <AssignedCategory
              key={category._id}
              category={category}
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
