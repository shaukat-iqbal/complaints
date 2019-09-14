import React from "react";
const Switch = ({ label, name, onClick, ...rest }) => {
  return (
    <div className="custom-control custom-switch mb-2">
      <input
        type="checkbox"
        name={name}
        className="custom-control-input"
        id={name}
        onChange={onClick}
        {...rest}
      />
      <label className="custom-control-label" htmlFor={name}>
        {label}
      </label>
    </div>
  );
};

export default Switch;
