// components/physical-assessments/components/comparisonOverview.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowRightCircle 
} from "lucide-react";
import { ComparisonData } from '@/components/physical-assessments/types/assessment-comparison';

interface ComparisonOverviewProps {
  comparisonData: ComparisonData[];
}

export function ComparisonOverview({ comparisonData }: ComparisonOverviewProps) {
  
  const getTrendIcon = (change: number, improvement: string) => {
    if (Math.abs(change) < 0.01) return <ArrowRightCircle className="h-4 w-4 sm:h-5 sm:w-5 text-app-text-muted" />;
    
    if (improvement === 'positive') {
      return <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
    } else if (improvement === 'negative') {
      return <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    } else {
      return change > 0 ? 
        <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-app-achievement-consecutive" /> : 
        <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-app-achievement-consecutive" />;
    }
  };

  const getTrendColor = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-app-achievement-consecutive';
    }
  };

  const getComparisonGradient = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'from-green-600 to-emerald-600';
      case 'negative': return 'from-red-600 to-pink-600';
      default: return 'from-app-achievement-consecutive to-app-btn-secondary';
    }
  };

  const getComparisonCardGradient = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'negative': return 'from-red-500 to-pink-500';
      default: return 'from-app-achievement-consecutive to-app-btn-secondary';
    }
  };

  return (
    <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {comparisonData.map((comparison) => (
        <div key={comparison.metric} className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${getComparisonGradient(comparison.improvement)} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          <Card className="relative border-0 bg-app-bg-card/90 backdrop-blur-xl shadow-app-medium hover:shadow-app-xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
            
            {/* Animated gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getComparisonCardGradient(comparison.improvement)} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="absolute inset-[1px] bg-app-bg-card rounded-xl sm:rounded-2xl"></div>

            <CardContent className="relative p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${getComparisonCardGradient(comparison.improvement)} rounded-lg sm:rounded-xl text-white shadow-app-medium`}>
                    {comparison.icon}
                  </div>
                  <span className="font-bold text-base sm:text-lg text-app-text-heading group-hover:text-app-achievement-workout transition-colors">
                    {comparison.label}
                  </span>
                </div>
                <div className="p-1.5 sm:p-2 bg-app-bg-secondary rounded-lg sm:rounded-xl">
                  {getTrendIcon(comparison.change, comparison.improvement)}
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-app-text-secondary">Atual</span>
                  <span className="text-xl sm:text-2xl font-black text-app-text-heading">
                    {comparison.current.toFixed(2)}{comparison.unit}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-semibold text-app-text-secondary">Anterior</span>
                  <span className="text-base sm:text-lg font-bold text-app-text-secondary">
                    {comparison.previous.toFixed(2)}{comparison.unit}
                  </span>
                </div>
                
                <div className="border-t border-app-border-muted pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-bold">Variação</span>
                    <div className="text-right">
                      <div className={`text-lg sm:text-xl font-black ${getTrendColor(comparison.improvement)}`}>
                        {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(2)}{comparison.unit}
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ${getTrendColor(comparison.improvement)}`}>
                        {comparison.changePercentage > 0 ? '+' : ''}{comparison.changePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}