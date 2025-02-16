import { useMapContext } from "../context/MapContext";

function LayerControl() {
  const { visibleLines, setVisibleLines } = useMapContext();

  if (!visibleLines) {
    return <div>Loading...</div>; // Prevents crash while context loads
  }

  const toggleLineVisibility = (lineName) => {
    setVisibleLines((prev) => ({
      ...prev,
      [lineName]: !prev?.[lineName], // Optional chaining to prevent errors
    }));
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg m-4">
      <h4 className="text-lg font-semibold mb-3">Layer Control</h4>
      {Object.keys(visibleLines ?? {}).map((lineName) => (
        <div key={lineName} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={lineName}
            checked={visibleLines?.[lineName] ?? false}
            onChange={() => toggleLineVisibility(lineName)}
            className="mr-2"
          />
          <label htmlFor={lineName} className="text-sm">
            {lineName}
          </label>
        </div>
      ))}
    </div>
  );
}

export default LayerControl;
