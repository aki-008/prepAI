import React from "react";

const ResumeGeneratedQuize: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">AI Generated Quiz</h2>
            <p className="text-gray-600">
                Create intelligent quizzes using AI-generated questions based on your learning progress.
            </p>
            <h2 className="text-3xl font-bold mb-4">Resume-Based Quiz</h2>
            <p className="text-gray-600">Generate quizzes automatically based on your uploaded resume.</p>
            <h2 className="text-3xl font-bold mb-4">PDF-Based Quiz</h2>
            <p className="text-gray-600">
                Generate quizzes from your uploaded PDF documents to test topic understanding.
            </p>
        </div>
    );
};

export default ResumeGeneratedQuize;
