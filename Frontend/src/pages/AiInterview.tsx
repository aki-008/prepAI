import React, { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, PhoneOff, Send, Loader2, Volume2 } from "lucide-react";

// --- CONFIG ---
const VAPI_PUBLIC_KEY = "6e393730-74a2-4690-8cb7-845ed3880488"; // Replace with yours
const BACKEND_URL = "http://localhost:8000";

const vapi = new Vapi(VAPI_PUBLIC_KEY);

function AIInterview() {
  // View State
  const [viewState, setViewState] = useState<"config" | "interview">("config");

  // Vapi State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Idle");

  // Form State
  const [name, setName] = useState("Prakhar"); // Default from screenshot
  const [role, setRole] = useState("Senior Frontend Developer");
  const [exp, setExp] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium (Intermediate)");

  useEffect(() => {
    // Vapi Event Listeners
    vapi.on("call-start", () => {
      setStatus("Connected");
      setIsSessionActive(true);
      setViewState("interview"); // Switch to bubble view
    });

    vapi.on("call-end", () => {
      setStatus("Call Ended");
      setIsSessionActive(false);
      setIsSpeaking(false);
      setViewState("config"); // Go back to config
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setStatus("Error connecting");
      setIsSessionActive(false);
      setViewState("config");
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, []);

  const startInterview = async () => {
    setStatus("Configuring...");
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/interview/api/get-vapi-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            job_role: role,
            experience: exp,
            level: difficulty,
          }),
        }
      );

      const data = await response.json();
      if (!data.assistantId || !data.overrides)
        throw new Error("Invalid config");

      setStatus("Connecting...");
      vapi.start(data.assistantId, data.overrides);
    } catch (err: any) {
      console.error("Error:", err);
      setStatus("Failed to start");
    }
  };

  const stopInterview = () => {
    vapi.stop();
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full font-sans text-gray-800 relative bg-white">
      {/* 1. SKETCHY GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-sketchy-grid bg-sketchy opacity-40 pointer-events-none"></div>

      {/* 2. COLOR BLOBS (Palette: #F5D3C4, #F2AEBB) */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-maya-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-maya-beige rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* --- VIEW 1: CONFIG CARD (The "Maya" UI) --- */}
        {viewState === "config" && (
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 p-8 md:p-12 transition-all transform hover:scale-[1.005]">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 font-handwriting">
                Maya
              </h1>
              <div className="flex items-center justify-center gap-2 text-maya-dark">
                <BrainIcon />
                <span className="font-semibold">Configure Your Interview</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Input 1: Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  1. Job Role/Position
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-maya-light focus:ring-0 outline-none transition bg-gray-50 text-gray-700 font-medium placeholder-gray-400"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              {/* Input 2: Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  2. Years of Professional Experience
                </label>
                <input
                  type="text" // using text to match wireframe style, backend handles parsing
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-maya-light focus:ring-0 outline-none transition bg-gray-50 text-gray-700 font-medium placeholder-gray-400"
                  placeholder="e.g. 5"
                />
              </div>

              {/* Input 3: Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  3. Difficulty Level
                </label>
                <input
                  type="text"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-maya-light focus:ring-0 outline-none transition bg-gray-50 text-gray-700 font-medium placeholder-gray-400"
                  placeholder="Medium (Intermediate)"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={startInterview}
                disabled={
                  status === "Configuring..." || status === "Connecting..."
                }
                className="mt-4 px-8 py-4 bg-white border-2 border-gray-800 text-gray-800 font-bold rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-3 active:bg-gray-50"
              >
                {status === "Configuring..." || status === "Connecting..." ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Start Interview</span>
              </button>
            </div>

            {/* Decorative Color Codes (from wireframe) */}
            <div className="absolute bottom-4 right-6 flex flex-col items-end text-xs text-gray-400 font-mono">
              <span>#A7AAE1</span>
              <span>#F5D3C4</span>
            </div>
          </div>
        )}

        {/* --- VIEW 2: INTERVIEW BUBBLE UI (Active Call) --- */}
        {viewState === "interview" && (
          <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in-up">
            {/* The Visualizer Orb */}
            <div className="relative mb-12">
              {/* Orb Style: Light Blue/White Swirling 
                 We use CSS gradients + shadowing + pulsing animation
               */}
              <div
                className={`
                    w-48 h-48 rounded-full 
                    bg-gradient-radial from-white via-blue-100 to-blue-300
                    shadow-[0_0_60px_rgba(167,170,225,0.6)]
                    transition-all duration-300 ease-in-out
                    flex items-center justify-center
                    border border-white/50
                    ${
                      isSpeaking
                        ? "scale-110 animate-pulse shadow-[0_0_80px_rgba(105,111,199,0.8)]"
                        : "scale-100 animate-orb-float"
                    }
                 `}
              >
                {/* Inner shine for "liquid" look */}
                <div className="absolute top-4 left-6 w-12 h-6 bg-white opacity-60 rounded-full blur-md transform -rotate-45"></div>

                {isSpeaking ? (
                  <Volume2 className="text-maya-dark w-12 h-12 opacity-50" />
                ) : (
                  <div className="w-3 h-3 bg-maya-dark rounded-full opacity-30"></div>
                )}
              </div>
            </div>

            {/* Status Text */}
            <h2 className="text-2xl font-bold text-gray-700 mb-8 font-handwriting">
              {isSpeaking ? "Maya is speaking..." : "Listening to you..."}
            </h2>

            {/* Controls */}
            <div className="flex gap-6">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition font-medium shadow-sm">
                <Mic size={18} /> Mute
              </button>

              <button
                onClick={stopInterview}
                className="flex items-center gap-2 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition font-medium shadow-sm"
              >
                <PhoneOff size={18} /> End call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Icon Component
const BrainIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

export default AIInterview;
