import { useState, useCallback } from 'react';
import { Building2, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { PropertyInputForm } from '@/components/PropertyInputForm';
import { MonthlyPaymentCalculator } from '@/components/MonthlyPaymentCalculator';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisResults } from '@/components/AnalysisResults';
import { useToast } from '@/hooks/use-toast';
import { usePropertyAnalysis } from '@/hooks/usePropertyAnalysis';
import type { PropertyInput, MonthlyPayment } from '@/types/property';

const Index = () => {
  const { toast } = useToast();
  const [propertyInput, setPropertyInput] = useState<PropertyInput | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<MonthlyPayment | null>(null);
  
  const { analysisStep, analysis, error, analyzeProperty, reset } = usePropertyAnalysis();

  const handlePaymentChange = useCallback((payment: MonthlyPayment) => {
    setMonthlyPayment(payment);
  }, []);

  const handleSubmit = async (data: PropertyInput) => {
    setPropertyInput(data);

    const result = await analyzeProperty(data, monthlyPayment);
    
    if (result) {
      toast({
        title: "Analysis Complete",
        description: `Investment score: ${result.overallScore}% - ${result.verdict}`,
      });
    } else if (error) {
      toast({
        title: "Analysis Failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    reset();
    setPropertyInput(null);
  };

  const isAnalyzing = ['fetching-listing', 'analyzing-safety', 'analyzing-demographics', 'calculating-score'].includes(analysisStep);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">PropertyIQ</h1>
              <p className="text-xs text-muted-foreground">Investment Analysis Engine</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {analysisStep === 'idle' && !analysis && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Make Smarter{' '}
                <span className="text-gradient">Real Estate</span>{' '}
                Decisions
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI-powered investment analysis that evaluates properties across financial, 
                location, market, condition, and exit factors to give you a clear score.
              </p>
              
              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                {[
                  { icon: TrendingUp, label: 'Deal Economics' },
                  { icon: Shield, label: 'Safety Analysis' },
                  { icon: BarChart3, label: 'Market Data' },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full text-sm text-muted-foreground"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    {feature.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {analysisStep === 'idle' || isAnalyzing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Property Details
                </h3>
                <PropertyInputForm onSubmit={handleSubmit} isLoading={isAnalyzing} />
              </div>

              {/* Right column - Payment Calculator or Progress */}
              <div className="space-y-6">
                {isAnalyzing ? (
                  <AnalysisProgress currentStep={analysisStep} />
                ) : propertyInput ? (
                  <MonthlyPaymentCalculator
                    purchasePrice={propertyInput.purchasePrice}
                    downPayment={propertyInput.downPaymentAmount}
                    onPaymentChange={handlePaymentChange}
                  />
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Enter Property Details
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Fill out the form to see a detailed monthly payment breakdown 
                      and comprehensive investment analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Results */}
              <div className="lg:col-span-2">
                <AnalysisResults analysis={analysis} />
              </div>

              {/* Sidebar - New Analysis */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Monthly Payment</h3>
                  <MonthlyPaymentCalculator
                    purchasePrice={propertyInput!.purchasePrice}
                    downPayment={propertyInput!.downPaymentAmount}
                    initialPropertyTaxRate={analysis.listingData?.propertyTaxRate}
                    initialUtilities={analysis.listingData?.estimatedUtilities}
                    onPaymentChange={handlePaymentChange}
                  />
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-3 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-colors"
                >
                  Analyze Another Property
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>PropertyIQ is for informational purposes only. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
