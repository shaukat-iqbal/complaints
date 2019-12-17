import React from "react";
import uuid from "uuid";

const RootSideBar = ({ items, onCheck, checkedItems }) => {
  return (
    <>
      {items.length > 0 ? (
        <div
          className="border border-light  rounded-lg  ml-1"
          style={{
            //     backgroundColor: "#FDFDFD",
            //     marginTop: "35px",
            maxHeight: "400px",
            overflow: "auto"
          }}
        >
          <div className="p-2 bg-primary text-white rounded-top">
            <strong>Root Items</strong>
          </div>

          <ul className="list-group">
            {items.map(item => {
              return (
                <li className="list-group-item form-check p-2 " key={uuid()}>
                  <input
                    className="d-inline-block mr-2 "
                    type="checkbox"
                    checked={checkedItems[item._id]}
                    onClick={e => onCheck(e)}
                    name={item._id}
                    key={uuid()}
                  />
                  <label className="form-check-label d-inline-block" htmlFor="">
                    {item.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
};

export default RootSideBar;
