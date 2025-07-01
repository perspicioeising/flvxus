'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Ruler, Zap, Sparkles, Activity, Target, X } from "lucide-react";
import { Assessment, MeasurementPoint, MEASUREMENT_DATA, safeNumber } from '@/components/physical-assessments/types/assessment-comparison';
import { HumanoidFigure } from '../humanoidFigure';

interface ComparisonMeasurementsProps {
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
  selectedMeasurement: MeasurementPoint | null;
  setSelectedMeasurement: (measurement: MeasurementPoint | null) => void;
  activeMeasurementCategory: 'circumferences' | 'skinfolds';
  setActiveMeasurementCategory: (category: 'circumferences' | 'skinfolds') => void;
  onMeasurementClick: (measurement: MeasurementPoint) => void;
}

export function ComparisonMeasurements({
  currentAssessment,
  selectedPreviousAssessment,
  selectedMeasurement,
  setSelectedMeasurement,
  activeMeasurementCategory,
  setActiveMeasurementCategory,
  onMeasurementClick
}: ComparisonMeasurementsProps) {

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-exercise/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-app-bg-card/80 backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-app-bg-accent/30 to-app-bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl shadow-app-medium">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Ruler className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-app-text-heading">
                Comparação de Medidas Corporais
              </CardTitle>
              <CardDescription className="text-app-text-secondary">
                Visualização interativa das mudanças corporais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            
            {/* Category Selector */}
            <CategorySelector
              activeCategory={activeMeasurementCategory}
              onCategoryChange={setActiveMeasurementCategory}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Humanoid Figure */}
              <div className="lg:col-span-1">
                <HumanoidContainer
                  currentAssessment={currentAssessment}
                  selectedPreviousAssessment={selectedPreviousAssessment}
                  activeCategory={activeMeasurementCategory}
                  onMeasurementClick={onMeasurementClick}
                />
              </div>

              {/* Measurements Grid */}
              <div className="lg:col-span-2">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {MEASUREMENT_DATA[activeMeasurementCategory].map((measurement, index) => {
                    const currentValue = currentAssessment.measurements?.[measurement.key];
                    const previousValue = selectedPreviousAssessment.measurements?.[measurement.key];
                    const hasData = currentValue !== undefined || previousValue !== undefined;
                    
                    if (!hasData) return null;

                    const currentNum = safeNumber(currentValue);
                    const previousNum = safeNumber(previousValue);
                    const change = currentValue && previousValue ? currentNum - previousNum : 0;
                    const changePercentage = currentValue && previousValue ? ((currentNum - previousNum) / previousNum) * 100 : 0;

                    const cardGradient = activeMeasurementCategory === 'circumferences' 
                      ? 'from-app-achievement-workout to-app-btn-primary' 
                      : 'from-app-achievement-exercise to-app-btn-accent';

                    return (
                      <MeasurementCard
                        key={measurement.key as string}
                        measurement={measurement}
                        currentValue={currentNum}
                        previousValue={previousNum}
                        change={change}
                        changePercentage={changePercentage}
                        hasCurrentValue={currentValue !== undefined}
                        hasPreviousValue={previousValue !== undefined}
                        gradient={cardGradient}
                        delay={index * 50}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Measurement Details */}
            {selectedMeasurement && (
              <MeasurementDetails
                selectedMeasurement={selectedMeasurement}
                currentAssessment={currentAssessment}
                selectedPreviousAssessment={selectedPreviousAssessment}
                onClose={() => setSelectedMeasurement(null)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Category Selector Component
function CategorySelector({ 
  activeCategory, 
  onCategoryChange 
}: { 
  activeCategory: 'circumferences' | 'skinfolds';
  onCategoryChange: (category: 'circumferences' | 'skinfolds') => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-exercise/10 rounded-2xl blur-xl"></div>
      <div className="relative grid grid-cols-2 gap-2 bg-app-bg-card/60 backdrop-blur-2xl shadow-app-medium rounded-2xl p-2 border-0">
        <button
          onClick={() => onCategoryChange('circumferences')}
          className={`
            flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold 
            transition-all duration-300 group
            ${activeCategory === 'circumferences'
              ? 'bg-gradient-to-br from-app-achievement-workout to-app-btn-primary text-white shadow-app-medium transform scale-105'
              : 'hover:bg-app-bg-secondary text-app-text-secondary'
            }
          `}
        >
          <Activity className={`h-4 w-4 ${activeCategory === 'circumferences' ? 'text-white' : 'text-app-achievement-workout'}`} />
          <span>Circunferências</span>
          {activeCategory === 'circumferences' && (
            <Sparkles className="h-3 w-3 text-white/80 animate-pulse ml-1" />
          )}
        </button>
        <button
          onClick={() => onCategoryChange('skinfolds')}
          className={`
            flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold 
            transition-all duration-300 group
            ${activeCategory === 'skinfolds'
              ? 'bg-gradient-to-br from-app-achievement-exercise to-app-btn-accent text-white shadow-app-medium transform scale-105'
              : 'hover:bg-app-bg-secondary text-app-text-secondary'
            }
          `}
        >
          <Target className={`h-4 w-4 ${activeCategory === 'skinfolds' ? 'text-white' : 'text-app-achievement-exercise'}`} />
          <span>Dobras Cutâneas</span>
          {activeCategory === 'skinfolds' && (
            <Sparkles className="h-3 w-3 text-white/80 animate-pulse ml-1" />
          )}
        </button>
      </div>
    </div>
  );
}

// Humanoid Container Component
function HumanoidContainer({
  currentAssessment,
  selectedPreviousAssessment,
  activeCategory,
  onMeasurementClick
}: {
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
  activeCategory: 'circumferences' | 'skinfolds';
  onMeasurementClick: (measurement: MeasurementPoint) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-exercise/20 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-gradient-to-br from-app-bg-card/95 via-app-bg-accent/95 to-app-bg-card/95 backdrop-blur-xl rounded-2xl shadow-app-xl overflow-hidden">
        <CardContent className="p-6">
          <h4 className="text-lg font-bold text-center mb-6 bg-gradient-to-r from-app-achievement-workout via-app-achievement-exercise to-app-achievement-workout bg-clip-text text-transparent">
            Mapa Corporal Interativo
          </h4>
          
          <div className="relative bg-gradient-to-br from-app-bg-accent via-app-bg-secondary/50 to-app-bg-accent rounded-2xl p-4 shadow-inner border border-app-border-accent">
            <HumanoidFigure
              measurements={currentAssessment.measurements}
              previousMeasurements={selectedPreviousAssessment.measurements}
              activeCategory={activeCategory}
              onMeasurementClick={onMeasurementClick}
            />
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-4 bg-app-bg-card/60 backdrop-blur-sm px-6 py-3 rounded-xl shadow-app-medium border border-app-border-accent">
              <LegendItem color="from-green-400 to-green-600" label="Diminuiu" />
              <div className="w-px h-4 bg-app-border-muted"></div>
              <LegendItem color="from-red-400 to-red-600" label="Aumentou" />
              <div className="w-px h-4 bg-app-border-muted"></div>
              <LegendItem color="from-app-text-muted to-app-text-secondary" label="Estável" />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-app-text-secondary italic bg-gradient-to-r from-app-bg-accent to-app-bg-secondary/50 px-4 py-2 rounded-lg border border-app-border-accent">
              💡 Clique nos pontos para ver detalhes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Legend Item Component
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 bg-gradient-to-br ${color} rounded-full shadow-sm`}></div>
      <span className="text-sm font-medium text-app-text-primary">{label}</span>
    </div>
  );
}

// Measurement Card Component
function MeasurementCard({
  measurement,
  currentValue,
  previousValue,
  change,
  changePercentage,
  hasCurrentValue,
  hasPreviousValue,
  gradient,
  delay
}: {
  measurement: MeasurementPoint;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  hasCurrentValue: boolean;
  hasPreviousValue: boolean;
  gradient: string;
  delay: number;
}) {
  const hasBothValues = hasCurrentValue && hasPreviousValue;
  
  return (
    <div 
      className="relative group animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <Card className="relative border-0 bg-app-bg-card/90 backdrop-blur-xl shadow-app-medium hover:shadow-app-xl transition-all duration-500 rounded-xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg text-white shadow-app-medium`}>
                <Ruler className="h-4 w-4" />
              </div>
              <span className="font-bold text-app-text-heading">
                {measurement.label}
              </span>
            </div>
            <Badge className={`px-2 py-1 bg-gradient-to-r ${gradient} text-white border-0 rounded-full text-xs font-semibold`}>
              {measurement.unit}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {hasCurrentValue && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-app-text-secondary">Atual</span>
                <span className="text-lg font-black text-app-text-heading">
                  {currentValue.toFixed(1)}{measurement.unit}
                </span>
              </div>
            )}
            
            {hasPreviousValue && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-app-text-secondary">Anterior</span>
                <span className="text-sm font-bold text-app-text-secondary">
                  {previousValue.toFixed(1)}{measurement.unit}
                </span>
              </div>
            )}
            
            {hasBothValues && Math.abs(change) > 0.01 && (
              <div className="border-t border-app-border-muted pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-app-achievement-workout" />
                    Variação
                  </span>
                  <div className="text-right">
                    <div className={`text-sm font-black ${
                      change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}{measurement.unit}
                    </div>
                    {Math.abs(changePercentage) > 0.01 && (
                      <div className={`text-xs font-semibold ${
                        change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Measurement Details Component
function MeasurementDetails({
  selectedMeasurement,
  currentAssessment,
  selectedPreviousAssessment,
  onClose
}: {
  selectedMeasurement: MeasurementPoint;
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
  onClose: () => void;
}) {
  const currentValue = currentAssessment.measurements?.[selectedMeasurement.key];
  const previousValue = selectedPreviousAssessment.measurements?.[selectedMeasurement.key];
  const currentNum = safeNumber(currentValue);
  const previousNum = safeNumber(previousValue);
  const change = currentValue && previousValue ? currentNum - previousNum : 0;
  const changePercentage = currentValue && previousValue && previousNum !== 0 
    ? ((currentNum - previousNum) / previousNum) * 100 : 0;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-exercise/10 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-app-bg-card/90 backdrop-blur-xl rounded-2xl shadow-app-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-app-text-heading flex items-center gap-2">
              <Zap className="h-5 w-5 text-app-achievement-workout" />
              {selectedMeasurement.label} - Análise Detalhada
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-app-bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Atual"
              value={currentValue ? `${currentNum.toFixed(1)}${selectedMeasurement.unit}` : 'N/A'}
              gradient="from-app-achievement-workout to-app-btn-primary"
              textColor="text-app-achievement-workout"
            />
            
            <MetricCard
              label="Anterior"
              value={previousValue ? `${previousNum.toFixed(1)}${selectedMeasurement.unit}` : 'N/A'}
              gradient="from-app-text-muted to-app-text-secondary"
              textColor="text-app-text-secondary"
            />
            
            <MetricCard
              label="Variação"
              value={currentValue && previousValue ? 
                `${change > 0 ? '+' : ''}${change.toFixed(1)}${selectedMeasurement.unit} (${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%)` : 
                'N/A'
              }
              gradient={change > 0 ? "from-red-500 to-rose-600" : "from-green-500 to-emerald-600"}
              textColor={change > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, gradient, textColor }: {
  label: string;
  value: string;
  gradient: string;
  textColor: string;
}) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-app-bg-accent to-app-bg-secondary/50 rounded-xl border border-app-border-accent">
      <div className={`text-2xl font-black ${textColor} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-app-text-secondary font-semibold">{label}</div>
    </div>
  );
}