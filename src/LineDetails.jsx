import React from "react";

const LineDetails = ({ selectedLine }) => {
  if (!selectedLine) return null;

  return (
    <div style={{ width: "200px", padding: "10px", background: "#f0f0f0" }}>
      <h4>Line Details</h4>
      <p><strong>Name:</strong> {selectedLine.name}</p>
      <p><strong>Description:</strong> {selectedLine.description}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default LineDetails;