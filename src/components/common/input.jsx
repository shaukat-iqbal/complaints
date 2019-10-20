import React from "react";

const Input = ({ name, label, error, classname = "form-control", ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input {...rest} name={name} id={name} className={classname} />
      {error && (
        <div className="alert alert-danger" style={{ fontSize: "12px" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
