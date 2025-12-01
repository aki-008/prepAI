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
  GripVertical,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import {
  fetchNotes,
  uploadNote,
  fetchNoteBlob,
  createChatSession,
  streamChatRequest,
  fetchChatHistory,
  fetchSessions,
  deleteNote,
  renameNote,
  type Note,
  type ChatMessage,
} from "../api/notesService";

const Notes: React.FC = () => {
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Resizable Chat State ---
  const [chatWidth, setChatWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // --- Data State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // --- Edit/Rename State ---
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- Auto Scroll Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  // --- FIX: Robust Auto-Scroll ---
  const scrollToBottom = () => {
    // "smooth" gets interrupted by rapid streaming updates.
    // "instant" ensures it snaps to bottom every time a token arrives.
    messagesEndRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // --- Resizing Logic ---
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 800) setChatWidth(newWidth);
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

  // --- Handle Delete ---
  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this note and its chat history?"
      )
    )
      return;

    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setPdfUrl(null);
        setMessages([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
      alert("Error deleting note");
    }
  };

  // --- Handle Rename ---
  const startEditing = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditName(note.filename);
  };

  const saveRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingNoteId || !editName.trim()) return;
    try {
      await renameNote(editingNoteId, editName);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId ? { ...n, filename: editName } : n
        )
      );
      if (currentNote?.id === editingNoteId) {
        setCurrentNote((prev) =>
          prev ? { ...prev, filename: editName } : null
        );
      }
      setEditingNoteId(null);
    } catch (error) {
      console.error("Failed to rename", error);
      alert("Error renaming note");
    }
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(null);
  };

  const handleNoteSelect = async (note: Note) => {
    if (editingNoteId === note.id) return;
    setCurrentNote(note);
    setPdfUrl(null);
    setMessages([]);
    setSessionId(null);
    setIsChatOpen(true);

    try {
      const blob = await fetchNoteBlob(note.id);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to load PDF", error);
    }

    try {
      const existingSessions = await fetchSessions(note.id);
      if (existingSessions.length > 0) {
        const lastSession = existingSessions[0];
        setSessionId(lastSession.id);
        const history = await fetchChatHistory(lastSession.id);
        const formattedHistory: ChatMessage[] = history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedHistory);
      } else {
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
      console.error("Failed to init chat", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;
    const userMsg = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);
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
        (err) => console.error("Stream error", err)
      );
    } catch (e) {
      console.error("Chat Request Error", e);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex bg-black h-screen overflow-hidden">
      {/* --- Left Sidebar --- */}
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
                  className={`group relative text-gray-200 p-3 rounded-md cursor-pointer flex items-center justify-between hover:bg-gray-700 transition ${
                    currentNote?.id === note.id
                      ? "bg-gray-800 border border-blue-500"
                      : ""
                  }`}
                >
                  {editingNoteId === note.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-blue-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={saveRename}
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText
                          size={16}
                          className="text-blue-400 shrink-0"
                        />
                        <span className="truncate text-sm">
                          {note.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(e, note)}
                          className="p-1.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(e, note.id)}
                          className="p-1.5 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Center: PDF Viewer --- */}
      <div className="flex flex-1 overflow-hidden relative flex-col">
        <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-white truncate max-w-md">
              {currentNote ? currentNote.filename : "Select a Note"}
            </h2>
          </div>
          {!isChatOpen && currentNote && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <MessageSquare size={18} /> Open Chat
            </button>
          )}
        </header>

        <div className="flex-1 w-full h-full bg-gray-800 relative">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className={`w-full h-full border-none ${
                isResizing ? "pointer-events-none" : ""
              }`}
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

      {/* --- Resizable Chat Panel --- */}
      {isChatOpen && (
        <div
          className="w-1.5 hover:w-2 cursor-col-resize bg-gray-800 hover:bg-blue-500 transition-all z-20 flex items-center justify-center shrink-0"
          onMouseDown={startResizing}
        >
          <GripVertical size={16} className="text-gray-500" />
        </div>
      )}

      <div
        style={{ width: isChatOpen ? chatWidth : 0 }}
        className={`flex flex-col bg-gray-900 border-l border-gray-700 shrink-0 transition-all duration-100 ease-linear overflow-hidden`}
      >
        {isChatOpen && (
          <>
            <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                <h3 className="text-lg font-bold text-white whitespace-nowrap">
                  AI Chat
                </h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                  <p>Ask a question about this document...</p>
                </div>
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
                        : "bg-gray-700 text-gray-200 prose prose-invert prose-sm max-w-none"
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
              {/* Auto Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-500"
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
  );
};

export default Notes;
