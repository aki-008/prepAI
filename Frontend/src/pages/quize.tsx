import React from "react";
import { FileText, FileSpreadsheet, Code2, ListChecks, UploadCloud, Type } from "lucide-react";

// The structure of this component is heavily modified to meet the new layout requirements.
const ResumeGeneratedQuize: React.FC = () => {

    // Consistent purple button style
    const buttonClass = "w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 font-medium transition shadow-lg shadow-blue-500/30 text-white mt-4";

    const OutputTypeOption = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
        // These cards inherently take full width of their parent container (which is now the right column)
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:bg-slate-800/60 transition cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h4 className="text-xl font-semibold text-gray-50">{title}</h4>
            </div>
            <p className="text-gray-400 text-sm">{desc}</p>
        </div>
    );

    const SourceCard = ({ icon, title, desc, actionText }: { icon: React.ReactNode; title: string; desc: string; actionText: string }) => (
        <div className="p-6 bg-slate-900/60 rounded-2xl shadow-xl border border-slate-700 hover:bg-slate-800/70 transition flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
                {icon}
                <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-gray-400 mt-1 text-sm">{desc}</p>
                </div>
            </div>
            {/* The SourceCard button width is intentionally set to w-fit px-6 to be narrower */}
            <button className={buttonClass.replace('w-full', 'w-fit px-6')} >
                {actionText}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white py-20 px-6 lg:px-12">

            {/* Page Title */}
            <h1 className="text-4xl font-bold mb-16 text-center">
                Smart AI-Powered Quiz Generator
            </h1>

            {/* ===== MAIN TWO-COLUMN LAYOUT (Source Selection vs. Configuration) ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* --- LEFT SIDE: INPUT SOURCE SELECTION --- */}
                <div>
                    <h3 className="text-3xl font-bold mb-6 text-gray-100 border-b border-blue-700 pb-2">
                        1. Select Quiz Source
                    </h3>
                    <div className="space-y-8">
                        {/* Consolidated Resume/Note PDF Upload Card */}
                        <SourceCard
                            icon={<FileSpreadsheet className="w-8 h-8 text-cyan-400" />}
                            title="Resume/Note PDF Upload"
                            desc="Generate quizzes based on skills and experience listed in your resume file."
                            actionText="Upload"
                        />
                    </div>
                </div>


                {/* --- RIGHT SIDE: PROMPT & OUTPUT CONFIGURATION (The full width section) --- */}
                <div className="lg:sticky lg:top-8 self-start">
                    <h3 className="text-3xl font-bold mb-6 text-gray-100 border-b border-blue-700 pb-2">
                        2. Configure & Generate
                    </h3>

                    {/* Prompt/Text Area Section */}
                    <div className="bg-slate-900/60 rounded-2xl shadow-2xl p-6 border border-slate-800 mb-8">
                        <label htmlFor="prompt-area" className="text-lg font-semibold block mb-3 text-gray-200">
                            Custom Prompt/Instructions (Optional)
                        </label>
                        <textarea
                            id="prompt-area"
                            rows={4}
                            placeholder="e.g., 'Focus only on Python and OOP concepts' or 'Generate a quiz on the content uploaded in step 1'"
                            className="w-full p-3 rounded-lg bg-black/40 border border-slate-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                        ></textarea>
                        <p className="text-gray-500 text-sm mt-2">
                            This prompt refines the quiz generation based on the selected source.
                        </p>
                    </div>

                    {/* Output Type Section - NOW CORRECTLY PLACED INSIDE THE RIGHT COLUMN */}
                </div>

            </div>

            <div className="lg:sticky lg:top-8 self-start">
                <h4 className="text-2xl font-semibold mb-4 text-gray-200">
                    Choose Output Type:
                </h4>

                {/* NEW: Use grid-cols-2 and gap-4 to place the options side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* MCQ Quiz Option - takes full width of its column */}
                    <OutputTypeOption
                        icon={<ListChecks className="w-6 h-6 text-blue-400" />}
                        title="Multiple Choice Quiz (MCQ)"
                        desc="Ideal for quick assessment of knowledge and comprehension."
                    />

                    {/* Coding Quiz Option - takes full width of its column */}
                    <OutputTypeOption
                        icon={<Code2 className="w-6 h-6 text-blue-400" />}
                        title="Coding Challenge Quiz"
                        desc="Generates problems requiring code snippets or full functions for evaluation."
                    />
                </div>

                {/* Main Generation Button - Full width (w-full is in buttonClass) */}
                <button className={buttonClass + ' text-xl mt-8'}>
                    Generate Quiz Now
                </button>

            </div>
        </div>
    );
};

export default ResumeGeneratedQuize;