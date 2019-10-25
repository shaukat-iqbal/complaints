import React from "react";

const Input = ({ name, label, error, classname = "form-control", ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input {...rest} name={name} id={name} className={classname} />
      {error && (
        <div className="alert alert-danger p-0" style={{ fontSize: "12px" }}>
          <p className="p-1 m-0">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Input;
