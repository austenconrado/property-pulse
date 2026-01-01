import { CheckCircle2, AlertTriangle, Info, Building2, Shield, Users } from 'lucide-react';
import { InvestmentScoreChart } from './InvestmentScoreChart';
import { ScoreBreakdown } from './ScoreBreakdown';
import type { InvestmentAnalysis } from '@/types/property';

interface AnalysisResultsProps {
  analysis: InvestmentAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Score Visualization */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-1">
          <div className="bg-card rounded-xl">
            <InvestmentScoreChart 
              score={analysis.overallScore} 
              verdict={analysis.verdict}
            />
          </div>
        </div>
      </div>

      {/* Listing Summary */}
      {analysis.listingData && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Property Details</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Address</span>
              <p className="font-medium text-foreground">{analysis.listingData.address}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Listing Price</span>
              <p className="font-medium text-foreground">{formatCurrency(analysis.listingData.listingPrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Square Footage</span>
              <p className="font-medium text-foreground">{analysis.listingData.squareFootage.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-muted-foreground">Property Type</span>
              <p className="font-medium text-foreground">{analysis.listingData.propertyType}</p>
            </div>
            {analysis.listingData.hoaFees > 0 && (
              <div>
                <span className="text-muted-foreground">HOA Fees</span>
                <p className="font-medium text-foreground">{formatCurrency(analysis.listingData.hoaFees)}/mo</p>
              </div>
            )}
            {analysis.listingData.greatSchoolsRating && (
              <div>
                <span className="text-muted-foreground">School Rating</span>
                <p className="font-medium text-foreground">{analysis.listingData.greatSchoolsRating}/10</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety & Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.safetyData && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Neighborhood Safety</h3>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
              analysis.safetyData.classification === 'Safe' 
                ? 'bg-success/20 text-success'
                : analysis.safetyData.classification === 'Moderately Safe'
                ? 'bg-warning/20 text-warning'
                : 'bg-danger/20 text-danger'
            }`}>
              {analysis.safetyData.classification}
            </div>
            <p className="text-sm text-muted-foreground">
              {analysis.safetyData.incidentCount} incidents reported in the last {analysis.safetyData.recency}
            </p>
          </div>
        )}

        {analysis.demographicsData && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Demographics</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Median Income</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(analysis.demographicsData.medianHouseholdIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Homeownership</span>
                <span className="font-medium text-foreground">
                  {(analysis.demographicsData.homeownershipRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Median Home Value</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(analysis.demographicsData.medianHomeValue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="bg-card border border-border rounded-xl p-6">
        <ScoreBreakdown scores={analysis.categoryScores} />
      </div>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-success/5 border border-success/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-foreground">Key Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-danger/5 border border-danger/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h3 className="font-semibold text-foreground">Key Risks</h3>
          </div>
          <ul className="space-y-2">
            {analysis.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Analysis Summary</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {analysis.explanation}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> This analysis is for informational and educational purposes only. 
        It does not constitute financial, legal, or investment advice. Always consult with qualified 
        professionals before making investment decisions. Crime and demographic data are historical 
        and may not reflect current conditions.
      </div>
    </div>
  );
}
