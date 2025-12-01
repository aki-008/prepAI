// Frontend/src/api/notesService.ts
import API from "./api"; // Your existing Axios instance
import { type AxiosResponse } from "axios";

// Interface matching the Backend Pydantic model "NoteInfo"
export interface Note {
  id: number;
  filename: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
  pdf_id: number;
}

// 1. Fetch the list of PDFs for the Sidebar
export const fetchNotes = async (): Promise<Note[]> => {
  const response: AxiosResponse<Note[]> = await API.get("/notes/");
  return response.data;
};

// 2. Upload a new PDF
export const uploadNote = async (file: File): Promise<Note> => {
  const formData = new FormData();
  formData.append("file", file); // Must match backend: file: UploadFile

  const response = await API.post("/notes/upload_notes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // The backend returns complex data, but we just need the basics for the list update
  // Mapping the response to our Note interface structure locally if needed,
  // or you can adjust the backend response.
  // For now, we assume the backend returns the created doc info or we construct it.
  return {
    id: response.data.doc_id,
    filename: response.data.filename,
    created_at: new Date().toISOString(), // Optimistic timestamp
  };
};

// 3. Get the URL for the PDF content (for the viewer)
// We don't use Axios here because we want a direct URL for the iframe/object
export const getNoteContentUrl = (noteId: number): string => {
  const token = localStorage.getItem("token");
  // We append the token as a query param or handle auth differently for iframes.
  // Since standard Bearer auth is hard with simple <iframe src="...">,
  // we will fetch the blob via JS and create an ObjectURL in the component.
  return `/api/v1/notes/${noteId}/content`;
};

// 4. Fetch the Blob directly (Better for Auth)
export const fetchNoteBlob = async (noteId: number): Promise<Blob> => {
  const response = await API.get(`/notes/${noteId}/content`, {
    responseType: "blob",
  });
  return response.data;
};

// 5. Create or Get Chat Session
export const createChatSession = async (
  pdfId: number,
  name: string = "New Chat"
) => {
  const response = await API.post("/notes/sessions", { pdf_id: pdfId, name });
  return response.data;
};

// 6. Get Chat History
export const fetchChatHistory = async (sessionId: string) => {
  const response = await API.get(`/notes/history/${sessionId}`);
  return response.data;
};

export const fetchSessions = async (pdfId: number): Promise<Session[]> => {
  const response = await API.get(`/notes/sessions/${pdfId}`);
  return response.data;
};

// 7. Stream Chat (Special Handling using fetch API)
export const streamChatRequest = async (
  sessionId: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  onError: (err: any) => void
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/notes/chat/${sessionId}?user_prompt=${encodeURIComponent(
        userMessage
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Note: Your backend expects query params for user_prompt based on the route signature:
        // @router.post("/chat/{session_id}") async def chat_session(..., user_prompt: str, ...)
        // It is NOT a JSON body in your current backend code (check notes.py:207).
      }
    );

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (err) {
    onError(err);
  }
};
