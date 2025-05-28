import { MapProvider } from "./context/MapContext";
import MapComponent from "./components/MapComponent";

function App() {
  return (
    <MapProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="relative h-screen w-screen overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-blue-400/10 blur-[100px] rotate-12" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-[100px] -rotate-12" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/60 via-gray-900/80 to-gray-950" />
          </div>
          <div className="relative z-10 h-full">
            <MapComponent />
          </div>
        </div>
      </div>
    </MapProvider>
  );
}

export default App;
