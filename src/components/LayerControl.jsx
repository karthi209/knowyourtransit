import React from "react";

const LayerControl = ({ visibleLines, setVisibleLines, style }) => {
  const toggleLineVisibility = (lineName) => {
    setVisibleLines((prev) => ({
      ...prev,
      [lineName]: !prev[lineName],
    }));
  };

  return (
    <div style={style}>
      <h4>Layer Control</h4>
      {Object.keys(visibleLines).map((lineName) => (
        <div key={lineName}>
          <input
            type="checkbox"
            checked={visibleLines[lineName]}
            onChange={() => toggleLineVisibility(lineName)}
          />
          <label>{lineName}</label>
        </div>
      ))}
    </div>
  );
};

export default LayerControl;