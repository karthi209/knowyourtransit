import { useState } from "react";

const SidePanel = ({ isOpen, details, onClose }) => {
  return (
    <div className={`fixed right-0 top-0 h-full w-64 bg-white shadow-md transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <button onClick={onClose} className="p-2 bg-red-500 text-white">Close</button>
      <div className="p-4">
        {details ? <pre>{JSON.stringify(details, null, 2)}</pre> : <p>No selection</p>}
      </div>
    </div>
  );
};

export default SidePanel;
