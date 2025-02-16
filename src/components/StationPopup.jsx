import React from "react";

const StationPopup = ({ selectedStation }) => {
  if (!selectedStation) return null;

  return (
    <div
      className="station-popup bg-white p-4 rounded-lg shadow-md min-w-[200px] max-w-[300px] z-10"
      style={{
        pointerEvents: "auto",
        fontSize: "13px",
      }}
    >
      <h5 className="text-lg font-semibold">{selectedStation.name}</h5>
      <h6 className="text-md text-gray-600">{selectedStation.name_ta}</h6>
      <p className="mt-2">Station Code: {selectedStation.id}</p>
      <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
        {selectedStation.line}
      </span>
    </div>
  );
};

export default StationPopup;
