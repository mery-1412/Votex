export function Popup({ message, isOpen, action, onClose }) {
    if (!isOpen) return null; // Hide if not open
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-60"> 
        <div className="bg-[#3A2663] p-6 rounded-lg shadow-lg w-80 max-w-full text-center relative animate-fadeIn overflow-hidden">
          
          <p className="text-lg font-medium text-white mb-4 break-words">
            {message}
          </p>
          
          <button 
            onClick={onClose} 
            className="gradient-border-button py-2 px-4 text-white rounded-md"
          >
            {action}
          </button>
        </div>
      </div>
    );
  }
  