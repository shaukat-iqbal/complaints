import React from "react";
const FindUser = ({ onChange, onSearch, onCancel, data, error }) => {
  return (
    <div
      className=" d-flex align-items-center justify-content-center "
      style={{ height: "600px" }}
    >
      <div className="card w-50" style={{ minWidth: "500px" }}>
        <div className="pt-3 px-2">
          <div className="mx-1 border-bottom">
            <strong>Find Your Account</strong>
          </div>
        </div>
        <div className="card-body pt-2 px-4">
          <div className="m-auto" style={{ width: "400px" }}>
            <div className="mb-2" style={{ fontSize: "14px" }}>
              Please enter your email address to search for your account.
            </div>
            <div className="d-flex align-content-between">
              <input
                className="form-control"
                placeholder="Email Address"
                autoFocus={true}
                type="email"
                name="email"
                value={data.email}
                onChange={onChange}
              />
              <select className="dropdown" name="role" onChange={onChange}>
                <option className="dropdown-item" defaultValue="admin">
                  Admin
                </option>
                <option className="dropdown-item" value="assignee">
                  Assignee
                </option>
                <option className="dropdown-item" value="complainer">
                  Complainer
                </option>
              </select>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
          </div>
        </div>
        <div className="card-footer py-2 d-flex justify-content-end">
          <button className="btn btn-sm btn-primary mx-1" onClick={onSearch}>
            Search
          </button>
          <button className="btn btn-sm btn-danger" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindUser;
