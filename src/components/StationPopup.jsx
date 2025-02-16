import { ChevronRightIcon } from '@heroicons/react/solid'; // Import icon from Heroicons

const StationPopup = ({ selectedStation, children }) => {
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
    if (network === "Metro") {
      return "/metro.svg"; // Metro logo
    } else if (network === "MRTS" || network === "Suburban") {
      return "/railway.svg"; // Railways logo
    }
    return "/metro.svg"; // Default logo if no condition matches
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

  return (
    <div
      // In StationPopup
      className="station-popup bg-white p-1.5 rounded-lg max-w-[1000px] z-10"
      style={{
        pointerEvents: "auto",
        fontSize: "14px",
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Logo and Station Name */}
      <div className="flex items-center mb-2">
        <img
          src={getLogo(selectedStation.network)}  // Conditionally render the logo based on network
          alt="Station Logo"
          className="w-6 h-6 mr-2 mt-1"  // Adjust size as needed
        />
        <h3 className="text-lg font-semibold whitespace-nowrap mt-1">{selectedStation.name}</h3>
      </div>

      <h6 className="text-md text-gray-600">{selectedStation.name_ta}</h6>

      {/* Station ID with parking and accessibility icons */}
      <p className="mt-2 pt-1 pb-2 flex items-center">
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
      </p>

      {/* Display multiple lines with individual colors in separate boxes */}
      <div className="mt-2 flex flex-wrap gap-2">
        {lines.length > 0 ? (
          lines.map((line, index) => (
            <span
              key={index}
              className={`inline-block text-xs px-2.5 py-2 rounded-lg text-white ${getLineColor(line.trim())} whitespace-nowrap`}
            >
              {line.trim()} {/* Use trim to remove extra spaces around the line name */}
            </span>
          ))
        ) : (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-white ${getLineColor(selectedStation.line)} whitespace-nowrap`}
          >
            {selectedStation.line}
          </span>
        )}
      </div>

      {/* More Details Icon Button */}
      <div className="mt-3 flex justify-center">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={children} // Assuming you will pass a function to handle the details logic
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default StationPopup;
