import React from "react";
import "./loading.css";
const Loading = () => {
  return (
    <div className="spinnerContainer ">
      <div className="spin" role="status">
        <span className="sr-only spinne ">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
