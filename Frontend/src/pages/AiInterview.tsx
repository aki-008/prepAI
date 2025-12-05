import React, { useState, useEffect } from "react";
import {
  Send,
  Settings,
  CheckCircle,
  Mic,
  PhoneOff,
  Volume2,
  Loader2,
  Activity,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import API from "../api/api"; // Your Axios instance
import { useAuth } from "../components/context/AuthContext";

// --- CONFIG ---
const VAPI_PUBLIC_KEY = "6e393730-74a2-4690-8cb7-845ed3880488"; // Replace with your key
const vapi = new Vapi(VAPI_PUBLIC_KEY);

type InterviewState = "config" | "chat" | "results";

const AIInterview: React.FC = () => {
  const { username } = useAuth(); // Get logged in user name
  const [interviewState, setInterviewState] =
    useState<InterviewState>("config");

  // Form State
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [level, setLevel] = useState("Medium");

  // Vapi State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [volumeLevel, setVolumeLevel] = useState(0);

  // --- VAPI EVENTS ---
  useEffect(() => {
    vapi.on("call-start", () => {
      setStatus("Connected");
      setIsSessionActive(true);
      setInterviewState("chat"); // Switch UI to chat when call starts
    });

    vapi.on("call-end", () => {
      setStatus("Call Ended");
      setIsSessionActive(false);
      setIsSpeaking(false);
      setInterviewState("results"); // Switch UI to results when call ends
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("volume-level", (level) => setVolumeLevel(level)); // Optional: for animation

    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setStatus("Error connecting");
      setIsSessionActive(false);
    });

    // Cleanup
    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, []);

  // --- ACTIONS ---

  const startInterview = async () => {
    if (!jobRole || !experience) {
      alert("Please fill in Job Role and Experience.");
      return;
    }

    setStatus("Configuring AI...");

    try {
      // 1. Get dynamic config from YOUR backend
      const response = await API.post("/vapi/get-vapi-config", {
        name: username,
        job_role: jobRole,
        experience: experience,
        level: level,
      });

      const { assistantId, overrides } = response.data;

      setStatus("Connecting...");

      // 2. Start Vapi Call
      await vapi.start(assistantId, overrides);
    } catch (err) {
      console.error("Failed to start interview:", err);
      setStatus("Failed to start");
      alert("Could not start interview. Check backend connection.");
    }
  };

  const endInterview = () => {
    vapi.stop();
    // State change to 'results' happens in 'call-end' listener
  };

  // --- RENDERERS ---

  // 1. Configuration Phase (Kept mostly same as original)
  const renderConfig = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-700">
        <Settings size={24} /> Configure Your Interview
      </h3>

      <div className="space-y-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            1. Job Role/Position
          </span>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Senior Frontend Developer"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            2. Years of Experience
          </span>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g., 5"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">3. Difficulty Level</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="Basic">Basic</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
      </div>

      <button
        onClick={startInterview}
        disabled={status === "Configuring AI..." || status === "Connecting..."}
        className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 flex items-center gap-2 disabled:opacity-70"
      >
        {status === "Configuring AI..." || status === "Connecting..." ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Mic size={20} />
        )}
        {status === "Idle" || status === "Error"
          ? "Start Voice Interview"
          : status}
      </button>
    </div>
  );

  // 2. Active Chat Phase (Modified for Voice UI)
  const renderChat = () => (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg min-h-[500px] relative">
      <h3 className="text-xl font-bold mb-2">Live Interview</h3>
      <p className="text-gray-600 mb-8">
        {jobRole} • {level} Level
      </p>

      {/* Dynamic AI Ball based on Speaking State */}
      <div className="relative mb-10">
        <div
          className={`flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
            isSpeaking ? "bg-purple-600 scale-110" : "bg-blue-600 scale-100"
          }`}
          style={{
            boxShadow: isSpeaking
              ? `0 0 ${30 + volumeLevel * 50}px rgba(147, 51, 234, 0.6)`
              : "0 0 20px rgba(37, 99, 235, 0.3)",
          }}
        >
          {isSpeaking ? (
            <Volume2 className="w-12 h-12 text-white animate-pulse" />
          ) : (
            <Activity className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Status Indicator */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-gray-500 font-medium animate-pulse">
          {isSpeaking ? "AI is speaking..." : "Listening to you..."}
        </div>
      </div>

      <button
        onClick={endInterview}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition font-semibold"
      >
        <PhoneOff size={20} /> End Interview
      </button>
    </div>
  );

  // 3. Results Phase
  const renderResults = () => (
    <div className="bg-green-50 p-8 rounded-xl shadow-xl text-center">
      <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-green-700 mb-2">
        Interview Completed
      </h3>
      <p className="text-gray-700 mb-6">
        The AI interviewer has finished assessing your responses. (Integration
        with transcript analysis would go here).
      </p>
      <button
        onClick={() => setInterviewState("config")}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
      >
        Start New Interview
      </button>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto font-opensans">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        AI Voice Interview 🎙️
      </h1>
      {interviewState === "config" && renderConfig()}
      {interviewState === "chat" && renderChat()}
      {interviewState === "results" && renderResults()}
    </div>
  );
};

export default AIInterview;
