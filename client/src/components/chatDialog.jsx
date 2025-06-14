import { forwardRef, useRef, useEffect, useState } from 'react';
import { Send, Minimize2, RotateCcw, Download, Copy, ThumbsUp, ThumbsDown, Wifi, WifiOff, User, Bot } from 'lucide-react';
import { toast } from "react-toastify";


const PRESET_QUESTIONS_BY_ROLE = {
  student: [
    "How can I apply for admission?",
    "Where can I find course details?",
    "How can I access student login?",
    "How to check exam timetable or results?",
    "How can I access the library or e-resources?",
    "What are the fees for different courses?",
    "How do I get my transcripts?",
    "What scholarships are available?"
  ],
  teacher: [
    "How can teachers access staff login or portal?",
    "Where can I find faculty-related circulars?",
    "How can I participate in faculty development programs?",
    "How do I submit research papers?",
    "What are the teaching guidelines?",
    "How to access academic calendar?"
  ],
  parent: [
    "How can parents track student performance?",
    "How do I contact a specific department or faculty?",
    "Is hostel facility available?",
    "What are the visiting hours?",
    "How do I pay fees online?",
    "What safety measures are in place?"
  ],
  general: [
    "What is the official website of Modern College Pune?",
    "Where is Modern College located?",
    "How do I contact Modern College Pune?",
    "Who is the principal of Modern College Pune?",
    "What courses are offered?",
    "What are the college timings?"
  ]
};

const ChatDialog = forwardRef(({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  isTyping,
  connectionStatus,
  onClearChat,
  onExportChat
}, ref) => {
  const [role, setRole] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [feedback, setFeedback] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [role]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    toast.success(`Role selected: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`);
  };

  const handlePresetClick = (question) => {
    onSendMessage(question, role);
    setShowQuickReplies(false);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard!');
  };

  const handleFeedback = (messageIndex, type) => {
    setFeedback(prev => ({
      ...prev,
      [messageIndex]: type
    }));
    toast.success(`Thank you for your ${type === 'like' ? 'positive' : 'negative'} feedback!`);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const presetQuestions = role ? PRESET_QUESTIONS_BY_ROLE[role] || [] : [];

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div 
        ref={ref}
        className="fixed bottom-24 right-6 w-80 bg-white rounded-t-xl shadow-2xl border border-gray-200 z-40"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center cursor-pointer"
             onClick={handleMinimize}>
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">Modern College Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi size={16} className="text-green-300" />
            ) : (
              <WifiOff size={16} className="text-red-300" />
            )}
            <Minimize2 size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-40"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Modern College Assistant</h3>
              <div className="flex items-center gap-2 text-xs opacity-90">
                {connectionStatus === 'connected' ? (
                  <>
                    <Wifi size={12} />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearChat}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Clear Chat"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onExportChat}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Export Chat"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleMinimize}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Minimize"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Role selection */}
      {!role && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <p className="mb-3 font-medium text-gray-700 text-center">Please select your role to get personalized assistance:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(PRESET_QUESTIONS_BY_ROLE).map((roleType) => (
              <button
                key={roleType}
                className="bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white text-gray-700 px-4 py-3 rounded-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md font-medium"
                onClick={() => handleRoleSelect(roleType)}
              >
                {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick replies */}
      {role && showQuickReplies && (
        <div className="p-3 bg-gray-50 border-b border-gray-100 max-h-32 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Quick Questions:</span>
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setRole(null)}
            >
              Change Role
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presetQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                className="bg-white hover:bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-full border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                onClick={() => handlePresetClick(question)}
                disabled={isLoading}
              >
                {question.length > 30 ? question.substring(0, 30) + '...' : question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Message bubble */}
              <div
                className={`p-4 rounded-2xl shadow-sm relative ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                    : message.isError
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                    : message.isWelcome
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-blue-200 rounded-bl-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                
                {/* Message metadata */}
                <div className={`mt-2 flex items-center justify-between text-xs ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.detectedRole && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {message.detectedRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Message actions */}
              {message.sender === 'bot' && !message.isWelcome && (
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyMessage(message.text)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback(index, 'like')}
                    className={`p-1 transition-colors ${
                      feedback[index] === 'like' 
                        ? 'text-green-600' 
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback(index, 'dislike')}
                    className={`p-1 transition-colors ${
                      feedback[index] === 'dislike' 
                        ? 'text-red-600' 
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              message.sender === 'user' ? 'bg-blue-600 order-1 ml-2' : 'bg-purple-600 order-2 mr-2'
            }`}>
              {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-600 shadow-sm">
              Typing<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={isLoading ? 'Waiting for response...' : 'Type your message'}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={() => onSendMessage(inputValue, role)}
            disabled={isLoading || inputValue.trim() === ''}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition disabled:opacity-50"
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ChatDialog;
