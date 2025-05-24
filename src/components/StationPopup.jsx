import React from "react";
import { ChevronRightIcon } from '@heroicons/react/solid'; // Import icon from Heroicons

const StationPopup = ({ selectedStation, onMoreDetailsClick }) => {
  if (!selectedStation) return null;

  // Example color mapping for different lines
  const lineColors = {
    "Blue Line": "bg-[#3280c3]",  // Blue for Blue Line
    "Green Line": "bg-[#52b747]",  // Green for Green Line
    "Red Line": "bg-[#e50000]",  // Red for Red Line
    "Orange Line": "bg-[#f76300]",  // Orange for Orange Line
    "Purple Line": "bg-[#790079]",  // Purple for Purple Line
    "MRTS": "bg-[#008080]",  // Teal for MRTS Line
    "South Line": "bg-[#a9a9a9]",  // Gray for South Line
    "West Line": "bg-[#0ddd22]",  // Lime Green for West Line
    "North Line": "bg-[#a0522d]",  // Brown for North Line
  };

  // Function to get color for each line
  const getLineColor = (line) => {
    return lineColors[line] || "bg-gray-500"; // Default to gray if no specific color is defined
  };

  // Split the line string into an array (if it's not already)
  const lines = selectedStation.line ? selectedStation.line.split(',') : [];

  // Conditionally choose the logo based on network
  const getLogo = (network) => {
    switch (network) {
      case "Metro":
        return "/metro.svg";
      case "MRTS":
      case "Suburban":
        return "/railway.svg";
      default:
        return "/metro.svg"; // Default to metro logo
    }
  };

  // Get icons for parking, accessibility, and escalator based on availability
  const getFeatureIcon = (type, available) => {
    if (available === "yes") {
      switch (type) {
        case 'parking':
          return "/parking.svg";
        case 'accessible':
          return "/accessible.svg";
        case 'escalator':
          return "/escalator.svg";
        default:
          return null;
      }
    } else {
      switch (type) {
        case 'parking':
          return "/noparking.svg";
        case 'accessible':
          return "/noaccessibility.svg";
        case 'escalator':
          return "/noescalator.svg";
        default:
          return null;
      }
    }
  };

  // Function to get the type icon (underground, elevated, grade)
  const getTypeIcon = (type) => {
    switch (type) {
      case 'underground':
        return "/underground.svg"; // Underground icon
      case 'elevated':
        return "/elevated.svg"; // Elevated icon
      case 'grade':
        return "/grade.svg"; // Grade icon
      default:
        return null; // Default case
    }
  };

  return (
    <div
      className="station-popup bg-white shadow-lg rounded-lg p-5 pr-7 pt-6 max-w-fit"
      style={{
        pointerEvents: "auto",
        fontSize: "13px",
        display: selectedStation ? "inline-block" : "none",
        width: "max-content",
      }}      
    >
      {/* Logo and Station Name */}
      <div className="flex items-start gap-3">
        <img
          src={getLogo(selectedStation.network)}
          alt="Station Logo"
          className="w-10 h-10 mt-1 mr-1 flex-shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 break-words">
            {selectedStation.name}
          </h3>
          <h6 className="text-md text-gray-600 break-words">
            {selectedStation.name_ta}
          </h6>
        </div>
      </div>

      {/* Station ID with parking, accessibility, escalator, and type icons */}
      <p className="ml-12 pl-1 mt-2 pt-1 pb-2 flex items-center">
        {/* Conditionally show the parking icon */}
        <img
          src={getFeatureIcon('parking', selectedStation.parking)} // Call the helper function
          alt={selectedStation.parking === "yes" ? "Parking Available" : "No Parking"}
          className="w-5 h-5 mr-2"
          style={{ filter: "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)" }} // Blue tint
        />

        {/* Conditionally show the accessibility icon */}
        <img
          src={getFeatureIcon('accessible', selectedStation.accessible)} // Call the helper function
          alt={selectedStation.accessible === "yes" ? "Accessibility Available" : "No Accessibility"}
          className="w-6 h-6 mr-2"
          style={{ filter: "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)" }} // Blue tint
        />

        {/* Conditionally show the escalator icon */}
        <img
          src={getFeatureIcon('escalator', selectedStation.escalator)} // Call the helper function
          alt={selectedStation.escalator === "yes" ? "Escalator Available" : "No Escalator"}
          className="w-6 h-6 mr-2"
          style={{ filter: "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)" }} // Blue tint
        />

        {/* Conditionally show the station type icon */}
        <img
          src={getTypeIcon(selectedStation.type)} // Call the helper function for type icon
          alt={selectedStation.type} // Alt text for accessibility
          className="w-4 h-4 mr-2"
          style={{ filter: "invert(36%) sepia(88%) saturate(2083%) hue-rotate(190deg) brightness(97%) contrast(103%)" }} // Blue tint
        />
      </p>

      <div className="ml-12 pl-1 mt-2 flex flex-wrap gap-2">
        {lines.length > 0 ? (
          lines.map((line, index) => (
            <span
              key={index}
              className={`inline-block text-xs px-2.5 py-2 rounded-lg text-white ${getLineColor(line.trim())} whitespace-nowrap`}
            >
              {line.trim()}
            </span>
          ))
        ) : (
          <span
            className={`inline-block text-xs px-2.5 py-2 rounded-lg text-white ${getLineColor(selectedStation.line)} whitespace-nowrap`}
          >
            {selectedStation.line}
          </span>
        )}
      </div>

      {/* More Details Icon Button */}
      <div className="ml-12 pl-1 mt-4 flex justify-start">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={onMoreDetailsClick} // Assuming you will pass a function to handle the details logic
        >
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default StationPopup;

