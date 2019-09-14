import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import "./../admin/usersManagement/categories.css";
import "./../admin/usersManagement/categories.css";
import { DialogActions } from "@material-ui/core";
const CategoriesList = ({
  categories,
  isLoading,
  onClick,
  isOpen,
  onClose,
  onBack
}) => {
  let pair = [];
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
              Please select the Category
            </DialogTitle>
            <DialogContent dividers={true}>
              <div>
                <div className="container" style={{ height: "450px" }}>
                  {categories.map((category, index) => {
                    let cat = (
                      <div className="category col p-0 d-flex m-1">
                        <option
                          key={category._id}
                          className="w-100"
                          onClick={onClick}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      </div>
                    );

                    if (pair.length < 2) {
                      pair.push(cat);
                    }
                    if (pair.length === 2) {
                      const categoriesRow = (
                        <div key={category._id + "1"} className="row">
                          {pair[0]}
                          {pair[1]}
                        </div>
                      );
                      pair.length = 0;

                      return categoriesRow;
                    }
                    if (categories.length - 1 === index) {
                      return (
                        <div key={category._id + "2"} className="row">
                          {pair[0]}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <button className="btn btn-primary" onClick={onClose}>
                close
              </button>

              {categories[0] && categories[0].parentCategory && (
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

export default CategoriesList;
