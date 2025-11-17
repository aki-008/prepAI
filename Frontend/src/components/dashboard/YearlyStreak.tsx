interface StreakData {
  date: string;
  count: number;
  weekday: number;
  week: number;
  month: string;
}

const getColor = (count: number) => {
  if (count === 0) return "#2e2e2e"; 
  if (count === 1) return "#9be9f8"; 
  if (count === 2) return "#40c4f3"; 
  if (count === 3) return "#30a1c4"; 
  return "#216e9c"; 
};
const YearlyStreak = ({ data }: { data: StreakData[] }) => {
  const totalSubmissions = data.reduce((a, b) => a + b.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  let streak = 0;
  let maxStreak = 0;
  data.forEach((d) => {
    if (d.count > 0) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  });

  const weeks = data.reduce((acc: any, day) => {
    acc[day.week] = acc[day.week] || [];
    acc[day.week].push(day);
    return acc;
  }, {});

  return (
    <div className="bg-gray-900 p-6 rounded-xl text-white shadow-xl">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {totalSubmissions} Hour Platform Activities This Year
        </h3>

        <div className="flex gap-6 text-gray-300">
          <p>Total active days: <span className="text-white">{activeDays}</span></p>
          <p>Max streak: <span className="text-white">{maxStreak}</span></p>
        </div>
      </div>

      <div className="flex">
        {Object.keys(weeks).map((weekIndex) => (
          <div key={weekIndex} className="flex flex-col mr-1">
            {weeks[weekIndex].map((day: StreakData) => (
              <div
                key={day.date}
                title={`${day.date} — ${day.count} tasks`}
                className="w-4 h-4 rounded-sm mb-1"
                style={{ backgroundColor: getColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex mt-3 text-gray-400 text-xs">
        {Object.keys(weeks).map((weekIndex) => {
          const firstDay = weeks[weekIndex][0];
          const showLabel = firstDay.date.endsWith("01");
          return (
            <div key={weekIndex} className="w-4 mx-[2px]">
              {showLabel && <span>{firstDay.month}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearlyStreak;
