import React from "react";
import { FileText, History, RefreshCw, Plus, Download, Upload, Save, Star, Menu, X } from "lucide-react";

// Placeholder data for the Summary/Important Parts section
const sampleSummary = [
  "DP weakness identified. Must solve 10 hard DP problems this week.",
  "Crucial to articulate Time/Space Complexity for every solution.",
  "Practice conversational pacing to reduce filler words.",
];

const Notes: React.FC = () => {
  // State for the notes content
  const [notesContent, setNotesContent] = React.useState(
    `Goal: Focus on Dynamic Programming and explanation clarity.\n\nKey DP Concepts to review:\n1. Overlapping Subproblems\n2. Optimal Substructure\n3. Memoization vs. Tabulation\n\nInterview Explanation Focus:\n1. State the approach (e.g., "I will use DP with memoization").\n2. Clearly define the state/subproblem (e.g., "dp[i] represents...").\n3. State the base case(s).\n4. Define the recurrence relation.\n5. Analyze Time/Space Complexity (O(n)).\n\n*Self-Reminder: Use fewer 'um's and 'like's.*`
  );

  // NEW STATE: State to manage the sidebar's open/close status
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // A function to simulate saving the notes (placeholder)
  const handleSave = () => {
    alert("Notes Saved!");
    // In a real app, you would call an API here
  };

  return (
    // Ensure the overall container is flex and full viewport height
    <div className="flex bg-black h-screen overflow-hidden">
      
      {/* 1. Left Sidebar: Navigation & Utility (New, History, Upload) */}
      <div
        className={`
          // Full height and transition for sliding
          h-screen flex-shrink-0 transition-all duration-300 ease-in-out
          bg-gray-800 flex flex-col gap-4 shadow-xl
          ${isSidebarOpen ? 'w-56 p-4' : 'w-0 p-0 overflow-hidden'} // Transition controls width and padding
        `}
      >
        {isSidebarOpen && ( // Only show content when open
          <>
            <h3 className="text-xl font-bold text-white mb-2 border-b border-gray-700 pb-2">My Notes</h3>

            <button
              className="flex items-center gap-3 w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition duration-150 font-semibold whitespace-nowrap"
              aria-label="Create New Note"
            >
              <Plus size={20} />
              New Note
            </button>

            <button
              className="flex items-center gap-3 w-full text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-700 hover:text-white transition duration-150 whitespace-nowrap"
              aria-label="Upload Notes"
            >
              <Upload size={20} />
              Upload
            </button>

            <button
              className="flex items-center gap-3 w-full text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-700 hover:text-white transition duration-150 whitespace-nowrap"
              aria-label="View History"
            >
              <History size={20} />
              History
            </button>
          </>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto"> {/* Allow main content to scroll */}
        
        <header className="flex justify-between items-center mb-6">
          {/* Toggle Button for Sidebar - Moved to the header of the main content */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
              aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-4xl font-extrabold text-white"> My Prep Notes</h2>
          </div>

          {/* Top Right Actions (Save, Rephrase, Download) */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-150 font-medium shadow-md"
              aria-label="Save Current Note"
            >
              <Save size={18} />
              Save
            </button>

            <button
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-150"
              aria-label="Rephrase Selected Text"
            >
              <RefreshCw size={18} />
              Rephrase
            </button>

            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150"
              aria-label="Download Notes"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </header>

        {/* Note Editor and Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Middle Section: Notes Text Area (Takes 2/3 width on large screens) */}
          <div className="md:col-span-2">
            <p className="text-white mb-2 font-medium">Current Note: Dynamic Programming & Clarity</p>
            <textarea
              className="w-full h-[600px] p-6 text-lg border-2 bg-white border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 resize-none font-mono leading-relaxed"
              placeholder="Write your notes here..."
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
            ></textarea>
          </div>

          {/* Right Section: Summary/Important Parts (Takes 1/3 width) */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <Star className="text-yellow-500" size={20} />
                AI Summary & Key Takeaways
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This section extracts or highlights the most important parts of your current note or feedback.
              </p>
              <ul className="space-y-3">
                {sampleSummary.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-yellow-500 font-extrabold text-lg">•</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className="mt-6 flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-150 text-sm w-full justify-center"
                aria-label="Generate Summary"
              >
                <FileText size={16} />
                Generate Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;