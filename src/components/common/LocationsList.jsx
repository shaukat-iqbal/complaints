import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogActions } from "@material-ui/core";

import "./../admin/usersManagement/categories.css";
const LocationsList = ({
  locations,
  isLoading,
  onClick,
  isOpen,
  onClose,
  onBack,
  onTick,
  isCrud,
  parentLocationName
}) => {
  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        scroll={"paper"}
        height="500px"
      >
        {isLoading && (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {!isLoading && (
          <React.Fragment>
            <DialogTitle id="form-dialog-title">
              {parentLocationName}
            </DialogTitle>
            <DialogContent dividers={true}>
              <div>
                <div className="d-flex flex-wrap ">
                  {locations.map(category => {
                    return (
                      <div className="mr-1 mb-2" style={{ width: "49%" }}>
                        <div className="category ">
                          <option
                            key={category._id}
                            onClick={onClick}
                            value={category._id}
                          >
                            {category.name}
                          </option>
                          {isCrud && (
                            <button
                              className="btn btn-light justify-content-end align-self-end"
                              onClick={() => onTick(category._id)}
                            >
                              <i className="fa fa-check"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>

              {locations.length > 0 && locations[0].parentLocation && (
                <button className="btn btn-primary" onClick={onBack}>
                  Back
                </button>
              )}
            </DialogActions>
          </React.Fragment>
        )}
      </Dialog>
    </React.Fragment>
  );
};

export default LocationsList;
