
export const Popup = ({ message, isOpen, action, onClose, onConfirm }) => {
    if (!isOpen) return null; // Don't render if popup is closed
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-60">
        <div className="bg-[#3A2663] p-6 rounded-lg shadow-lg w-80 max-w-full text-center relative animate-fadeIn overflow-hidden">
          <p className="text-lg font-medium text-white mb-6 break-words">
            {message}
          </p>
  
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-[#B342FF] hover:bg-[#9e2ce0] text-white px-4 py-2 rounded transition"
            >
              {action || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Popup;

  