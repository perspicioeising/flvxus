// components/physical-assessments/components/humanoidFigure.tsx
'use client';

import Image from 'next/image';
import { HumanoidFigureProps, MEASUREMENT_DATA, safeNumber } from '@/components/physical-assessments/types/assessment-comparison';

export function HumanoidFigure({ 
  measurements, 
  previousMeasurements, 
  activeCategory,
  onMeasurementClick 
}: HumanoidFigureProps) {
  const relevantMeasurements = MEASUREMENT_DATA[activeCategory];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Container 3D - Aumentado */}
      <div className="relative h-[500px] sm:h-[600px] perspective-1000">
        <div className="relative w-full h-full transform-style-3d">
          
          {/* Imagem do Corpo Humano - Maior */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-[480px] sm:w-80 sm:h-[580px]">
              <Image
                src="/corpohumano.png"
                alt="Corpo Humano"
                fill
                className="object-contain opacity-80 dark:opacity-60"
                priority
              />
              
              {/* Overlay com gradiente sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20 rounded-2xl"></div>
            </div>
          </div>

          {/* Pontos de medição 3D - Ajustados para o tamanho maior */}
          {relevantMeasurements.map((measurement) => {
            const currentValue = measurements?.[measurement.key];
            const previousValue = previousMeasurements?.[measurement.key];
            
            // Debug detalhado para figura humanoide
            console.log(`Humanoid ${measurement.label}:`, {
              key: measurement.key,
              current: currentValue,
              previous: previousValue,
              measurementsObj: measurements,
              previousMeasurementsObj: previousMeasurements
            });
            
            const hasCurrentValue = currentValue !== undefined && currentValue !== null && currentValue !== '';
            const hasPreviousValue = previousValue !== undefined && previousValue !== null && previousValue !== '';
            const hasData = hasCurrentValue || hasPreviousValue;
            const hasChange = hasCurrentValue && hasPreviousValue;
            
            // Conversão segura para números
            const currentNum = safeNumber(currentValue);
            const previousNum = safeNumber(previousValue);
            const change = hasChange ? currentNum - previousNum : 0;
            
            if (!hasData) return null;

            return (
              <div
                key={measurement.key as string}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{
                  left: `${measurement.position.x}%`,
                  top: `${measurement.position.y}%`
                }}
                onClick={() => onMeasurementClick(measurement)}
              >
                {/* Ponto de medição 3D - Maior */}
                <div className="relative">
                  <div className={`relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${measurement.color} shadow-2xl transform group-hover:scale-125 transition-all duration-300 border-2 border-white/80 dark:border-gray-800/80 backdrop-blur-sm animate-pulse`}>
                    <div className="absolute inset-0.5 bg-white/40 dark:bg-gray-800/40 rounded-full"></div>
                    <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${measurement.color} opacity-90`}></div>
                    <div className="absolute inset-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full"></div>
                    
                    {/* Efeito de profundidade */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-white/30 to-black/30 rounded-full blur-sm opacity-50"></div>
                  </div>

                  {/* Indicador de mudança 3D */}
                  {hasChange && Math.abs(change) > 0.1 && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      change > 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 
                      change < 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    } border-2 border-white dark:border-gray-800 shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                      <div className={`absolute inset-0.5 rounded-full ${
                        change > 0 ? 'bg-red-300' : change < 0 ? 'bg-green-300' : 'bg-gray-300'
                      } opacity-60`}></div>
                    </div>
                  )}

                  {/* Linha de conexão */}
                  <div className={`absolute top-1/2 left-1/2 w-6 h-0.5 bg-gradient-to-r ${measurement.color} opacity-20 transform -translate-x-1/2 -translate-y-1/2 rotate-45 group-hover:opacity-40 transition-opacity duration-300`}></div>
                </div>

                {/* Tooltip 3D aprimorado */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 group-hover:scale-105">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-white/10">
                    <div className="font-bold text-center mb-1 text-yellow-300">{measurement.label}</div>
                    {hasCurrentValue && (
                      <div className="text-blue-300 font-semibold">
                        <span className="text-white">Atual:</span> {currentNum.toFixed(1)}{measurement.unit}
                      </div>
                    )}
                    {hasPreviousValue && (
                      <div className="text-gray-300 font-medium">
                        <span className="text-white">Anterior:</span> {previousNum.toFixed(1)}{measurement.unit}
                      </div>
                    )}
                    {hasChange && Math.abs(change) > 0.1 && (
                      <div className={`font-bold border-t border-white/20 pt-1 mt-1 ${
                        change > 0 ? 'text-red-300' : change < 0 ? 'text-green-300' : 'text-gray-300'
                      }`}>
                        <span className="text-white">Variação:</span> {change > 0 ? '+' : ''}{change.toFixed(1)}{measurement.unit}
                      </div>
                    )}
                    
                    {/* Seta do tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Efeitos de iluminação 3D */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-3xl pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-white/3 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}