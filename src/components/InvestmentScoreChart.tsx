import { useEffect, useState } from 'react';

interface InvestmentScoreChartProps {
  score: number;
  verdict: string;
  isAnimating?: boolean;
}

export function InvestmentScoreChart({ score, verdict, isAnimating = true }: InvestmentScoreChartProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    if (!isAnimating) {
      setDisplayScore(score);
      return;
    }

    let current = 0;
    const increment = score / 60; // Animate over ~1 second at 60fps
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score, isAnimating]);

  // SVG circle calculations
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const offset = circumference - progress;

  // Color based on score
  const getScoreColor = () => {
    if (score >= 85) return 'hsl(var(--success))';
    if (score >= 70) return 'hsl(var(--chart-3))';
    if (score >= 55) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  const getVerdictColor = () => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-accent';
    if (score >= 55) return 'text-warning';
    return 'text-danger';
  };

  const getVerdictBg = () => {
    if (score >= 85) return 'bg-success/20';
    if (score >= 70) return 'bg-accent/20';
    if (score >= 55) return 'bg-warning/20';
    return 'bg-danger/20';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Radial Chart */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${getScoreColor()})`,
            }}
          />
          
          {/* Glow effect */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={strokeWidth + 8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity={0.2}
            className="transition-all duration-1000 ease-out blur-sm"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-foreground">
            {displayScore}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            Investment Score
          </span>
        </div>
      </div>

      {/* Verdict label */}
      <div className={`mt-6 px-6 py-2 rounded-full ${getVerdictBg()}`}>
        <span className={`font-semibold ${getVerdictColor()}`}>
          {verdict}
        </span>
      </div>

      {/* Text fallback for accessibility */}
      <p className="sr-only">
        Investment score: {score}%. Verdict: {verdict}
      </p>
    </div>
  );
}
