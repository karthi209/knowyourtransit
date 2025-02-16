// LineDetails.jsx
import { useMapContext } from "../context/MapContext"

function LineDetails() {
  const { selectedLine } = useMapContext()

  if (!selectedLine) return null

  return (
    <div className="p-4 bg-white shadow-md rounded-lg m-4">
      <h4 className="text-lg font-semibold mb-3">Line Details</h4>
      <p className="mb-2">
        <strong>Name:</strong> {selectedLine.name}
      </p>
      <p className="mb-2">
        <strong>Description:</strong> {selectedLine.description}
      </p>
      {selectedLine.length && (
        <p className="mb-2">
          <strong>Length:</strong> {selectedLine.length} km
        </p>
      )}
      {selectedLine.stations && (
        <div>
          <strong>Stations:</strong>
          <ul className="mt-2 list-disc list-inside">
            {selectedLine.stations.map((station, index) => (
              <li key={index} className="text-sm text-gray-600">
                {station}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default LineDetails