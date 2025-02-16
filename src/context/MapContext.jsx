import { createContext, useContext, useState } from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  const [showBuffer, setShowBuffer] = useState(false); // Buffer toggle state

  return (
    <MapContext.Provider value={{ showBuffer, setShowBuffer }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  return useContext(MapContext);
}
