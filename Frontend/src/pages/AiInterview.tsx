import React, { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, PhoneOff, Volume2, Loader2, Activity } from "lucide-react";

// --- CONFIG ---
// 1. Put your Vapi Public Key here
const VAPI_PUBLIC_KEY = "6e393730-74a2-4690-8cb7-845ed3880488";
// 2. Point this to your FastAPI backend
const BACKEND_URL = "http://localhost:8000";

const vapi = new Vapi(VAPI_PUBLIC_KEY);

function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Idle");

  // Form State
  const [name, setName] = useState("Jane Doe");
  const [role, setRole] = useState("Senior Frontend Engineer");
  const [exp, setExp] = useState("7");

  useEffect(() => {
    // Vapi Event Listeners
    vapi.on("call-start", () => {
      setStatus("Connected (AI is listening)");
      setIsSessionActive(true);
    });

    vapi.on("call-end", () => {
      setStatus("Call Ended");
      setIsSessionActive(false);
      setIsSpeaking(false);
    });

    vapi.on("speech-start", () => {
      setStatus("AI is speaking...");
      setIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      if (isSessionActive) {
        setStatus("Connected (Listening)");
        setIsSpeaking(false);
      }
    });

    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setStatus(`Error: ${e.message}`);
      setIsSessionActive(false);
    });

    return () => {
      // Cleanup
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, []);

  const startInterview = async () => {
    if (VAPI_PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE") {
      alert("Please update VAPI_PUBLIC_KEY in src/App.tsx");
      return;
    }

    setStatus("Configuring...");

    try {
      // 1. Call your backend to get the dynamic config
      const response = await fetch(
        `${BACKEND_URL}/api/v1/interview/api/get-vapi-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, job_role: role, experience: exp }),
        }
      );

      const data = await response.json();

      if (!data.assistantId || !data.overrides) {
        throw new Error("Invalid config from backend");
      }

      setStatus("Connecting...");

      // 2. Start Vapi with the config from backend
      vapi.start(data.assistantId, data.overrides);
    } catch (err: any) {
      console.error("Start Call API Error:", err);
      setStatus(
        `Failed: ${err.message || "Check FastAPI terminal for details."}`
      );
    }
  };

  const stopInterview = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        backgroundColor: "#1f2937" /* Slate 800 */,
        padding: "2.5rem",
        borderRadius: "1rem",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        maxWidth: "450px",
        width: "100%",
        textAlign: "center",
        color: "#f9fafb" /* Gray 50 */,
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          color: "#60a5fa",
        }}
      >
        Vapi Interview Tester
      </h1>

      {/* --- FORM --- */}
      {!isSessionActive && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Target Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Experience (Years)"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* --- VISUALIZER --- */}
      <div
        style={{ margin: "2rem 0", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: isSpeaking
              ? "#a855f7"
              : isSessionActive
              ? "#2563eb"
              : "#4b5563",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transition: "all 0.3s ease",
            transform: isSpeaking ? "scale(1.1)" : "scale(1)",
            boxShadow: isSpeaking
              ? "0 0 30px rgba(168, 85, 247, 0.8)"
              : "0 0 20px rgba(37, 99, 235, 0.4)",
          }}
        >
          {!isSessionActive ? (
            <Mic size={48} />
          ) : isSpeaking ? (
            <Volume2 size={48} />
          ) : (
            <Activity size={48} />
          )}
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        {!isSessionActive ? (
          <button
            onClick={startInterview}
            style={btnPrimary}
            disabled={status === "Connecting..." || status === "Configuring..."}
          >
            {status === "Connecting..." || status === "Configuring..." ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Mic />
            )}
            {status === "Connecting..." || status === "Configuring..."
              ? "Starting..."
              : "Start Interview"}
          </button>
        ) : (
          <button onClick={stopInterview} style={btnDestructive}>
            <PhoneOff /> End Call
          </button>
        )}
      </div>

      <p
        style={{ marginTop: "1.5rem", color: "#9ca3af", fontSize: "0.875rem" }}
      >
        Status:{" "}
        <strong
          style={{ color: status.includes("Error") ? "#f87171" : "#e5e7eb" }}
        >
          {status}
        </strong>
      </p>
    </div>
  );
}

// Simple inline styles for standalone testing
const inputStyle = {
  padding: "0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #475569" /* Slate 600 */,
  fontSize: "1rem",
  backgroundColor: "#0f172a" /* Slate 900 */,
  color: "#f9fafb" /* Gray 50 */,
};

const btnPrimary = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#2563eb" /* Blue 600 */,
  color: "white",
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold",
  transition: "background-color 0.2s",
  outline: "none",
};

const btnDestructive = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#dc2626" /* Red 600 */,
  color: "white",
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold",
  transition: "background-color 0.2s",
  outline: "none",
};

export default App;
