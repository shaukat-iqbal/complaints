import React from "react";
import { Link } from "react-router-dom";

const Notfound = () => {
  return (
    <div className="container">
      <h1>Oops! Sorry the page you are looking for is not found</h1>

      <Link to="/login" className="btn button-primary">
        Click here to Login or Go to Main Page{" "}
      </Link>
    </div>
  );
};

export default Notfound;
