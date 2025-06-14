import { MessageSquare, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const ChatBubble = ({ 
  isOpen, 
  onClick, 
  hasUnreadMessages = false, 
  connectionStatus = 'connected' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // Animate bubble on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('animate-bounce-once');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show tooltip after delay
  useEffect(() => {
    let timer;
    if (isHovered) {
      timer = setTimeout(() => setShowTooltip(true), 800);
    } else {
      setShowTooltip(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi size={12} className="text-white" />;
      case 'error': return <WifiOff size={12} className="text-white" />;
      default: return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap transform transition-all duration-300 opacity-100 translate-y-0">
          Need help? Chat with us!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Main chat bubble */}
      <div
        id="chat-bubble"
        className={`
          relative w-14 h-14 rounded-full shadow-lg cursor-pointer 
          transition-all duration-300 ease-out select-none
          ${isOpen 
            ? 'scale-90 bg-gray-600 hover:bg-gray-700' 
            : 'scale-100 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
          }
          ${isHovered ? 'shadow-xl scale-105' : 'shadow-lg'}
          ${animationClass}
          ${hasUnreadMessages ? 'animate-pulse' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {/* Background glow effect */}
        <div className={`
          absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 
          opacity-0 transition-opacity duration-300 blur-lg scale-110
          ${isHovered ? 'opacity-30' : ''}
        `}></div>

        {/* Main icon */}
        <div className="relative w-full h-full flex items-center justify-center text-white">
          {isOpen ? (
            <div className="transform transition-transform duration-200 rotate-45">
              <MessageSquare size={24} />
            </div>
          ) : (
            <div className="transform transition-transform duration-200">
              <MessageCircle size={24} />
            </div>
          )}
        </div>

        {/* Unread messages indicator */}
        {hasUnreadMessages && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        )}

        {/* Connection status indicator */}
        <div className={`
          absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white
          flex items-center justify-center transition-all duration-300
          ${getStatusColor()}
        `}>
          {getStatusIcon()}
        </div>

        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className={`
            absolute inset-0 bg-white opacity-0 scale-0 rounded-full
            transition-all duration-300 ease-out
            ${isHovered ? 'opacity-10 scale-100' : ''}
          `}></div>
        </div>
      </div>

      {/* Floating particles effect (optional) */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 bg-blue-400 rounded-full opacity-60
                animate-float-${i + 1}
              `}
              style={{
                left: `${20 + i * 15}px`,
                top: `${10 + i * 10}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s',
              }}
            ></div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-15px) translateX(-10px); opacity: 1; }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-25px) translateX(5px); opacity: 1; }
        }
        
        .animate-bounce-once {
          animation: bounce-once 1s ease-out;
        }
        
        .animate-float-1 {
          animation: float-1 2s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 2s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatBubble;