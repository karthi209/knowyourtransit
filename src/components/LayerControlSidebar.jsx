import React, { useState } from "react";

const LayerControlSidebar = ({ visibleLines, setVisibleLines, layerGroups, lineDetails, handleLineSelect }) => {
  const [dropdowns, setDropdowns] = useState({
    Metro: true, Suburban: true, MRTS: true, MTC: true,
  });

  const toggleDropdown = (groupName) => {
    setDropdowns(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleLineVisibility = (lineName) => {
    setVisibleLines(prev => ({ ...prev, [lineName]: !prev[lineName] }));
  };

  const toggleGroupVisibility = (groupName) => {
    const isGroupVisible = layerGroups[groupName].every(lineName => visibleLines[lineName]);
    setVisibleLines(prev => {
      const updatedVisibility = { ...prev };
      layerGroups[groupName].forEach(lineName => {
        updatedVisibility[lineName] = !isGroupVisible;
      });
      return updatedVisibility;
    });
  };

  return (
    <div
      style={{
        width: "250px",
        background: "#f8f9fa",
        padding: "10px",
        borderLeft: "1px solid #ccc",
      }}
    >
      <h5>Layer Control</h5>

      {Object.keys(layerGroups).map((groupName) => (
        <div key={groupName}>
          <h6
            style={{
              cursor: "pointer",
              color: "#007bff",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
            onClick={() => toggleDropdown(groupName)}
          >
            {groupName} {dropdowns[groupName] ? "▼" : "▶"}
          </h6>

          {dropdowns[groupName] && (
            <div style={{ marginLeft: "20px" }}>
              <label style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={layerGroups[groupName].every(
                    (lineName) => visibleLines[lineName]
                  )}
                  onChange={() => toggleGroupVisibility(groupName)}
                />
                {groupName}
              </label>

              {layerGroups[groupName].map((lineName) => (
                <label key={lineName} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={visibleLines[lineName]}
                    onChange={() => {
                      toggleLineVisibility(lineName);
                      handleLineSelect(lineName);
                    }}
                  />
                  {lineName}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayerControlSidebar;