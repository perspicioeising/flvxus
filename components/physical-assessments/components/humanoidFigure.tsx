// components/physical-assessments/components/humanoidFigure.tsx
'use client';

import Image from 'next/image';
import { HumanoidFigureProps, MEASUREMENT_DATA, safeNumber } from '@/components/physical-assessments/types/assessment-comparison';
import { Sparkles } from 'lucide-react';

export function HumanoidFigure({ 
  measurements, 
  previousMeasurements, 
  activeCategory,
  onMeasurementClick 
}: HumanoidFigureProps) {
  const relevantMeasurements = MEASUREMENT_DATA[activeCategory];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Container Principal */}
      <div className="relative aspect-[3/4] w-full">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent dark:via-indigo-900/10 rounded-2xl"></div>
        
        {/* Container da Imagem */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/20 via-transparent to-purple-200/20 dark:from-indigo-700/20 dark:to-purple-700/20 rounded-2xl blur-xl"></div>
          
          {/* Imagem do Corpo Humano */}
          <div className="relative w-full h-full max-w-[280px] max-h-[500px]">
            <Image
              src="/corpohumano.png"
              alt="Mapa Corporal"
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 280px, 320px"
              priority
              quality={100}
              style={{
                filter: 'brightness(1.1) contrast(1.05)',
                mixBlendMode: 'normal'
              }}
            />
          </div>
        </div>

        {/* Pontos de medição */}
        {relevantMeasurements.map((measurement, index) => {
          const currentValue = measurements?.[measurement.key];
          const previousValue = previousMeasurements?.[measurement.key];
          
          const hasCurrentValue = currentValue !== undefined && currentValue !== null && currentValue !== '';
          const hasPreviousValue = previousValue !== undefined && previousValue !== null && previousValue !== '';
          const hasData = hasCurrentValue || hasPreviousValue;
          const hasChange = hasCurrentValue && hasPreviousValue;
          
          const currentNum = safeNumber(currentValue);
          const previousNum = safeNumber(previousValue);
          const change = hasChange ? currentNum - previousNum : 0;
          
          if (!hasData) return null;

          // Determine a cor baseada na mudança
          const getChangeColor = () => {
            if (!hasChange) return 'from-gray-400 to-gray-600';
            if (Math.abs(change) < 0.1) return 'from-gray-400 to-gray-600';
            return change > 0 ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600';
          };

          return (
            <div
              key={measurement.key as string}
              className="absolute cursor-pointer group"
              style={{
                left: `${measurement.position.x}%`,
                top: `${measurement.position.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20 + index
              }}
              onClick={() => onMeasurementClick(measurement)}
            >
              {/* Ponto de medição principal */}
              <div className="relative">
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500"></div>
                
                {/* Ponto principal */}
                <div className={`
                  relative w-8 h-8 rounded-full 
                  bg-gradient-to-br ${activeCategory === 'circumferences' ? 'from-indigo-500 to-blue-600' : 'from-purple-500 to-indigo-600'}
                  shadow-lg border-2 border-white dark:border-gray-800
                  transform transition-all duration-300 
                  group-hover:scale-125 group-hover:shadow-xl
                `}>
                  {/* Inner glow */}
                  <div className="absolute inset-1 bg-white/30 rounded-full"></div>
                  
                  {/* Center dot */}
                  <div className="absolute inset-2 bg-white rounded-full shadow-inner"></div>
                  
                  {/* Change indicator */}
                  {hasChange && Math.abs(change) > 0.1 && (
                    <div className={`
                      absolute -top-1 -right-1 w-4 h-4 rounded-full 
                      bg-gradient-to-br ${getChangeColor()}
                      border-2 border-white dark:border-gray-800 shadow-md
                      flex items-center justify-center
                      animate-pulse
                    `}>
                      <span className="text-white text-xs font-bold">
                        {change > 0 ? '+' : '-'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Label badge - sempre visível */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-indigo-200/50 dark:border-indigo-700/50 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {measurement.label}
                  </div>
                </div>

                {/* Tooltip detalhado no hover */}
                <div className="
                  absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8
                  opacity-0 group-hover:opacity-100 transition-all duration-300 
                  pointer-events-none z-50 group-hover:scale-105
                ">
                  <div className="
                    bg-gradient-to-br from-gray-900 to-gray-800 
                    text-white px-4 py-3 rounded-xl 
                    shadow-2xl border border-gray-700
                    min-w-[140px]
                  ">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                      <span className="font-bold text-yellow-300">{measurement.label}</span>
                    </div>
                    
                    {/* Values */}
                    <div className="space-y-1">
                      {hasCurrentValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Atual:</span>
                          <span className="text-indigo-300 font-bold">
                            {currentNum.toFixed(1)}{measurement.unit}
                          </span>
                        </div>
                      )}
                      {hasPreviousValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Anterior:</span>
                          <span className="text-gray-300">
                            {previousNum.toFixed(1)}{measurement.unit}
                          </span>
                        </div>
                      )}
                      {hasChange && Math.abs(change) > 0.1 && (
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-700">
                          <span className="text-gray-400 text-xs">Variação:</span>
                          <span className={`font-bold ${
                            change > 0 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}{measurement.unit}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-gray-900/50"></div>
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50"></div>
        </div>
      </div>
    </div>
  );
}