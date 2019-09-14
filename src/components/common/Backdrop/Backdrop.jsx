import React from "react";
import styles from "./Backdrop.module.css";

const backdrop = props => {
  return props.show ? (
    <div className={styles.Backdrop} onClick={props.clicked} />
  ) : null;
};

export default backdrop;
