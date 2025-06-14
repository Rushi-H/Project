import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatBubble from './components/chatBubble';
import ChatDialog from './components/chatDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom hooks for better state management
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [value, setStoredValue];
};

const useChatAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const sendMessage = useCallback(async (message, role = null) => {
    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message.trim(),
          role: role,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setConnectionStatus('connected');
      
      return {
        text: data.response,
        role: data.detected_role,
        confidence: data.confidence || null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      setConnectionStatus('error');
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.');
      } else {
        throw new Error(error.message || 'Failed to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendMessage, isLoading, connectionStatus };
};

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useLocalStorage('chatMessages', []);
  const [inputValue, setInputValue] = useState('');
  const [userRole, setUserRole] = useLocalStorage('userRole', null);
  const [chatSettings, setChatSettings] = useLocalStorage('chatSettings', {
    notifications: true,
    soundEnabled: true,
    theme: 'light'
  });
  
  const dialogRef = useRef(null);
  const { sendMessage, isLoading, connectionStatus } = useChatAPI();
  
  // Notification sound
  const playNotificationSound = useCallback(() => {
    if (chatSettings.soundEnabled) {
      const audio = new Audio('/notification.mp3'); // Add this file to public folder
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if sound fails
    }
  }, [chatSettings.soundEnabled]);

  // Auto-scroll and focus management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll on mobile
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target) && isOpen) {
        const chatBubbleElement = document.getElementById('chat-bubble');
        if (chatBubbleElement && !chatBubbleElement.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => toast.success('Connection restored!');
    const handleOffline = () => toast.error('Connection lost. Please check your internet.');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleChatDialog = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      // Add welcome message for first-time users
      if (messages.length === 0) {
        const welcomeMessage = {
          text: "👋 Welcome to Modern College Pune! I'm here to help you with admissions, courses, and general information. How can I assist you today?",
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, messages.length, setMessages]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleSendMessage = useCallback(async (customMessage) => {
    const messageToSend = customMessage !== undefined ? customMessage : inputValue;
    if (!messageToSend.trim()) return;

    const userMessage = {
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };


    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    try {
      const botResponse = await sendMessage(messageToSend, userRole);
      
      const botMessage = {
        text: botResponse.text,
        sender: 'bot',
        timestamp: botResponse.timestamp,
        role: botResponse.role,
        confidence: botResponse.confidence,
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Play notification sound for bot responses
      playNotificationSound();
      
      // Show toast for role detection
      if (botResponse.role && botResponse.role !== userRole) {
        toast.info(`Detected context: ${botResponse.role}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        text: error.message || 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [inputValue, userRole, sendMessage, setMessages, playNotificationSound]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChatHistory = useCallback(() => {
    setMessages([]);
    toast.info('Chat history cleared');
  }, [setMessages]);

  const exportChatHistory = useCallback(() => {
    const chatData = {
      messages,
      exportDate: new Date().toISOString(),
      userRole,
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Chat history exported!');
  }, [messages, userRole]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative"
      style={{
        backgroundImage: 'url(/image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay for better contrast */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      
      {/* Connection status indicator */}
      {connectionStatus === 'error' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          Connection Error
        </div>
      )}

      {/* Main content area - you can add your college website content here */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Modern College Pune</h1>
          <p className="text-lg text-gray-600">Excellence in Education Since 1959</p>
        </div>
      </div>

      {/* Chatbot UI */}
      <ChatBubble 
        isOpen={isOpen} 
        onClick={toggleChatDialog}
        hasUnreadMessages={false} // You can implement this feature
        connectionStatus={connectionStatus}
      />
      
      {isOpen && (
        <ChatDialog   
          ref={dialogRef}
          messages={messages}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          userRole={userRole}
          onRoleChange={setUserRole}
          onClearHistory={clearChatHistory}
          onExportHistory={exportChatHistory}
          chatSettings={chatSettings}
          onSettingsChange={setChatSettings}
          connectionStatus={connectionStatus}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={chatSettings.theme}
      />
    </div>
  );
}

export default App;