import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyInput, MonthlyPayment, InvestmentAnalysis, AnalysisStep } from '@/types/property';

export function usePropertyAnalysis() {
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeProperty = async (
    propertyInput: PropertyInput,
    monthlyPayment: MonthlyPayment | null
  ): Promise<InvestmentAnalysis | null> => {
    setAnalysisStep('fetching-listing');
    setAnalysis(null);
    setError(null);

    try {
      // Simulate the step progression for better UX
      await simulateDelay(800);
      setAnalysisStep('analyzing-safety');
      
      await simulateDelay(600);
      setAnalysisStep('analyzing-demographics');
      
      await simulateDelay(500);
      setAnalysisStep('calculating-score');

      // Call the edge function
      const { data, error: functionError } = await supabase.functions.invoke('analyze-property', {
        body: { propertyInput, monthlyPayment }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      setAnalysisStep('complete');
      return data;

    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      setError(errorMessage);
      setAnalysisStep('error');
      return null;
    }
  };

  const reset = () => {
    setAnalysisStep('idle');
    setAnalysis(null);
    setError(null);
  };

  return {
    analysisStep,
    analysis,
    error,
    analyzeProperty,
    reset,
  };
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
