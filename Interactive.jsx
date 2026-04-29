import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import StepIndicator from '@/components/interactive/StepIndicator';
import Step0Input from '@/components/interactive/Step0Input';
import Step1Padding from '@/components/interactive/Step1Padding';
import Step2Blocks from '@/components/interactive/Step2Blocks';
import Step3Schedule from '@/components/interactive/Step3Schedule';
import Step4Compression from '@/components/interactive/Step4Compression';
import Step5Final from '@/components/interactive/Step5Final';

export default function Interactive() {
  const location = useLocation();
  const startStep = location.state?.startStep ?? 0;
  const [currentStep, setCurrentStep] = useState(startStep);
  const [completedSteps, setCompletedSteps] = useState(() => {
    // Mark all steps before startStep as completed so navigation works
    const s = new Set();
    for (let i = 0; i < startStep; i++) s.add(i);
    return s;
  });
  const [message, setMessage] = useState('hello');

  const completeStep = (stepNum) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepNum);
      return next;
    });
    setCurrentStep(stepNum + 1);
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleInputComplete = (msg) => {
    setMessage(msg);
    // Reset downstream steps since input changed
    setCompletedSteps(new Set());
    completeStep(0);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-black mb-2">Interactive Hasher</h1>
        <p className="text-muted-foreground text-sm">
          Walk through every step of SHA-256, from raw input to final digest.
        </p>
      </motion.div>

      <div className="mb-8">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {currentStep === 0 && (
        <Step0Input onComplete={handleInputComplete} initialValue={message} />
      )}
      {currentStep === 1 && (
        <Step1Padding
          message={message}
          onComplete={() => completeStep(1)}
          onBack={() => goToStep(0)}
        />
      )}
      {currentStep === 2 && (
        <Step2Blocks
          message={message}
          onComplete={() => completeStep(2)}
          onBack={() => goToStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Schedule
          message={message}
          onComplete={() => completeStep(3)}
          onBack={() => goToStep(2)}
        />
      )}
      {currentStep === 4 && (
        <Step4Compression
          message={message}
          onComplete={() => completeStep(4)}
          onBack={() => goToStep(3)}
        />
      )}
      {currentStep === 5 && (
        <Step5Final
          message={message}
          onBack={() => goToStep(4)}
        />
      )}
    </div>
  );
}
