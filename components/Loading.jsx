export const Loading = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg z-50">
        <div className="animate-spin rounded-full border-t-4 border-b-4 border-purple-500 h-16 w-16"></div>
        <p className="ml-2 text-white">Loading...</p>
      </div>
    );
  };
  