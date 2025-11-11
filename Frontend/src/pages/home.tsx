import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, Clock, Award, ChevronRight, Menu, X } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  step: string;
  title: string;
  desc: string;
}

const AIInterviewPlatform: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features: Feature[] = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Questions",
      description: "Dynamic questions adapted to your skill level and role"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Feedback",
      description: "Get real-time analysis and improvement suggestions"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Role-Specific Prep",
      description: "Tailored scenarios for your target position"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Practice Anytime",
      description: "24/7 access to unlimited mock interviews"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed insights"
    }
  ];

  const steps: Step[] = [
    { step: "01", title: "Choose Your Role", desc: "Select the job position you're preparing for" },
    { step: "02", title: "Practice Interview", desc: "Answer AI-generated questions in real-time" },
    { step: "03", title: "Get Feedback", desc: "Receive detailed analysis and improvement tips" }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-900 to-gray-400 from-blue-900  text-white **overflow-x-hidden**">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-xl' : 'bg-slate-900/80 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-gray-400 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r  from-blue-500 to-gray-400 bg-clip-text text-transparent">
                InterviewAI
              </span>
            </div>
                        
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-gray-200 hover:text-blue-400 transition-colors font-medium">
                Home
              </a>
              <a href="#about" className="text-gray-200 hover:text-blue-400 transition-colors font-medium">
                About
              </a>
              <a href="#features" className="text-gray-200 hover:text-blue-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-200 hover:text-blue-400 transition-colors font-medium">
                How It Works
              </a>
              <button className="px-6 py-2.5 rounded-lg border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 transition-all font-medium">
                Sign In
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-900 transition-all shadow-lg shadow-blue-500/30 font-medium">
                Sign Up
              </button>
            </div>
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-900/98 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3 max-w-7xl mx-auto">
              <a 
                href="#home" 
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-blue-500/10 hover:text-blue-400 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="#about" 
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-blue-500/10 hover:text-blue-400 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#features" 
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-blue-500/10 hover:text-blue-400 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-blue-500/10 hover:text-blue-400 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <button className="w-full py-3 rounded-lg border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 transition-all font-medium">
                Sign In
              </button>
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-gray-500 hover:from-blue-600 hover:to-gray-600 transition-all font-medium">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/50">
            <span className="text-sm font-semibold text-blue-300">✨ AI-Powered Interview Practice</span>
          </div>
                    
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Master Your Next
            <span className="block bg-gradient-to-r from-blue-500 via-gray-400 to-blue-500 bg-clip-text text-transparent">
              Interview with AI
            </span>
          </h1>
                    
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Practice with our intelligent AI interviewer, get instant feedback, and land your dream job with confidence.
          </p>
                    
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-gray-500 hover:from-blue-600 hover:to-blue-500 transition shadow-lg shadow-blue-500/50 flex items-center gap-2 text-lg font-semibold">
              Start Free Trial
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-blue-400 hover:bg-blue-400/10 transition text-lg font-semibold">
              Watch Demo
            </button>
          </div>
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-400">Successful Interviews</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-400">AI Availability</div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                About InterviewAI
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                We're revolutionizing interview preparation with cutting-edge AI technology. Our platform helps candidates practice, learn, and succeed in their job interviews.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                Founded by industry experts and powered by advanced machine learning, InterviewAI provides personalized interview experiences that adapt to your unique needs and goals.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Advanced AI interview simulations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-300">Personalized feedback and coaching</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Industry-leading success rates</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-gray-900/50 rounded-2xl p-8 border border-gray-200/30">
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">2020</div>
                  <div className="text-gray-400">Founded</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-500 mb-2">50K+</div>
                  <div className="text-gray-400">Happy Users</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                  <div className="text-gray-400">Companies Trust Us</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Choose InterviewAI?
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to ace your next interview
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: Feature, index: number) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-900/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-blue-500/20 hover:border-gray-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-blue-500 to-gray-400 w-16 h-16 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item: Step, index: number) => (
              <div key={index} className="relative text-center">
                <div className="text-7xl font-bold text-blue-500/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-12 -right-12 w-8 h-8 text-blue-500/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900/50 to-blue-700/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of successful candidates who prepared with InterviewAI
          </p>
          <button className="px-10 py-5 rounded-lg bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-900 transition shadow-lg shadow-blue-500/50 text-lg font-semibold">
            Start Your Free Trial Today
          </button>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">InterviewAI</span>
          </div>
          <p>&copy; 2025 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AIInterviewPlatform;