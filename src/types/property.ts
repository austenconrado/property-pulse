export interface PropertyInput {
  state: string;
  listingUrl: string;
  purchasePrice: number;
  yearlyIncome: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  downPaymentAmount: number;
  downPaymentPercentage: number;
}

export interface MonthlyPayment {
  principalAndInterest: number;
  mortgageInsurance: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoaFees: number;
  utilities: number;
  total: number;
}

export interface ListingData {
  address: string;
  listingPrice: number;
  propertyType: string;
  squareFootage: number;
  hoaFees: number;
  propertyTaxEstimate: number;
  greatSchoolsRating: number | null;
  yearBuilt: number | null;
  lotSize: string | null;
}

export interface SafetyData {
  incidentCount: number;
  crimeTypes: string[];
  recency: string;
  classification: 'Safe' | 'Moderately Safe' | 'High Risk';
}

export interface DemographicsData {
  medianHouseholdIncome: number;
  populationDensity: number;
  homeownershipRatio: number;
  medianHomeValue: number;
  employmentRate: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  reasoning: string;
}

export interface InvestmentAnalysis {
  overallScore: number;
  verdict: 'Strong Buy' | 'Good Opportunity' | 'Proceed Carefully' | 'Do Not Invest';
  categoryScores: CategoryScore[];
  strengths: string[];
  risks: string[];
  explanation: string;
  monthlyPayment: MonthlyPayment;
  listingData: ListingData;
  safetyData: SafetyData | null;
  demographicsData: DemographicsData | null;
}

export type AnalysisStep = 
  | 'idle'
  | 'fetching-listing'
  | 'analyzing-safety'
  | 'analyzing-demographics'
  | 'calculating-score'
  | 'complete'
  | 'error';
