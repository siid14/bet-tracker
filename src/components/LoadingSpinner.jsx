import React from "react";

const LoadingSpinner = ({ height = "250px", message = "Loading..." }) => {
  return (
    <div className="chart-loading" style={{ height }}>
      <div className="loading-spinner-container">
        <div className="loading-indicator">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
