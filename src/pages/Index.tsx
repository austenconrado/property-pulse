import { useState, useCallback } from 'react';
import { Building2, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { PropertyInputForm } from '@/components/PropertyInputForm';
import { MonthlyPaymentCalculator } from '@/components/MonthlyPaymentCalculator';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { AnalysisResults } from '@/components/AnalysisResults';
import { useToast } from '@/hooks/use-toast';
import type { PropertyInput, MonthlyPayment, InvestmentAnalysis, AnalysisStep } from '@/types/property';

const Index = () => {
  const { toast } = useToast();
  const [propertyInput, setPropertyInput] = useState<PropertyInput | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<MonthlyPayment | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);

  const handlePaymentChange = useCallback((payment: MonthlyPayment) => {
    setMonthlyPayment(payment);
  }, []);

  const handleSubmit = async (data: PropertyInput) => {
    setPropertyInput(data);
    setAnalysisStep('fetching-listing');
    setAnalysis(null);

    // Simulate analysis steps for demo
    // In production, this would call actual APIs
    try {
      await simulateStep('fetching-listing', 1500);
      setAnalysisStep('analyzing-safety');
      
      await simulateStep('analyzing-safety', 1200);
      setAnalysisStep('analyzing-demographics');
      
      await simulateStep('analyzing-demographics', 1000);
      setAnalysisStep('calculating-score');
      
      await simulateStep('calculating-score', 1500);
      
      // Generate mock analysis result
      const mockAnalysis = generateMockAnalysis(data, monthlyPayment);
      setAnalysis(mockAnalysis);
      setAnalysisStep('complete');

      toast({
        title: "Analysis Complete",
        description: `Investment score: ${mockAnalysis.overallScore}% - ${mockAnalysis.verdict}`,
      });
    } catch (error) {
      setAnalysisStep('error');
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const simulateStep = (step: string, duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const generateMockAnalysis = (input: PropertyInput, payment: MonthlyPayment | null): InvestmentAnalysis => {
    // Mock scoring logic based on input
    const affordabilityRatio = payment ? (payment.total * 12) / input.yearlyIncome : 0.3;
    const downPaymentRatio = input.downPaymentPercentage / 100;

    const dealScore = Math.min(10, Math.max(1, 10 - affordabilityRatio * 15 + downPaymentRatio * 3));
    const locationScore = 7.5 + Math.random() * 2;
    const marketScore = 6.5 + Math.random() * 2.5;
    const conditionScore = 7 + Math.random() * 2;
    const exitScore = 6.5 + Math.random() * 3;

    const categoryScores = [
      { name: 'Deal Economics', score: dealScore, weight: 0.35, weightedScore: dealScore * 0.35, reasoning: `Monthly payment is ${(affordabilityRatio * 100).toFixed(0)}% of annual income. ${downPaymentRatio >= 0.2 ? 'Strong down payment eliminates PMI.' : 'Consider increasing down payment to eliminate PMI.'}` },
      { name: 'Location', score: locationScore, weight: 0.25, weightedScore: locationScore * 0.25, reasoning: `${input.state} market shows consistent demand. Proximity to amenities and employment centers is favorable.` },
      { name: 'Market', score: marketScore, weight: 0.15, weightedScore: marketScore * 0.15, reasoning: 'Local market indicators suggest moderate appreciation potential with stable rental demand.' },
      { name: 'Condition', score: conditionScore, weight: 0.15, weightedScore: conditionScore * 0.15, reasoning: `${input.propertyType} properties in this area typically maintain well with average maintenance costs.` },
      { name: 'Exit', score: exitScore, weight: 0.10, weightedScore: exitScore * 0.10, reasoning: `${input.bedrooms}BR/${input.bathrooms}BA configuration appeals to broad buyer/renter pool for future exit.` },
    ];

    const rawScore = categoryScores.reduce((sum, cat) => sum + cat.weightedScore, 0);
    const overallScore = Math.round((rawScore / 10) * 100);

    let verdict: InvestmentAnalysis['verdict'];
    if (overallScore >= 85) verdict = 'Strong Buy';
    else if (overallScore >= 70) verdict = 'Good Opportunity';
    else if (overallScore >= 55) verdict = 'Proceed Carefully';
    else verdict = 'Do Not Invest';

    return {
      overallScore,
      verdict,
      categoryScores,
      strengths: [
        'Favorable debt-to-income ratio for sustainable ownership',
        'Property type aligns well with local market demand',
        'Strong appreciation potential in the selected market',
      ],
      risks: [
        affordabilityRatio > 0.28 ? 'Monthly payment exceeds recommended 28% housing ratio' : 'Market volatility could affect short-term value',
        'Rising interest rates may impact refinancing options',
        'Property taxes in this area trend above national average',
      ],
      explanation: `Based on comprehensive analysis of deal economics, location quality, market conditions, property condition, and exit potential, this property scores ${overallScore}% on our weighted investment framework. ${verdict === 'Strong Buy' || verdict === 'Good Opportunity' ? 'The fundamentals support a positive investment thesis.' : 'Consider the identified risk factors carefully before proceeding.'}`,
      monthlyPayment: payment || {
        principalAndInterest: 0,
        mortgageInsurance: 0,
        propertyTaxes: 0,
        homeownersInsurance: 0,
        hoaFees: 0,
        utilities: 0,
        total: 0,
      },
      listingData: {
        address: '123 Main Street, ' + input.state,
        listingPrice: input.purchasePrice,
        propertyType: input.propertyType,
        squareFootage: 1800 + Math.floor(Math.random() * 800),
        hoaFees: input.propertyType === 'Condo' ? 350 : 0,
        propertyTaxEstimate: input.purchasePrice * 0.012 / 12,
        greatSchoolsRating: Math.floor(6 + Math.random() * 4),
        yearBuilt: 1990 + Math.floor(Math.random() * 30),
        lotSize: '0.25 acres',
      },
      safetyData: {
        incidentCount: Math.floor(5 + Math.random() * 20),
        crimeTypes: ['Property Crime', 'Vehicle Theft', 'Vandalism'],
        recency: '90 days',
        classification: Math.random() > 0.3 ? 'Safe' : 'Moderately Safe',
      },
      demographicsData: {
        medianHouseholdIncome: 65000 + Math.floor(Math.random() * 50000),
        populationDensity: 2500 + Math.floor(Math.random() * 3000),
        homeownershipRatio: 0.55 + Math.random() * 0.25,
        medianHomeValue: input.purchasePrice * (0.9 + Math.random() * 0.3),
        employmentRate: 0.92 + Math.random() * 0.06,
      },
    };
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
                    onPaymentChange={handlePaymentChange}
                  />
                </div>

                <button
                  onClick={() => {
                    setAnalysisStep('idle');
                    setAnalysis(null);
                    setPropertyInput(null);
                  }}
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
