import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyInput {
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

interface MonthlyPayment {
  principalAndInterest: number;
  mortgageInsurance: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoaFees: number;
  utilities: number;
  total: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyInput, monthlyPayment } = await req.json() as {
      propertyInput: PropertyInput;
      monthlyPayment: MonthlyPayment | null;
    };

    console.log("Analyzing property:", propertyInput.state, propertyInput.propertyType);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the analysis prompt with all property data
    const analysisPrompt = buildAnalysisPrompt(propertyInput, monthlyPayment);

    console.log("Calling AI for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert real estate investment analyst. You analyze properties using a weighted scoring framework across 5 categories:

1. Deal Economics (35% weight): Affordability, cash burden, leverage, monthly payment ratio
2. Location (25% weight): Safety, desirability, amenities, school ratings
3. Market (15% weight): Demand, income levels, stability, appreciation potential
4. Condition (15% weight): Property quality, age, maintenance risk
5. Exit (10% weight): Resale or rental flexibility, buyer/renter appeal

Score each category from 1-10, then calculate the final percentage score.

Score Interpretation:
- 85-100%: Strong Buy
- 70-84%: Good Opportunity
- 55-69%: Proceed Carefully
- Below 55%: Do Not Invest

You must respond with valid JSON only, no markdown or code blocks.`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "investment_analysis",
              description: "Return a comprehensive real estate investment analysis",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "number",
                    description: "Overall investment score as percentage (0-100)"
                  },
                  verdict: {
                    type: "string",
                    enum: ["Strong Buy", "Good Opportunity", "Proceed Carefully", "Do Not Invest"]
                  },
                  categoryScores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number", description: "Score from 1-10" },
                        weight: { type: "number" },
                        weightedScore: { type: "number" },
                        reasoning: { type: "string" }
                      },
                      required: ["name", "score", "weight", "weightedScore", "reasoning"]
                    }
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 key investment strengths"
                  },
                  risks: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 key risks or red flags"
                  },
                  explanation: {
                    type: "string",
                    description: "Plain-language summary of the analysis"
                  },
                  listingData: {
                    type: "object",
                    properties: {
                      address: { type: "string" },
                      listingPrice: { type: "number" },
                      propertyType: { type: "string" },
                      squareFootage: { type: "number" },
                      hoaFees: { type: "number" },
                      propertyTaxEstimate: { type: "number" },
                      greatSchoolsRating: { type: "number", nullable: true },
                      yearBuilt: { type: "number", nullable: true },
                      lotSize: { type: "string", nullable: true }
                    },
                    required: ["address", "listingPrice", "propertyType", "squareFootage", "hoaFees", "propertyTaxEstimate"]
                  },
                  safetyData: {
                    type: "object",
                    properties: {
                      incidentCount: { type: "number" },
                      crimeTypes: { type: "array", items: { type: "string" } },
                      recency: { type: "string" },
                      classification: { type: "string", enum: ["Safe", "Moderately Safe", "High Risk"] }
                    },
                    required: ["incidentCount", "crimeTypes", "recency", "classification"]
                  },
                  demographicsData: {
                    type: "object",
                    properties: {
                      medianHouseholdIncome: { type: "number" },
                      populationDensity: { type: "number" },
                      homeownershipRatio: { type: "number" },
                      medianHomeValue: { type: "number" },
                      employmentRate: { type: "number" }
                    },
                    required: ["medianHouseholdIncome", "populationDensity", "homeownershipRatio", "medianHomeValue", "employmentRate"]
                  }
                },
                required: ["overallScore", "verdict", "categoryScores", "strengths", "risks", "explanation", "listingData", "safetyData", "demographicsData"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "investment_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "investment_analysis") {
      throw new Error("Invalid AI response format");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    // Add the monthly payment to the analysis
    analysis.monthlyPayment = monthlyPayment || {
      principalAndInterest: 0,
      mortgageInsurance: 0,
      propertyTaxes: 0,
      homeownersInsurance: 0,
      hoaFees: 0,
      utilities: 0,
      total: 0,
    };

    console.log("Analysis complete, score:", analysis.overallScore);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-property function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An error occurred during analysis" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAnalysisPrompt(input: PropertyInput, payment: MonthlyPayment | null): string {
  const monthlyPaymentInfo = payment ? `
Monthly Payment Breakdown:
- Principal & Interest: $${payment.principalAndInterest.toLocaleString()}
- Mortgage Insurance (PMI): $${payment.mortgageInsurance.toLocaleString()}
- Property Taxes: $${payment.propertyTaxes.toLocaleString()}
- Homeowners Insurance: $${payment.homeownersInsurance.toLocaleString()}
- HOA Fees: $${payment.hoaFees.toLocaleString()}
- Utilities: $${payment.utilities.toLocaleString()}
- Total Monthly: $${payment.total.toLocaleString()}
` : '';

  const housingRatio = payment ? ((payment.total * 12) / input.yearlyIncome * 100).toFixed(1) : 'N/A';
  const downPaymentPercent = input.downPaymentPercentage.toFixed(1);

  return `Analyze this residential property investment:

Property Details:
- State: ${input.state}
- Listing URL: ${input.listingUrl}
- Property Type: ${input.propertyType}
- Bedrooms: ${input.bedrooms}
- Bathrooms: ${input.bathrooms}
- Purchase Price: $${input.purchasePrice.toLocaleString()}

Financial Details:
- Buyer's Yearly Income: $${input.yearlyIncome.toLocaleString()}
- Down Payment: $${input.downPaymentAmount.toLocaleString()} (${downPaymentPercent}%)
- Loan Amount: $${(input.purchasePrice - input.downPaymentAmount).toLocaleString()}
${monthlyPaymentInfo}

Key Metrics:
- Housing Cost to Income Ratio: ${housingRatio}%
- Down Payment Percentage: ${downPaymentPercent}%
- PMI Required: ${input.downPaymentPercentage < 20 ? 'Yes' : 'No'}

Based on typical data for ${input.state}, provide a comprehensive investment analysis. Generate realistic estimates for:
1. Property details (square footage, year built, etc. based on the property type and price point)
2. Safety data (typical crime statistics for the area)
3. Demographics data (income levels, homeownership rates, etc.)

Score each of the 5 categories and calculate the overall investment score.`;
}
