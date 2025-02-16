// src/components/BufferToggle.jsx
import { useMapContext } from "../context/MapContext"

function BufferToggle() {
  const { showBuffer, setShowBuffer } = useMapContext()
  
  return (
    <button 
      onClick={() => setShowBuffer(!showBuffer)}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {showBuffer ? "Hide Buffer" : "View Buffer"}
    </button>
  )
}

export default BufferToggle