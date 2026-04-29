import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const stepLabels = [
  'Input',
  'Padding',
  'Parse Blocks',
  'Message Schedule',
  'Compression',
  'Final Hash',
];

export default function StepIndicator({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {stepLabels.map((label, i) => {
        const isCompleted = completedSteps.has(i);
        const isCurrent = currentStep === i;
        const isAccessible = isCompleted || isCurrent;

        return (
          <button
            key={i}
            onClick={() => isAccessible && onStepClick(i)}
            disabled={!isAccessible}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isCurrent
                ? 'bg-primary/10 text-primary border border-primary/30'
                : isCompleted
                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                : 'text-muted-foreground/50 cursor-not-allowed'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isCurrent ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground/50'
            }`}>
              {isCompleted ? <Check className="w-3 h-3" /> : !isAccessible ? <Lock className="w-2.5 h-2.5" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
