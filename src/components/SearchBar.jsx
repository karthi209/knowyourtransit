import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      placeholder="Search for a station or line..."
      className="w-full p-2 border border-gray-300 rounded"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
    />
  );
};

export default SearchBar;
