import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import "./companiesList.css";
import Loading from "./loading";
const CompaniesList = ({ companies, isLoading, onClick, isOpen }) => {
  let pair = [];
  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        scroll={"paper"}
        height="500px"
      >
        {isLoading && <Loading />}
        {!isLoading && (
          <React.Fragment>
            <DialogTitle id="form-dialog-title">
              <h3 className="modal-heading">Please select the company</h3>
            </DialogTitle>
            <DialogContent dividers={true}>
              <div className="d-flex flex-wrap">
                {companies.map(company => {
                  return (
                    <div style={{ width: "50%" }}>
                      <div
                        className="company rounded mr-1 mb-2"
                        onClick={() => {
                          onClick(company._id);
                        }}
                      >
                        {/* <i className="fa fa-plus"></i> */}
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </React.Fragment>
        )}
      </Dialog>
    </React.Fragment>
  );
};

export default CompaniesList;
