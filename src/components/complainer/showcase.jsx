import React from "react";
import CountUp from "react-countup";

const Showcase = ({ resolved, inprogress, closed }) => {
  return (
    <React.Fragment>
      <div className="container ">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-4 col-md-6 mb-4 ">
            <div
              className="card mt-4 bg-primary-color navbar-shadow rounded text-white text-center"
              style={{ width: "18rem", borderRadius: "15px" }}
            >
              <div className="card-body">
                <h3>
                  <i className="fa fa-spinner" />
                </h3>
                <h3>In Progress</h3>
                <br />
                <CountUp duration={3} end={inprogress} />
                <br />
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4 ">
            <div
              className="card mt-4 bg-light shadow-lg rounded text-dark text-center"
              style={{ width: "18rem" }}
            >
              <div className="card-body">
                <h3>
                  <i className="fa fa-check" />
                </h3>
                <h3>Resolved</h3>
                <br />

                <CountUp duration={5} end={resolved} />

                <br />
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4 ">
            <div
              className="card mt-4 bg-primary-color navbar-shadow rounded text-white text-center"
              style={{ width: "18rem" }}
            >
              <div className="card-body">
                <h3>
                  <i className="fa fa-window-close" />
                </h3>
                <h3>Closed</h3>
                <br />
                <CountUp duration={5} end={closed} />
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Showcase;
