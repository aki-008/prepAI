import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from "recharts";

const SkillRadarChart = ({ data }: { data: any[] }) => (
  <div className="bg-white p-5 shadow rounded-xl">
    <h3 className="text-xl font-bold mb-3 text-black">Skill Strength Chart</h3>

    <div className="w-full h-80">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Skill Level"
            dataKey="value"
            stroke="#1170d6"
            fill="#1170d6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default SkillRadarChart;
