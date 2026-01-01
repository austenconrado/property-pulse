import { TrendingUp, MapPin, BarChart3, Wrench, LogOut } from 'lucide-react';
import type { CategoryScore } from '@/types/property';

interface ScoreBreakdownProps {
  scores: CategoryScore[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Deal Economics': <TrendingUp className="w-4 h-4" />,
  'Location': <MapPin className="w-4 h-4" />,
  'Market': <BarChart3 className="w-4 h-4" />,
  'Condition': <Wrench className="w-4 h-4" />,
  'Exit': <LogOut className="w-4 h-4" />,
};

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-success';
    if (score >= 6) return 'bg-accent';
    if (score >= 4) return 'bg-warning';
    return 'bg-danger';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-accent';
    if (score >= 4) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground mb-4">Category Breakdown</h3>
      
      {scores.map((category, index) => (
        <div
          key={category.name}
          className="bg-secondary/30 rounded-lg p-4 space-y-3 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                {categoryIcons[category.name] || <BarChart3 className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({(category.weight * 100).toFixed(0)}% weight)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getScoreTextColor(category.score)}`}>
                {category.score.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreColor(category.score)} transition-all duration-700 ease-out rounded-full`}
              style={{ width: `${(category.score / 10) * 100}%` }}
            />
          </div>

          {/* Reasoning */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {category.reasoning}
          </p>

          {/* Weighted contribution */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span>Weighted contribution</span>
            <span className="font-medium text-foreground">
              +{category.weightedScore.toFixed(1)} pts
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
