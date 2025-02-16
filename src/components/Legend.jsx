const Legend = () => (
    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md">
      <h3 className="text-sm font-semibold">Legend</h3>
      <div className="flex items-center"><span className="w-4 h-4 bg-red-500 inline-block mr-2"></span> Metro Lines</div>
      <div className="flex items-center"><span className="w-4 h-4 bg-blue-500 inline-block mr-2"></span> Stations</div>
      <div className="flex items-center"><span className="w-4 h-4 bg-gray-500 inline-block mr-2"></span> Walkways</div>
    </div>
  );
  
  export default Legend;
  