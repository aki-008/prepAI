import React from "react";
import { History, RefreshCw, Plus, Upload, Menu, X, Send, MessageSquare } from "lucide-react";

// Placeholder data for the long text at the bottom (PDF Highlighting)
const samplePDFHighlight = `So far, we've applied log() to the softmax output, but have neither explained what "log" is nor why we use it. We do this for one key reason. In deep learning and optimization, where derivatives, gradients, and optimizations suffice it to say that the log function has some desirable properties. Log is short for logarithm and is defined as the solution to: "The integer a must be taken of the base b so that the equation b^x = a can be solved with a log function which evaluates log_b(a)." This property of the log function is especially beneficial where e (Euler's number or ≈ 2.71828) is used in the base (where 10 is in the example). The logarithm with e as the base is referred to as the natural logarithm and doesn't use the 'log_e' - you may also see this written as ln(x) or log(x)`;

const Notes: React.FC = () => {
  // State to manage the left sidebar's open/close status
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  // NEW STATE: State to manage the right chat panel's open/close status
  const [isChatOpen, setIsChatOpen] = React.useState(true);

  // Toggle function for the left sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Toggle function for the right chat panel
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    // Outer container: Black background, full height, flex layout
    <div className="flex bg-black h-screen overflow-hidden">
      
      {/* 1. Left Sidebar: My Notes (Toggleable) */}
      <div
        className={`
          h-screen flex-shrink-0 transition-all duration-300 ease-in-out
          bg-gray-900 border-r border-gray-700 flex flex-col gap-4 shadow-2xl
          ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}
        `}
      >
        {isSidebarOpen && (
          <>
            <h3 className="text-xl font-bold text-white mb-2 border-b border-gray-700 pb-2">
              My Notes
            </h3>

            {/* Navigation/Action Buttons */}
            <button
              className="flex items-center gap-3 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-150 font-semibold whitespace-nowrap"
              aria-label="Create New Note"
            >
              <Plus size={20} />
              New Notes
            </button>

            <button
              className="flex items-center gap-3 w-full text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition duration-150 whitespace-nowrap"
              aria-label="Upload Notes"
            >
              <Upload size={20} />
              Upload
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                <p className="text-sm text-gray-400">History</p>
                <div className="text-gray-200 bg-gray-700 p-2 rounded-md cursor-pointer hover:bg-gray-600">notes.pdf</div>
                <div className="text-gray-200 p-2 rounded-md cursor-pointer hover:bg-gray-600">notes2.pdf</div>
                <div className="text-gray-200 p-2 rounded-md cursor-pointer hover:bg-gray-600">notes3.pdf</div>
            </div>
          </>
        )}
      </div>
      
      {/* 2. Middle & Right Columns Container */}
      <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content (PDF Viewer & Highlighting) */}
          <div className="flex flex-col flex-1 p-6 overflow-y-auto">
              
              {/* Top Header/Toggle */}
              <header className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                      {/* Left Sidebar Toggle Button */}
                      <button
                          onClick={toggleSidebar}
                          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                          aria-label={isSidebarOpen ? "Close Left Sidebar" : "Open Left Sidebar"}
                      >
                          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                      </button>
                      <h2 className="text-2xl font-extrabold text-white">Notes Page / PDF Viewer</h2>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Right Chat Toggle Button (Visible only when chat is CLOSED) */}
                    {!isChatOpen && (
                        <button
                            onClick={toggleChat}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150 font-medium shadow-md"
                            aria-label="Open AI Chat"
                        >
                            <MessageSquare size={18} />
                            AI Chat
                        </button>
                    )}
                    
                    {/* Top Right Utility (e.g., Generate New Notes) */}
                    <button
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150 font-medium shadow-md"
                        aria-label="refresh notes"
                    >
                        <RefreshCw size={18} />
                        Refresh Notes
                    </button>
                  </div>
              </header>

              {/* PDF Viewer Area */}
              <div className="flex-1 bg-gray-700 rounded-xl shadow-inner border-2 border-gray-600 mb-6 p-4 flex-col items-center justify-center">
                  <p className="text-white text-xl font-medium">PDF View</p>
                  <p className="text-white text-xl font-medium">{samplePDFHighlight}</p>
              </div>

              

          </div>
          
          {/* 3. Right Chat Panel (Toggleable) */}
          <div
             className={`
                flex flex-col bg-gray-900 border-l border-gray-700 p-4 flex-shrink-0 transition-all duration-300 ease-in-out
                ${isChatOpen ? 'w-80' : 'w-0 p-0 overflow-hidden'}
             `}
          >
            {isChatOpen && (
                <>
                    <header className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 className="text-xl font-bold text-white">
                            Chat
                        </h3>
                        {/* Close button for the chat panel */}
                        <button
                            onClick={toggleChat}
                            className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150"
                            aria-label="Close Chat Panel"
                        >
                            <X size={20} />
                        </button>
                    </header>
                    
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        <p className="text-gray-400 text-sm">AI to chat with notes</p>
                        {/* Mock Chat Messages */}
                        <div className="flex justify-end">
                            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%]">
                                What are the key concepts on this page?
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-gray-700 text-white p-3 rounded-lg max-w-[80%]">
                                The key concepts are the definition of the $\\log$ function and why it is used in deep learning and optimization due to its desirable properties for derivatives and gradients.
                            </div>
                        </div>
                    </div>
                    
                    {/* Chat Input Area */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Type here..."
                            className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition duration-150"
                            aria-label="Send Message"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </>
            )}
          </div>
          
      </div>
      
    </div>
  );
};

export default Notes;