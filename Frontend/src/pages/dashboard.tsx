import YearlyStreak from "../components/dashboard/YearlyStreak";
import FeedbackScore from "../components/dashboard/FeedBackScore";
import SkillRadarChart from "../components/dashboard/SkillRadarChart";
import WeakAreaBanner from "../components/dashboard/WeakAreaBanner";
import InterviewPlayback from "../components/dashboard/InterviewPlayback";
import { generateYearlyStreakData } from "../utils/generateYearlyStreakData";

const Dashboard = () => {
  const streakData = generateYearlyStreakData();

  const radarData = [
    { skill: "DSA", value: 70 },
    { skill: "System Design", value: 60 },
    { skill: "Communication", value: 85 },
    { skill: "Problem Solving", value: 75 },
    { skill: "Accuracy", value: 68 },
    { skill: "Time Mgmt", value: 80 },
  ];

  const weakTopic = "Dynamic Programming";

  return (
    // PRIMARY CHANGE: Background Gradient inspired by landing page
    // Using a custom CSS class for a more complex gradient if needed, or approximating with Tailwind.
    // For now, let's use a subtle linear gradient that implies the dark blue-black.
    <div className="px-6 py-8 space-y-10 min-h-screen text-gray-100 bg-black font-OpenSans">
      {/* Font sans is a good default for modern look */}

      {/* ----------- HEADER SECTION (Updated for new theme) ----------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-50 tracking-tight">
          👋 Welcome back, <span className="text-blue-400">Prakhar</span>
        </h1>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {/* PRIMARY BUTTON: Vibrant Purple Theme Color, matching "Start Free Trial" */}
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg shadow-purple-500/30 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 ease-in-out font-semibold">
            Start Interview
          </button>
        </div>
      </div>

      {/* ----------- GRID MAIN LAYOUT (2 COLUMNS for top content) ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT PANEL (Feedback Score) */}
        <div className="space-y-6 col-span-1">
          {/* CARD BACKGROUND CHANGE: Dark Card Color, subtle border/shadow */}
          <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-xl shadow-lg p-6 border border-gray-700/50 h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-50">AI Feedback Score</h2>
            <FeedbackScore
              confidence={78}
              clarity={82}
              accuracy={70}
              speed={65}
              improvements={[
                "Improve explanation clarity",
                "Practice more DP problems",
                "Reduce filler words in answers",
              ]}
            />
          </div>
        </div>

        {/* RIGHT PANEL (Skill Chart) */}
        <div className="space-y-6 col-span-1">
          {/* CARD BACKGROUND CHANGE: Dark Card Color, subtle border/shadow */}
          <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-xl shadow-lg p-6 border border-gray-700/50 h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-50">Skill Strength Chart</h2>
            <SkillRadarChart data={radarData} />
          </div>
        </div>
      </div>
      
      {/* ----------- MIDDLE ROW: INTERVIEW PLAYBACK (LEFT) AND WEAK AREA (RIGHT) ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* INTERVIEW PLAYBACK (2/3 width on large screens, LEFT) */}
        {/* CARD BACKGROUND CHANGE: Dark Card Color, subtle border/shadow */}
        <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-xl shadow-lg p-6 border border-gray-700/50 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-50">Interview Playback AI Feedback</h2>
          <InterviewPlayback
            audioUrl="https://example.com/audio.mp3"
            transcript={`Interviewer: Explain polymorphism.\nYou: Polymorphism means...`}
            highlights={[
              "Answer lacked real-world example",
              "Need more clarity in describing LLD concepts",
              "Example Interview Playback",
            ]}
          />
        </div>

        {/* WEAK AREA (1/3 width on large screens, RIGHT) */}
        {/* CARD BACKGROUND CHANGE: Dark Card Color, subtle border/shadow */}
        <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-xl shadow-lg p-5 border border-gray-700/50 col-span-1 flex-col items-center justify-center">
           {/* WeakAreaBanner will need internal styling adjustments for its alert nature */}
          <h2 className="text-xl font-bold mb-4 text-gray-50">WeakAreaBanner</h2>
          <WeakAreaBanner topic={weakTopic} />
        </div>
      </div>

      {/* ----------- BOTTOM ROW: YEARLY STREAK (FULL WIDTH) ----------- */}
      {/* CARD BACKGROUND CHANGE: Dark Card Color, subtle border/shadow */}
      <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-xl shadow-lg p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold mb-3 text-gray-50">Yearly Streak</h2>
        <YearlyStreak data={streakData} />
      </div>
    </div>
  );
};

export default Dashboard;