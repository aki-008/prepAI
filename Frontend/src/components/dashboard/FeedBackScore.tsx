import React from "react";

interface Props {
  confidence: number;
  clarity: number;
  accuracy: number;
  speed: number;
  improvements: string[];
}

const ScoreCard = ({ label, value }: any) => (
  <div className="p-4 text-center bg-gray-100 rounded-xl">
    <p className="text-3xl font-bold text-black">{value}%</p>
    <p className="text-gray-600">{label}</p>
  </div>
);

const FeedbackScore: React.FC<Props> = ({
  confidence,
  clarity,
  accuracy,
  speed,
  improvements,
}) => {
  return (
    <div className="bg-white p-5 shadow rounded-xl">
      <h3 className="text-xl font-bold mb-3 text-black">AI Feedback Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard label="Confidence" value={confidence} />
        <ScoreCard label="Clarity" value={clarity} />
        <ScoreCard label="Technical Accuracy" value={accuracy} />
        <ScoreCard label="Speed" value={speed} />
      </div>

      <h4 className="text-lg font-semibold mt-5 text-black">Suggested Improvements</h4>
      <ul className="list-disc pl-5 text-blue-600">
        {improvements.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackScore;
