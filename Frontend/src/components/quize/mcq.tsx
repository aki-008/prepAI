import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

// 1. Define the structure of the incoming API data
interface BackendQuestion {
  question: string;
  options: string[];
  answer: string; // Backend sends "a", "b", "c", "d"
  explanation: string;
  User_response: string;
}

interface MCQQuizPageProps {
  onBack: () => void;
  totalTimeSeconds?: number;
  // 2. Add the data prop
  data?: {
    quiz: BackendQuestion[];
  } | null;
}

type QStatus = "notVisited" | "visited" | "answered" | "markedForReview";

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: string; // We will convert this to the actual option text
  explanation?: string; // Add explanation field
  // runtime fields
  selected?: string | null;
  status?: QStatus;
}

// Helper to convert 'a' -> options[0]
const mapBackendAnswerToText = (key: string, options: string[]) => {
  const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const idx = map[key.toLowerCase()] ?? -1;
  return idx >= 0 && idx < options.length ? options[idx] : "";
};

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const MCQQuizPage: React.FC<MCQQuizPageProps> = ({
  onBack,
  totalTimeSeconds = 15 * 60,
  data, // Receive data
}) => {
  // 3. Initialize state with Real Data if available, else Mock
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    if (data && data.quiz && data.quiz.length > 0) {
      return data.quiz.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        // Convert "a" -> "Option Text"
        answer: mapBackendAnswerToText(q.answer, q.options),
        explanation: q.explanation,
        selected: null,
        status: idx === 0 ? "visited" : "notVisited",
      }));
    }
    // Fallback if no data
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);

  const totalQuestions = questions.length;
  // Safety check if data is empty
  const currentQuestion = questions[currentIndex] || {
    id: 0,
    question: "Loading...",
    options: [],
    answer: "",
    status: "notVisited",
  };

  useEffect(() => {
    setIsAnswered(Boolean(currentQuestion?.selected));
  }, [currentQuestion]);

  // Timer
  useEffect(() => {
    if (showScore) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, showScore]);

  const handleAnswerClick = useCallback(
    (option: string) => {
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIndex
            ? { ...q, selected: option, status: "answered" }
            : q
        )
      );
      setIsAnswered(true);
    },
    [currentIndex]
  );

  const goToQuestion = useCallback((index: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === index) {
          return {
            ...q,
            status: q.status === "notVisited" ? "visited" : q.status,
          };
        }
        return q;
      })
    );
    setCurrentIndex(index);
  }, []);

  const handleSaveAndNext = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === currentIndex) {
          return {
            ...q,
            status:
              q.status === "markedForReview"
                ? "markedForReview"
                : q.selected
                ? "answered"
                : "visited",
          };
        }
        return q;
      })
    );

    const next = currentIndex + 1;
    if (next < totalQuestions) {
      goToQuestion(next);
    } else {
      handleSubmit();
    }
  }, [currentIndex, goToQuestion, totalQuestions]);

  const handleMarkForReview = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, status: "markedForReview" } : q
      )
    );
    const next = currentIndex + 1;
    if (next < totalQuestions) goToQuestion(next);
  }, [currentIndex, goToQuestion, totalQuestions]);

  const handleClearResponse = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, selected: null, status: "visited" } : q
      )
    );
    setIsAnswered(false);
  }, [currentIndex]);

  const computeScore = useCallback(() => {
    let s = 0;
    questions.forEach((q) => {
      if (q.selected === q.answer) s += 1;
    });
    return s;
  }, [questions]);

  const handleSubmit = useCallback(() => {
    setShowScore(true);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    setShowScore(true);
  }, []);

  const statusClassForPalette = (q: QuestionItem, idx: number) => {
    if (idx === currentIndex)
      return "bg-blue-500 text-white ring-2 ring-blue-300";
    switch (q.status) {
      case "answered":
        return "bg-green-500 text-white";
      case "markedForReview":
        return "bg-yellow-400 text-black";
      case "visited":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-300 text-slate-700";
    }
  };

  const score = useMemo(() => computeScore(), [questions, computeScore]);

  // --- RENDER SCORE ---
  if (showScore) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl p-8 bg-white rounded-xl shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Test Complete</h2>
          <p className="text-gray-600 mb-6">Your results are below.</p>

          <div className="text-center mb-6">
            <div className="text-xl text-gray-500">Score</div>
            <div className="text-5xl font-extrabold text-blue-600">{score}</div>
            <div className="text-sm text-gray-500">out of {totalQuestions}</div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              ← Back to Generator
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Loading/Empty State
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        No questions available. Please try generating again.
        <button onClick={onBack} className="ml-4 text-blue-500 underline">
          Go Back
        </button>
      </div>
    );
  }

  // --- MAIN QUIZ UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: Main Question area */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="flex items-center text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generator
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold mt-3">
                Generated MCQ Quiz
              </h1>
            </div>

            <div className="hidden md:flex flex-col items-end text-sm text-gray-600">
              <div className="text-xl font-bold text-blue-600">
                {currentIndex + 1} / {totalQuestions}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = currentQuestion.selected === opt;
                // Determine styling logic
                let optionClass =
                  "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800";

                if (isAnswered) {
                  if (opt === currentQuestion.answer) {
                    optionClass =
                      "bg-green-600/80 text-white border-green-500 shadow";
                  } else if (isSelected) {
                    optionClass =
                      "bg-red-600/80 text-white border-red-500 shadow";
                  } else {
                    optionClass =
                      "bg-slate-50 border-slate-200 text-slate-700 opacity-70";
                  }
                } else if (isSelected) {
                  optionClass = "bg-blue-600/80 text-white";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerClick(opt)}
                    disabled={isAnswered}
                    className={`p-4 rounded-lg text-left border transition flex justify-between items-center ${optionClass}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && opt === currentQuestion.answer && (
                      <CheckCircle className="w-5 h-5 text-green-100" />
                    )}
                    {isAnswered &&
                      isSelected &&
                      opt !== currentQuestion.answer && (
                        <XCircle className="w-5 h-5 text-red-200" />
                      )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section (Only visible after answering) */}
            {isAnswered && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </div>
            )}

            {/* Bottom actions */}
            <div className="mt-6 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleMarkForReview}
                  className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium"
                >
                  Mark for Review
                </button>
                <button
                  onClick={handleClearResponse}
                  disabled={isAnswered}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 bg-white disabled:opacity-50"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium flex items-center gap-2"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            {/* Timer */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-200 text-center">
              <div className="text-sm text-gray-500">Time Left</div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {formatTime(Math.max(0, timeLeft))}
              </div>
            </div>

            {/* Palette */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Question Palette</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-full aspect-square rounded-md flex items-center justify-center font-medium ${statusClassForPalette(
                      q,
                      idx
                    )}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Submit test now?")) handleSubmit();
              }}
              className="w-full px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
            >
              Submit Test
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MCQQuizPage;
