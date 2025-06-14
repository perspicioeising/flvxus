'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Ruler, Zap } from "lucide-react";
import { Assessment, MeasurementPoint, MEASUREMENT_DATA, safeNumber } from '@/types/assessment-comparison';
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
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-purple-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative mx-auto sm:mx-0">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Ruler className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Comparação de Medidas Corporais
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Visualização interativa das mudanças corporais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-6 sm:space-y-8">
            
            {/* Seletor de categoria */}
            <CategorySelector
              activeCategory={activeMeasurementCategory}
              onCategoryChange={setActiveMeasurementCategory}
            />

            {/* Layout responsivo */}
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              
              {/* Figura Humanoide */}
              <div className="lg:col-span-1 order-1 lg:order-first">
                <HumanoidContainer
                  currentAssessment={currentAssessment}
                  selectedPreviousAssessment={selectedPreviousAssessment}
                  activeCategory={activeMeasurementCategory}
                  onMeasurementClick={onMeasurementClick}
                />
              </div>

              {/* Lista de Medidas - GRID RESPONSIVO */}
              <div className="lg:col-span-2 order-2">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {MEASUREMENT_DATA[activeMeasurementCategory].map((measurement) => {
                    const currentValue = currentAssessment.measurements?.[measurement.key];
                    const previousValue = selectedPreviousAssessment.measurements?.[measurement.key];
                    const hasData = currentValue !== undefined || previousValue !== undefined;
                    
                    if (!hasData) return null;

                    // Conversão segura para números
                    const currentNum = safeNumber(currentValue);
                    const previousNum = safeNumber(previousValue);
                    const change = currentValue && previousValue ? currentNum - previousNum : 0;
                    const changePercentage = currentValue && previousValue ? ((currentNum - previousNum) / previousNum) * 100 : 0;

                    return (
                      <div key={measurement.key as string} className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r ${measurement.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                          
                          <div className={`absolute inset-0 bg-gradient-to-r ${measurement.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>

                          <CardContent className="relative p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${measurement.color} rounded-lg text-white shadow-md`}>
                                  <Ruler className="h-3 w-3 sm:h-4 sm:w-4" />
                                </div>
                                <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                                  {measurement.label}
                                </span>
                              </div>
                              <Badge className={`px-2 py-1 bg-gradient-to-r ${measurement.color} text-white border-0 rounded-full text-xs font-semibold`}>
                                {measurement.unit}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {currentValue && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Atual</span>
                                  <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                                    {currentNum.toFixed(1)}{measurement.unit}
                                  </span>
                                </div>
                              )}
                              
                              {previousValue && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Anterior</span>
                                  <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                                    {previousNum.toFixed(1)}{measurement.unit}
                                  </span>
                                </div>
                              )}
                              
                              {currentValue && previousValue && Math.abs(change) > 0.1 && (
                                <div className="border-t pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold">Variação</span>
                                    <div className="text-right">
                                      <div className={`text-sm font-black ${
                                        change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                      }`}>
                                        {change > 0 ? '+' : ''}{change.toFixed(1)}{measurement.unit}
                                      </div>
                                      <div className={`text-xs font-semibold ${
                                        change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                      }`}>
                                        {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detalhes da medida selecionada - RESPONSIVO */}
            {selectedMeasurement && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-500/10 to-indigo-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                        <span className="truncate">{selectedMeasurement.label} - Detalhes</span>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMeasurement(null)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 h-auto"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                          {currentAssessment.measurements?.[selectedMeasurement.key] ? 
                            safeNumber(currentAssessment.measurements[selectedMeasurement.key]).toFixed(1) : 'N/A'}
                          {currentAssessment.measurements?.[selectedMeasurement.key] ? selectedMeasurement.unit : ''}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">Atual</div>
                      </div>
                      
                      <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-black text-gray-600 dark:text-gray-400">
                          {selectedPreviousAssessment.measurements?.[selectedMeasurement.key] ? 
                            safeNumber(selectedPreviousAssessment.measurements[selectedMeasurement.key]).toFixed(1) : 'N/A'}
                          {selectedPreviousAssessment.measurements?.[selectedMeasurement.key] ? selectedMeasurement.unit : ''}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Anterior</div>
                      </div>
                      
                      <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                          {(() => {
                            const current = currentAssessment.measurements?.[selectedMeasurement.key];
                            const previous = selectedPreviousAssessment.measurements?.[selectedMeasurement.key];
                            if (current && previous) {
                              const currentNum = Number(current);
                              const previousNum = Number(previous);
                              const change = currentNum - previousNum;
                              return `${change > 0 ? '+' : ''}${change.toFixed(1)}${selectedMeasurement.unit}`;
                            }
                            return 'N/A';
                          })()}
                        </div>
                        <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold">Variação</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente do seletor de categoria
function CategorySelector({ 
  activeCategory, 
  onCategoryChange 
}: { 
  activeCategory: 'circumferences' | 'skinfolds';
  onCategoryChange: (category: 'circumferences' | 'skinfolds') => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-blue-600/10 to-yellow-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
      <div className="relative grid grid-cols-2 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-lg rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0">
        <button
          onClick={() => onCategoryChange('circumferences')}
          className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
            activeCategory === 'circumferences'
              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <span className="text-base sm:text-xl">🔵</span>
          <span className="hidden sm:inline">Circunferências</span>
          <span className="sm:hidden">Circunf.</span>
        </button>
        <button
          onClick={() => onCategoryChange('skinfolds')}
          className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
            activeCategory === 'skinfolds'
              ? 'bg-yellow-600 text-white shadow-lg transform scale-105'
              : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
          }`}
        >
          <span className="text-base sm:text-xl">🟡</span>
          <span className="hidden sm:inline">Dobras Cutâneas</span>
          <span className="sm:hidden">Dobras</span>
        </button>
      </div>
    </div>
  );
}

// Container da figura humanoide
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
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20 rounded-xl sm:rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Mapa Corporal Interativo
          </h4>
          
          {/* Container com efeitos 3D */}
          <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 shadow-inner border border-purple-200/30 dark:border-purple-700/30">
            <HumanoidFigure
              measurements={currentAssessment.measurements}
              previousMeasurements={selectedPreviousAssessment.measurements}
              activeCategory={activeCategory}
              onMeasurementClick={onMeasurementClick}
            />
          </div>
          
          {/* Legenda melhorada */}
          <div className="mt-6 space-y-3 text-xs sm:text-sm">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Diminuiu</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Aumentou</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Estável</span>
                </div>
              </div>
            </div>
            
            {/* Dica de interação */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 px-3 py-2 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
                💡 Clique nos pontos para ver detalhes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Lista de medidas
function MeasurementsList({
  currentAssessment,
  selectedPreviousAssessment,
  activeCategory
}: {
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
  activeCategory: 'circumferences' | 'skinfolds';
}) {
  const measurements = MEASUREMENT_DATA[activeCategory];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
      {measurements.map((measurement) => {
        const currentValue = currentAssessment.measurements?.[measurement.key];
        const previousValue = selectedPreviousAssessment.measurements?.[measurement.key];
        
        // Debug melhorado
        console.log(`${measurement.label} (${activeCategory}):`, {
          key: measurement.key,
          current: currentValue,
          previous: previousValue,
          currentType: typeof currentValue,
          previousType: typeof previousValue,
          currentExists: currentValue !== undefined,
          previousExists: previousValue !== undefined,
          currentAssessmentMeasurements: currentAssessment.measurements,
          previousAssessmentMeasurements: selectedPreviousAssessment.measurements
        });
        
        // Verificar se pelo menos um valor existe
        const hasCurrentValue = currentValue !== undefined && currentValue !== null && currentValue !== '';
        const hasPreviousValue = previousValue !== undefined && previousValue !== null && previousValue !== '';
        const hasData = hasCurrentValue || hasPreviousValue;
        
        if (!hasData) {
          console.log(`${measurement.label}: Sem dados disponíveis`);
          return null;
        }

        // Conversão segura para números
        const currentNum = safeNumber(currentValue);
        const previousNum = safeNumber(previousValue);
        
        // Calcular mudança apenas se ambos os valores existirem
        const hasBothValues = hasCurrentValue && hasPreviousValue;
        const change = hasBothValues ? currentNum - previousNum : 0;
        const changePercentage = hasBothValues && previousNum !== 0 ? ((currentNum - previousNum) / previousNum) * 100 : 0;

        console.log(`${measurement.label}: valores processados`, {
          currentNum,
          previousNum,
          hasBothValues,
          change,
          changePercentage
        });

        return (
          <div key={measurement.key as string} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${measurement.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
              
              <div className={`absolute inset-0 bg-gradient-to-r ${measurement.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl"></div>

              <CardContent className="relative p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${measurement.color} rounded-lg text-white shadow-md`}>
                      <Ruler className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {measurement.label}
                    </span>
                  </div>
                  <Badge className={`px-2 py-1 bg-gradient-to-r ${measurement.color} text-white border-0 rounded-full text-xs font-semibold`}>
                    {measurement.unit}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {/* Valor Atual - sempre mostrar se existir */}
                  {hasCurrentValue && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Atual</span>
                      <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                        {currentNum.toFixed(1)}{measurement.unit}
                      </span>
                    </div>
                  )}
                  
                  {/* Valor Anterior - sempre mostrar se existir */}
                  {hasPreviousValue && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Anterior</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                        {previousNum.toFixed(1)}{measurement.unit}
                      </span>
                    </div>
                  )}
                  
                  {/* Variação - apenas se ambos existirem e houver diferença */}
                  {hasBothValues && Math.abs(change) > 0.01 && (
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">Variação</span>
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

                  {/* Debug info (pode remover depois) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 border-t pt-1 mt-1">
                      Debug: C:{hasCurrentValue ? 'Y' : 'N'} P:{hasPreviousValue ? 'Y' : 'N'} 
                      {hasBothValues && ` Δ:${change.toFixed(2)}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

