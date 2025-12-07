import YearlyStreak from "../components/dashboard/YearlyStreak";
import FeedbackScore from "../components/dashboard/FeedBackScore";
import SkillRadarChart from "../components/dashboard/SkillRadarChart";
import WeakAreaBanner from "../components/dashboard/WeakAreaBanner";
import InterviewPlayback from "../components/dashboard/InterviewPlayback";
import { generateYearlyStreakData } from "../utils/generateYearlyStreakData";
import { useAuth } from "../components/context/AuthContext"; // Import AuthContext

const Dashboard = () => {
  const { username } = useAuth(); // Get dynamic username
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
    // Updated background to match the new dark blue theme
    <div className="px-6 py-8 space-y-10 min-h-screen text-gray-100 bg-[#434E78] font-OpenSans">
      {/* ----------- HEADER SECTION ----------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        {/* Replaced Hardcoded Name with {username} */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          👋 Welcome back,{" "}
          <span className="text-[#F7E396]">{username || "User"}</span>
        </h1>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {/* Updated Button to match new Highlight (#F7E396) theme */}
          <button className="px-6 py-2 bg-[#F7E396] text-[#434E78] rounded-lg shadow-lg hover:bg-[#E97F4A] hover:text-white transition-all duration-300 ease-in-out font-bold">
            Start Interview
          </button>
        </div>
      </div>

      {/* ----------- GRID MAIN LAYOUT ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL (Feedback Score) */}
        <div className="space-y-6 col-span-1">
          {/* Updated Card Background to Secondary Blue (#607B8F) */}
          <div className="bg-[#607B8F] rounded-xl shadow-lg p-6 border border-white/10 h-full">
            <h2 className="text-xl font-bold mb-4 text-white">
              AI Feedback Score
            </h2>
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
          <div className="bg-[#607B8F] rounded-xl shadow-lg p-6 border border-white/10 h-full">
            <h2 className="text-xl font-bold mb-4 text-white">
              Skill Strength Chart
            </h2>
            <SkillRadarChart data={radarData} />
          </div>
        </div>
      </div>

      {/* ----------- MIDDLE ROW ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#607B8F] rounded-xl shadow-lg p-6 border border-white/10 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-white">
            Interview Playback AI Feedback
          </h2>
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

        <div className="bg-[#607B8F] rounded-xl shadow-lg p-5 border border-white/10 col-span-1 flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4 text-white">WeakAreaBanner</h2>
          <WeakAreaBanner topic={weakTopic} />
        </div>
      </div>

      {/* ----------- BOTTOM ROW ----------- */}
      <div className="bg-[#607B8F] rounded-xl shadow-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-3 text-white">Yearly Streak</h2>
        <YearlyStreak data={streakData} />
      </div>
    </div>
  );
};

export default Dashboard;
