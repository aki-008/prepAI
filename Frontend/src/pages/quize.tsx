import React, { useState } from "react";
import { FileSpreadsheet, Code2, ListChecks } from "lucide-react";
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

  const buttonClass =
    "w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 font-medium transition shadow-lg shadow-blue-500/30 text-white mt-4";

  // Load Quiz Page
  if (showQuiz) {
    if (quizType === "mcq")
      return <MCQQuizPage onBack={() => setShowQuiz(false)} />;

    if (quizType === "coding")
      return <CodingQuizPage onBack={() => setShowQuiz(false)} />;
  }

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

  const SourceCard = ({ icon, title, desc, actionText }: any) => (
    <div className="p-6 bg-slate-900/60 rounded-2xl shadow-xl border border-slate-700 hover:bg-slate-800/70 transition flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        {icon}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-gray-400 mt-1 text-sm">{desc}</p>
        </div>
      </div>
      <button className={buttonClass.replace("w-full", "w-fit px-6")}>
        {actionText}
      </button>
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
          <div className="space-y-8">
            <SourceCard
              icon={<FileSpreadsheet className="w-8 h-8 text-cyan-400" />}
              title="Resume/Note PDF Upload"
              desc="Generate quizzes based on your uploaded resume or notes."
              actionText="Upload"
            />
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
            (!quizType
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100 cursor-pointer")
          }
          disabled={!quizType}
          onClick={() => setShowQuiz(true)}
        >
          Generate Quiz Now
        </button>
      </div>
    </div>
  );
};

export default ResumeGeneratedQuize;