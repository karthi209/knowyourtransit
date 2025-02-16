import { MapProvider } from "./context/MapContext";
import MapComponent from "./components/MapComponent";
import LayerControl from "./components/LayerControl";
import LineDetails from "./components/LineDetails";
import SearchBar from "./components/SearchBar"; // Ensure this file exists
import BufferToggle from "./components/BufferToggle"; // Ensure this file exists
import SidePanel from "./components/SidePanel"; // Ensure this file exists

function App() {
  return (
    <MapProvider>
      <div className="flex h-screen w-screen relative overflow-hidden">
        <div className="flex-1 relative">
          <MapComponent />
        </div>

        {/* UI Panel for controls */}
        <div className="absolute top-0 right-0 z-50 bg-white shadow-lg p-4 space-y-4">
          <SearchBar />  {/* Add search bar */}
          <LayerControl />
          <LineDetails />
          <BufferToggle />  {/* Add buffer button */}
        </div>

        {/* Side panel for additional details */}
        <SidePanel />  {/* Add side panel */}
      </div>
    </MapProvider>
  );
}

export default App;
