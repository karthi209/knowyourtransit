const LoadingIndicator = ({ isLoading }) => (
    isLoading ? (
      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
        <div className="loader">Loading...</div>
      </div>
    ) : null
  );
  
  export default LoadingIndicator;
  