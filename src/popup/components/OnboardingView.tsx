import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to MonoTaskr',
    description: 'Boost your productivity by focusing on one task at a time.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Block Distractions',
    description: 'Choose websites to block during your focus sessions.',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Track Progress',
    description: 'Earn XP and badges as you complete sessions.',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Ready to Focus?',
    description: "Let's start your first session now.",
    color: 'bg-green-100 text-green-600'
  }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background animate-in fade-in duration-500">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-8 shadow-inner ${steps[currentStep].color} transition-colors duration-300`}
        >
          {currentStep + 1}
        </div>

        <div className="space-y-4 max-w-[280px]">
          <h2 className="text-3xl font-bold tracking-tight text-foreground transition-all duration-300 transform">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      <div className="p-8 w-full bg-background border-t">
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
            />
          ))}
        </div>

        <Button size="lg" className="w-full text-lg font-semibold h-14" onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <span className="flex items-center gap-2">
              Let's Go <Check className="w-5 h-5" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Next <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
