import React, { useState, useRef } from "react";
import { FileSpreadsheet, Code2, ListChecks, FileText, Upload, X } from "lucide-react";
import MCQQuizPage from "../components/quize/mcq"; 

const CodingQuizPage = ({ onBack }: any) => (
  <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-6">Coding Quiz Coming Soon...</h1>
    <button
      onClick={onBack}
      className="px-6 py-3 bg-blue-600 rounded-lg text-white"
    >
      ← Back
    </button>
  </div>
);

const ResumeGeneratedQuize: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizType, setQuizType] = useState<"mcq" | "coding" | null>(null);
  const [uploadType, setUploadType] = useState<"resume" | "notes" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);

  const [customPrompt, setCustomPrompt] = useState("");
  const [quizData, setQuizData] = useState(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "resume" | "notes") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setFileError(null);
    setUploadType(type);
    setUploadedFile(file.name);
    setFileObject(file);       // <-- Store actual file object
  };

  const handleResumeClick = () => resumeInputRef.current?.click();
  const handleNotesClick = () => notesInputRef.current?.click();

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadType(null);
    setFileError(null);
    setFileObject(null);
  };

  // ---------- SEND PDF TO BACKEND ----------
  const generateQuiz = async () => {
    if (!fileObject || !quizType) return;

    const formData = new FormData();
    formData.append("file", fileObject);
    formData.append("quiz_type", quizType);
    formData.append("instructions", customPrompt);

    const response = await fetch("http://localhost:8000/generate-quiz", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setQuizData(data);   // store quiz data
    setShowQuiz(true);   // navigate to quiz page
  };

  // Load quiz UI
  if (showQuiz) {
    if (quizType === "mcq")
      return <MCQQuizPage data={quizData} onBack={() => setShowQuiz(false)} />;

    if (quizType === "coding")
      return <CodingQuizPage data={quizData} onBack={() => setShowQuiz(false)} />;
  }

  // ---- UI COMPONENTS (same as your original) ----
  const buttonClass =
    "w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 font-medium transition shadow-lg shadow-blue-500/30 text-white mt-4";

  const OutputTypeOption = ({ icon, title, desc, value }: any) => (
    <div
      onClick={() => setQuizType(value)}
      className={`p-4 rounded-xl border transition cursor-pointer 
        ${
          quizType === value
            ? "bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/30"
            : "bg-slate-900/50 border-slate-700 hover:bg-slate-800/60"
        }
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="text-xl font-semibold text-gray-50">{title}</h4>
      </div>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );

  const SourceCard = () => (
    <div className="p-6 bg-slate-900/60 rounded-2xl shadow-xl border border-slate-700 hover:bg-slate-800/70 transition flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <FileSpreadsheet className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">Upload Materials</h2>
          <p className="text-gray-400 mt-1 text-sm">Upload your resume or notes (Max 10MB)</p>
        </div>
      </div>
      
      <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileUpload(e, "resume")}
        className="hidden"
      />
      <input
        ref={notesInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileUpload(e, "notes")}
        className="hidden"
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleResumeClick}
          className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Resume
        </button>
        <button
          onClick={handleNotesClick}
          className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Notes
        </button>
      </div>

      {fileError && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{fileError}</p>
        </div>
      )}

      {uploadedFile && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-green-300 font-medium">File uploaded successfully</p>
            <p className="text-xs text-green-200 mt-1">{uploadedFile}</p>
            <p className="text-xs text-green-200">{uploadType === "resume" ? "Resume" : "Notes"}</p>
          </div>
          <button
            onClick={clearUpload}
            className="text-green-300 hover:text-green-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6 lg:px-12">
      <h1 className="text-4xl font-bold mb-16 text-center">
        Smart AI-Powered Quiz Generator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-3xl font-bold mb-6 text-gray-100 border-b border-blue-700 pb-2">
            1. Select Quiz Source
          </h3>
          <div className="space-y-4">
            <SourceCard />
          </div>
        </div>

        <div className="lg:sticky lg:top-8 self-start">
          <h3 className="text-3xl font-bold mb-6 text-gray-100 border-b border-blue-700 pb-2">
            2. Configure & Generate
          </h3>

          <div className="bg-slate-900/60 rounded-2xl shadow-2xl p-6 border border-slate-800 mb-8">
            <label className="text-lg font-semibold block mb-3 text-gray-200">
              Custom Prompt/Instructions (Optional)
            </label>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Focus on Python only'"
              className="w-full p-3 rounded-lg bg-black/40 border border-slate-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            ></textarea>
            <p className="text-gray-500 text-sm mt-2">
              This prompt influences the quiz generation.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-8 self-start mt-8">
        <h4 className="text-2xl font-semibold mb-4 text-gray-200">
          Choose Output Type:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OutputTypeOption
            value="mcq"
            icon={<ListChecks className="w-6 h-6 text-blue-400" />}
            title="Multiple Choice Quiz (MCQ)"
            desc="Ideal for quick assessment."
          />
          <OutputTypeOption
            value="coding"
            icon={<Code2 className="w-6 h-6 text-blue-400" />}
            title="Coding Challenge Quiz"
            desc="Generate code-based evaluation tasks."
          />
        </div>

        <button
          className={
            buttonClass +
            " text-xl mt-8 " +
            (!quizType || !fileObject
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100 cursor-pointer")
          }
          disabled={!quizType || !fileObject}
          onClick={generateQuiz}   // <--- SEND PDF TO BACKEND
        >
          Generate Quiz Now
        </button>
      </div>
    </div>
  );
};

export default ResumeGeneratedQuize;
