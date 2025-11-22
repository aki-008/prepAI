import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

interface MCQQuizPageProps {
  onBack: () => void;
  // optional: total time in seconds (defaults to 15 minutes)
  totalTimeSeconds?: number;
}

type QStatus = "notVisited" | "visited" | "answered" | "markedForReview";

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  // runtime fields
  selected?: string | null;
  status?: QStatus;
}

const initialMockData: QuestionItem[] = [
  {
    id: 1,
    question: "Which hook is used to perform side effects in React?",
    options: ["useState", "useContext", "useEffect", "useReducer"],
    answer: "useEffect",
  },
  {
    id: 2,
    question: "What does the 'FileSpreadsheet' icon represent?",
    options: [
      "A config file",
      "A PDF or document upload",
      "A database query",
      "A CSS file",
    ],
    answer: "A PDF or document upload",
  },
  {
    id: 3,
    question: "Which Tailwind class keeps an element sticky during scroll?",
    options: ["sticky", "absolute", "fixed", "relative"],
    answer: "sticky",
  },
  {
    id: 4,
    question: "Which prop was NOT passed earlier to OutputTypeOption?",
    options: ["icon", "title", "desc", "onClick"],
    answer: "onClick",
  },
];

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const MCQQuizPage: React.FC<MCQQuizPageProps> = ({
  onBack,
  totalTimeSeconds = 15 * 60, // default 15 minutes
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(
    () =>
      initialMockData.map((q, idx) => ({
        ...q,
        selected: null,
        status: idx === 0 ? "visited" : "notVisited",
      }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false); // tracks current question answered state
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Initialize isAnswered for current question when index changes
  useEffect(() => {
    setIsAnswered(Boolean(currentQuestion?.selected));
  }, [currentQuestion]);

  // Timer with auto-submit
  useEffect(() => {
    if (showScore) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showScore]);

  const saveCurrentSelection = useCallback(
    (selected: string | null) => {
      setQuestions((prev) => {
        const copy = prev.map((q, idx) => {
          if (idx !== currentIndex) return q;
          return {
            ...q,
            selected,
            status:
              selected !== null
                ? "answered"
                : q.status === "markedForReview"
                ? "markedForReview"
                : "visited",
          };
        });
        return copy;
      });
    },
    [currentIndex]
  );

  const handleAnswerClick = useCallback(
    (option: string) => {
      // mark selected immediately
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

  const goToQuestion = useCallback(
    (index: number) => {
      setQuestions((prev) =>
        prev.map((q, idx) => {
          if (idx === index) {
            // mark visited if not visited
            return {
              ...q,
              status: q.status === "notVisited" ? "visited" : q.status,
            };
          }
          // also ensure current question remains with existing status
          return q;
        })
      );
      setCurrentIndex(index);
    },
    []
  );

  const handleSaveAndNext = useCallback(() => {
    // ensure status updated even if answered or not
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
      // at end -> submit
      handleSubmit();
    }
  }, [currentIndex, goToQuestion, totalQuestions]);

  const handleMarkForReview = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex
          ? {
              ...q,
              status: "markedForReview",
            }
          : q
      )
    );
    // move to next question
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
      if (q.selected && q.selected === q.answer) s += 1;
    });
    return s;
  }, [questions]);

  const handleSubmit = useCallback(() => {
    setShowScore(true);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    // ensure final statuses saved and then show score
    setShowScore(true);
  }, []);

  // palette helpers
  const statusClassForPalette = (q: QuestionItem, idx: number) => {
    // Blue = current; Green = answered; Yellow = markedForReview; Red = visited but not answered; Gray = notVisited
    if (idx === currentIndex)
      return "bg-blue-500 text-white ring-2 ring-blue-300";
    switch (q.status) {
      case "answered":
        return "bg-green-500 text-white";
      case "markedForReview":
        return "bg-yellow-400 text-black";
      case "visited":
        return "bg-red-500 text-white";
      case "notVisited":
      default:
        return "bg-slate-300 text-slate-700";
    }
  };

  const score = useMemo(() => computeScore(), [computeScore]);

  // Render Score screen
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
              onClick={() => {
                // simple retry: reset everything
                setQuestions(
                  initialMockData.map((q, idx) => ({
                    ...q,
                    selected: null,
                    status: idx === 0 ? "visited" : "notVisited",
                  }))
                );
                setCurrentIndex(0);
                setShowScore(false);
                setTimeLeft(totalTimeSeconds);
                setIsAnswered(false);
              }}
              className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-blue-700 text-white font-medium hover:opacity-90"
            >
              Retry
            </button>

            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz UI
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: Main Question area (8 cols) */}
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
              <p className="text-sm text-gray-500 mt-1">
                Mixed section — complete the test before time ends.
              </p>
            </div>

            <div className="hidden md:flex flex-col items-end text-sm text-gray-600">
              <div>Question</div>
              <div className="text-xl font-bold text-blue-600">
                {currentIndex + 1} / {totalQuestions}
              </div>
              <div className="mt-1">Score: <span className="font-semibold text-green-600">{score}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-slate-200">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Quant - Question</div>
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = currentQuestion.selected === opt;
                const optionClass = isAnswered
                  ? opt === currentQuestion.answer
                    ? "bg-green-600/80 text-white border-green-500 shadow"
                    : isSelected
                    ? "bg-red-600/80 text-white border-red-500 shadow"
                    : "bg-slate-50 border-slate-200 text-slate-700 opacity-70"
                  : isSelected
                  ? "bg-blue-600/80 text-white"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800";

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerClick(opt)}
                    disabled={isAnswered && opt !== currentQuestion.answer && isSelected === false && false}
                    className={`p-4 rounded-lg text-left border transition flex justify-between items-center ${optionClass}`}
                  >
                    <span>{opt}</span>

                    {isAnswered && opt === currentQuestion.answer && (
                      <CheckCircle className="w-5 h-5 text-green-100" />
                    )}
                    {isAnswered &&
                      currentQuestion.selected === opt &&
                      opt !== currentQuestion.answer && (
                        <XCircle className="w-5 h-5 text-red-200" />
                      )}
                    {!isAnswered && isSelected && (
                      <span className="text-sm text-blue-50">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>

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
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 bg-white"
                >
                  Clear Response
                </button>

                <button
                  onClick={handleSaveAndNext}
                  className="px-4 py-2 rounded-md bg-linear-to-r from-blue-500 to-blue-700 text-white font-medium flex items-center gap-2"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {currentIndex === totalQuestions - 1 ? (
                  <span className="font-medium">Finish test to submit</span>
                ) : (
                  <span>{currentIndex + 1} of {totalQuestions}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar (4 cols) */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            {/* Timer / top card */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-200 text-center">
              <div className="text-sm text-gray-500">Time Left</div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {formatTime(Math.max(0, timeLeft))}
              </div>
              <div className="mt-3 text-xs text-gray-500">Auto-submit when timer ends</div>
            </div>

            {/* Palette Grid */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Question Palette</h3>
                <div className="text-xs text-gray-500">Tap to jump</div>
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
                    title={`Q ${idx + 1} — ${q.status}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 text-xs text-slate-600 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded" /> Current
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-400 rounded" /> Review
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded" /> Visited
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-slate-300 rounded" /> Not
                  Visited
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="bg-white rounded-xl p-4 shadow border border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  // quick confirm before submitting
                  // In real app, you'd show a modal
                  if (window.confirm("Submit test now?")) {
                    handleSubmit();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
              >
                Submit Test
              </button>

              <button
                onClick={() => {
                  // jump to first unanswered
                  const idx = questions.findIndex((q) => q.status === "notVisited" || q.status === "visited");
                  if (idx >= 0) goToQuestion(idx);
                  else alert("No unanswered questions left.");
                }}
                className="px-3 py-2 rounded-md border border-slate-200 text-slate-700"
              >
                Next Unanswered
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MCQQuizPage;