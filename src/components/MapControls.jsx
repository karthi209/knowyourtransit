import { useContext } from "react";
import { MapContext } from "../context/MapContext";
import { ZoomIn, ZoomOut, Home } from "lucide-react"; // Icons

const MapControls = () => {
  const { map } = useContext(MapContext);

  const zoomIn = () => map.getView().setZoom(map.getView().getZoom() + 1);
  const zoomOut = () => map.getView().setZoom(map.getView().getZoom() - 1);
  const resetView = () => map.getView().setCenter([0, 0]);

  return (
    <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md">
      <button onClick={zoomIn} className="m-1 p-2 bg-gray-200 rounded"><ZoomIn /></button>
      <button onClick={zoomOut} className="m-1 p-2 bg-gray-200 rounded"><ZoomOut /></button>
      <button onClick={resetView} className="m-1 p-2 bg-gray-200 rounded"><Home /></button>
    </div>
  );
};

export default MapControls;
