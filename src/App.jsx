import { MapProvider } from "./context/MapContext";
import MapComponent from "./components/MapComponent";

function App() {
  return (
    <MapProvider>
      <div className="flex h-screen w-screen relative overflow-hidden">
        <div className="flex-1 relative">
          <MapComponent />
        </div>
      </div>
    </MapProvider>
  );
}

export default App;
