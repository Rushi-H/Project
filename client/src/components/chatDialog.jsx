import { forwardRef, useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';

const PRESET_QUESTIONS_BY_ROLE = {
  student: [
    "How can I apply for admission?",
    "Where can I find course details?",
    "How can I access student login?",
    "How to check exam timetable or results?",
    "How can I access the library or e-resources?"
  ],
  teacher: [
    "How can teachers access staff login or portal?",
    "Where can I find faculty-related circulars or announcements?",
    "How can I participate in faculty development programs?"
  ],
  parent: [
    "How can parents track student performance?",
    "How do I contact a specific department or faculty?",
    "Is hostel facility available?"
  ],
  general: [
    "What is the official website of Modern College Pune?",
    "Where is Modern College located?",
    "How do I contact Modern College Pune?",
    "Who is the principal of Modern College Pune?"
  ]
};

const ChatDialog = forwardRef(({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading
}, ref) => {
  const [role, setRole] = useState(null);  // Track selected role

  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle selecting user role
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  // Handle sending preset question
  const handlePresetClick = (question) => {
    onSendMessage(question);
  };

  // Show preset questions based on role, or none if role not selected
  const presetQuestions = role ? PRESET_QUESTIONS_BY_ROLE[role] || [] : [];

  return (
    <div 
      ref={ref}
      className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-300"
    >
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 font-semibold text-lg">
        <h3>Chat with us</h3>
      </div>

      {/* Role selection */}
      {!role && (
        <div className="p-4 text-center border-b border-gray-200">
          <p className="mb-2 font-medium text-gray-700">Please select your role:</p>
          <div className="flex justify-center gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleRoleSelect('student')}
            >
              Student
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => handleRoleSelect('teacher')}
            >
              Teacher
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => handleRoleSelect('parent')}
            >
              Parent
            </button>
          </div>
        </div>
      )}

      {/* Preset Questions (shown only if role selected) */}
      {role && (
        <div className="p-3 flex flex-wrap gap-2 border-b border-gray-100 bg-blue-50 overflow-auto max-h-[120px]">
          {presetQuestions.map((q) => (
            <button
              key={q}
              className="bg-blue-100 text-blue-800 rounded px-3 py-1 text-sm hover:bg-blue-200 transition"
              onClick={() => handlePresetClick(q)}
              type="button"
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
          {/* Add a button to change role */}
          <button
            className="bg-red-100 text-red-700 rounded px-3 py-1 text-sm hover:bg-red-200 transition ml-auto"
            onClick={() => setRole(null)}
            type="button"
            disabled={isLoading}
          >
            Change Role
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3 text-base bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-4 text-base">
            <p>👋 Hi there! How can I help you today?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-3 rounded-lg break-words leading-relaxed shadow-sm ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white ml-auto rounded-br-none'
                  : 'bg-white text-gray-900 mr-auto rounded-bl-none border border-gray-200'
              }`}
              style={{ fontSize: '1rem' }}
            >
              {message.text}
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%] mr-auto rounded-bl-none flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 flex items-center bg-white">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gray-50"
          disabled={isLoading}
        />
        <button
          onClick={onSendMessage}
          disabled={inputValue.trim() === '' || isLoading}
          className={`ml-2 bg-blue-600 text-white p-3 rounded-full text-base ${
            inputValue.trim() === '' || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
});

export default ChatDialog;
