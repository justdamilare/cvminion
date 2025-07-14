import React from 'react';
import { Target, FileText, Sparkles, Trophy, Clock } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { FeatureCard } from './FeatureCard';
import { Logo } from '../ui/Logo';

const features = [
  {
    icon: <Logo className="w-8 h-8" />,
    title: "Smart Resume Generation",
    description: "Our AI analyzes job descriptions and tailors your resume to match requirements perfectly."
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "ATS Optimization",
    description: "Get real-time feedback and optimize your resume to pass Applicant Tracking Systems."
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Smart Tracking",
    description: "Track applications, interviews, and follow-ups in one organized dashboard."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "AI Keywords",
    description: "Automatically extract and include relevant keywords from job descriptions."
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: "Success Rate",
    description: "95% of our users report higher interview success rates."
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Time Saving",
    description: "Create tailored resumes in minutes, not hours."
  }
];

export const Features = () => {
  return (
    <div className="py-20">
      <FadeIn className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Powered by <span className="gradient-text">Intelligence</span>
        </h2>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Our AI-powered platform helps you create perfect resumes for every job application
        </p>
      </FadeIn>
      
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <FeatureCard {...feature} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
};