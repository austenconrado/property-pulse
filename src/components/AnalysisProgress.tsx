import { Check, Loader2, Circle } from 'lucide-react';
import type { AnalysisStep } from '@/types/property';

interface AnalysisProgressProps {
  currentStep: AnalysisStep;
}

const steps = [
  { key: 'fetching-listing', label: 'Fetching listing data' },
  { key: 'analyzing-safety', label: 'Analyzing neighborhood safety' },
  { key: 'analyzing-demographics', label: 'Gathering demographics' },
  { key: 'calculating-score', label: 'Calculating investment score' },
];

export function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-6">Analyzing Your Property</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = currentIndex > index || currentStep === 'complete';
          const isCurrent = currentStep === step.key;
          const isPending = currentIndex < index && currentStep !== 'complete';

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                isCurrent ? 'bg-primary/10' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isComplete 
                  ? 'bg-success text-success-foreground' 
                  : isCurrent 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              
              <span className={`text-sm transition-colors duration-300 ${
                isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>

              {isCurrent && (
                <div className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
