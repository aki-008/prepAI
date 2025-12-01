import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Upload,
  Menu,
  X,
  Send,
  Loader2,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  fetchNotes,
  uploadNote,
  fetchNoteBlob,
  createChatSession,
  streamChatRequest,
  fetchChatHistory,
  fetchSessions, // ✅ Import this
  type Note,
  type ChatMessage,
} from "../api/notesService";

const Notes: React.FC = () => {
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Resizable Chat State
  const [chatWidth, setChatWidth] = useState(450); // Default width
  const [isResizing, setIsResizing] = useState(false);

  // --- Data State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 1. Load Notes on Mount
  useEffect(() => {
    loadNotes();
  }, []);

  // ✅ Handle Resizing Logic
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        // Calculate new width based on mouse position from the right edge
        const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 800) {
          setChatWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes", error);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newNote = await uploadNote(file);
      setNotes([newNote, ...notes]);
      handleNoteSelect(newNote);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload PDF");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FIX: Load History Logic (Issue 1)
  const handleNoteSelect = async (note: Note) => {
    setCurrentNote(note);
    setPdfUrl(null);
    setMessages([]);
    setSessionId(null);
    setIsChatOpen(true); // Auto open chat on select

    // A. Fetch PDF Blob
    try {
      const blob = await fetchNoteBlob(note.id);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to load PDF content", error);
    }

    // B. Check for existing sessions -> Get History OR Create New
    try {
      const existingSessions = await fetchSessions(note.id);

      if (existingSessions.length > 0) {
        // Load the most recent session
        const lastSession = existingSessions[0];
        setSessionId(lastSession.id);

        // Fetch actual messages
        const history = await fetchChatHistory(lastSession.id);
        // Map backend history to frontend format
        const formattedHistory: ChatMessage[] = history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedHistory);
      } else {
        // No session exists, create one
        const session = await createChatSession(
          note.id,
          `Chat - ${note.filename}`
        );
        setSessionId(session.id);
        setMessages([
          {
            role: "assistant",
            content: `Ready to chat about ${note.filename}!`,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to init chat session", error);
    }
  };

  // ✅ FIX: Loading State Bug (Issue 4)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMsg = inputMessage;
    setInputMessage("");

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true); // Start loading

    // Placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await streamChatRequest(
        sessionId,
        userMsg,
        (chunk) => {
          setMessages((prev) => {
            const newArr = [...prev];
            const lastIndex = newArr.length - 1;
            newArr[lastIndex] = {
              ...newArr[lastIndex],
              content: newArr[lastIndex].content + chunk,
            };
            return newArr;
          });
        },
        (err) => {
          console.error("Stream error", err);
          // Don't set loading false here, let finally handle it
        }
      );
    } catch (e) {
      console.error("Chat Request Error", e);
    } finally {
      // ✅ Ensure loading stops regardless of success/fail so button enables
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex bg-black h-screen overflow-hidden">
      {/* --- Left Sidebar: My Notes --- */}
      <div
        className={`h-screen shrink-0 transition-all duration-300 bg-gray-900 border-r border-gray-700 flex flex-col gap-4 ${
          isSidebarOpen ? "w-64 p-4" : "w-0 p-0 overflow-hidden"
        }`}
      >
        {isSidebarOpen && (
          <>
            <h3 className="text-xl font-bold text-white mb-2 border-b border-gray-700 pb-2">
              My Notes
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-3 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Upload size={20} />
              )}
              {isUploading ? "Uploading..." : "Upload New PDF"}
            </button>
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 overflow-y-auto">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                History
              </p>
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className={`text-gray-200 p-3 rounded-md cursor-pointer flex items-center gap-2 hover:bg-gray-700 transition ${
                    currentNote?.id === note.id
                      ? "bg-gray-800 border border-blue-500"
                      : ""
                  }`}
                >
                  <FileText size={16} className="text-blue-400" />
                  <span className="truncate text-sm">{note.filename}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Center: PDF Viewer --- */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col flex-1 p-0 bg-gray-800">
          <header className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-sm absolute top-0 w-full z-10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-white truncate max-w-md">
              {currentNote ? currentNote.filename : "Select a Note"}
            </h2>
            {!isChatOpen && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                <MessageSquare size={16} /> Chat
              </button>
            )}
          </header>

          <div className="flex-1 w-full h-full pt-16">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={64} className="mb-4 opacity-50" />
                <p>Select a PDF from the sidebar to view</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ✅ Resizable Chat Panel (Issue 3) --- */}
        {isChatOpen && (
          // Drag Handle
          <div
            className="w-1.5 cursor-col-resize bg-gray-800 hover:bg-blue-500 transition-colors z-20 flex items-center justify-center"
            onMouseDown={startResizing}
          >
            {/* Tiny indicator for grip */}
            <div className="h-8 w-0.5 bg-gray-600 rounded"></div>
          </div>
        )}

        <div
          style={{ width: isChatOpen ? chatWidth : 0 }}
          className={`flex flex-col bg-gray-900 border-l border-gray-700 flex-shrink-0 transition-all duration-75 ease-out`}
        >
          {isChatOpen && (
            <>
              <header className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">AI Chat</h3>
                {/* Close Button is here */}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center text-sm mt-10">
                    Ask a question about this document...
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-200 prose prose-invert max-w-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your question..."
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                    disabled={!sessionId || isChatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!sessionId || isChatLoading}
                    className="bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
