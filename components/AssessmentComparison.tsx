'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  Activity,
  Scale,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightCircle,
  Award,
  AlertTriangle,
  Crown,
  Star,
  Sparkles,
  Trophy,
  Lightbulb,
  CheckCircle2,
  Clock,
  User,
  Ruler,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Estilos CSS customizados para efeitos 3D
const styles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  .humanoid-container {
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(147, 51, 234, 0.1) 50%, 
      rgba(219, 39, 119, 0.1) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .humanoid-body-part {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
  
  .humanoid-body-part:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.2));
  }
  
  .measurement-point-3d {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%, 
      rgba(255, 255, 255, 0.7) 50%, 
      rgba(255, 255, 255, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  }
  
  .measurement-point-3d:hover {
    transform: scale(1.2) translateZ(10px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  }
  
  .tooltip-3d {
    background: linear-gradient(135deg, 
      rgba(0, 0, 0, 0.95) 0%, 
      rgba(31, 41, 55, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

// Função utilitária para conversão segura de números
const safeNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

// Interface para as medidas com index signature
interface Measurements {
  // Circunferências
  neck?: number | string;
  shoulders?: number | string;
  chest?: number | string;
  chest_circ?: number | string;
  waist?: number | string;
  abdomen?: number | string;
  hips?: number | string;
  left_arm?: number | string;
  right_arm?: number | string;
  left_thigh?: number | string;
  right_thigh?: number | string;
  left_calf?: number | string;
  right_calf?: number | string;
  // Dobras cutâneas
  triceps?: number | string;
  biceps?: number | string;
  subscapular?: number | string;
  abdominal?: number | string;
  suprailiac?: number | string;
  midaxillary?: number | string;
  thigh?: number | string;
  // Index signature para permitir acesso dinâmico
  [key: string]: number | string | undefined;
}

interface Assessment {
  id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  protocol: string;
  bmi: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  body_density: number;
  notes?: string;
  created_at: string;
  measurements?: Measurements;
}

interface ComparisonData {
  metric: string;
  label: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  improvement: 'positive' | 'negative' | 'neutral';
}

interface AssessmentComparisonProps {
  currentAssessment: Assessment;
  studentId: string;
  className?: string;
}

// Interface para pontos de medição
interface MeasurementPoint {
  key: keyof Measurements;
  label: string;
  unit: string;
  position: { x: number; y: number };
  color: string;
}

// Dados das medidas organizados com posicionamento para a figura humanoide
const MEASUREMENT_DATA: {
  circumferences: MeasurementPoint[];
  skinfolds: MeasurementPoint[];
} = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', position: { x: 50, y: 15 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', position: { x: 50, y: 25 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'chest', label: 'Tórax', unit: 'cm', position: { x: 50, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', position: { x: 50, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'waist', label: 'Cintura', unit: 'cm', position: { x: 50, y: 45 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', position: { x: 50, y: 50 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'hips', label: 'Quadril', unit: 'cm', position: { x: 50, y: 55 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_arm', label: 'Braço Esq.', unit: 'cm', position: { x: 25, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_arm', label: 'Braço Dir.', unit: 'cm', position: { x: 75, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_thigh', label: 'Coxa Esq.', unit: 'cm', position: { x: 40, y: 70 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_thigh', label: 'Coxa Dir.', unit: 'cm', position: { x: 60, y: 70 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', position: { x: 40, y: 85 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', position: { x: 60, y: 85 }, color: 'from-blue-500 to-cyan-500' }
  ],
  skinfolds: [
    { key: 'triceps', label: 'Tríceps', unit: 'mm', position: { x: 80, y: 40 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', position: { x: 20, y: 40 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', position: { x: 65, y: 30 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', position: { x: 45, y: 50 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', position: { x: 35, y: 55 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', position: { x: 25, y: 45 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'thigh', label: 'Coxa', unit: 'mm', position: { x: 50, y: 70 }, color: 'from-yellow-500 to-orange-500' }
  ]
};

// Componente da figura humanoide 3D realista
const HumanoidFigure = ({ 
  measurements, 
  previousMeasurements, 
  activeCategory,
  onMeasurementClick 
}: {
  measurements: Measurements | undefined;
  previousMeasurements: Measurements | undefined;
  activeCategory: 'circumferences' | 'skinfolds';
  onMeasurementClick: (measurement: MeasurementPoint) => void;
}) => {
  const relevantMeasurements = MEASUREMENT_DATA[activeCategory];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Container 3D */}
      <div className="relative h-96 perspective-1000">
        <div className="relative w-full h-full transform-style-3d">
          
          {/* Corpo 3D */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-4">
            
            {/* Cabeça 3D */}
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-pink-900/30 shadow-lg border-2 border-orange-200/50 dark:border-orange-700/50">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20"></div>
                <div className="absolute top-2 left-3 w-2 h-2 bg-blue-800 dark:bg-blue-400 rounded-full opacity-80"></div>
                <div className="absolute top-2 right-3 w-2 h-2 bg-blue-800 dark:bg-blue-400 rounded-full opacity-80"></div>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-pink-300 dark:bg-pink-600 rounded-full opacity-60"></div>
              </div>
            </div>

            {/* Pescoço */}
            <div className="w-6 h-4 bg-gradient-to-b from-orange-100 via-yellow-100 to-orange-200 dark:from-orange-900/30 dark:via-yellow-900/30 dark:to-orange-900/40 rounded-md shadow-inner border border-orange-200/50 dark:border-orange-700/50 mb-1"></div>

            {/* Ombros e Braços */}
            <div className="relative flex items-start justify-center mb-2">
              {/* Braço Esquerdo */}
              <div className="flex flex-col items-center mr-4">
                <div className="w-4 h-16 bg-gradient-to-b from-orange-200 via-yellow-200 to-orange-300 dark:from-orange-900/40 dark:via-yellow-900/40 dark:to-orange-900/50 rounded-full shadow-lg border border-orange-300/50 dark:border-orange-600/50 transform rotate-12"></div>
                <div className="w-3 h-12 bg-gradient-to-b from-orange-300 via-yellow-300 to-orange-400 dark:from-orange-900/50 dark:via-yellow-900/50 dark:to-orange-900/60 rounded-full shadow-md border border-orange-400/50 dark:border-orange-500/50 transform rotate-6 -mt-2"></div>
              </div>

              {/* Tronco */}
              <div className="flex flex-col items-center">
                {/* Tórax */}
                <div className="relative w-20 h-24 bg-gradient-to-br from-orange-100 via-yellow-100 via-orange-200 to-pink-200 dark:from-orange-900/30 dark:via-yellow-900/30 dark:via-orange-900/40 dark:to-pink-900/40 rounded-t-3xl rounded-b-xl shadow-2xl border-2 border-orange-200/60 dark:border-orange-700/60">
                  <div className="absolute inset-2 bg-gradient-to-br from-white/40 to-transparent rounded-t-3xl rounded-b-xl"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-300/60 dark:bg-orange-600/60 rounded-full"></div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-orange-200/40 dark:bg-orange-700/40 rounded-lg"></div>
                </div>

                {/* Cintura */}
                <div className="w-16 h-8 bg-gradient-to-br from-orange-200 via-yellow-200 to-orange-300 dark:from-orange-900/40 dark:via-yellow-900/40 dark:to-orange-900/50 rounded-lg shadow-lg border border-orange-300/50 dark:border-orange-600/50 -mt-2"></div>

                {/* Quadril */}
                <div className="w-18 h-12 bg-gradient-to-br from-orange-200 via-yellow-200 to-pink-300 dark:from-orange-900/40 dark:via-yellow-900/40 dark:to-pink-900/50 rounded-2xl shadow-xl border-2 border-orange-300/60 dark:border-orange-600/60 -mt-1"></div>
              </div>

              {/* Braço Direito */}
              <div className="flex flex-col items-center ml-4">
                <div className="w-4 h-16 bg-gradient-to-b from-orange-200 via-yellow-200 to-orange-300 dark:from-orange-900/40 dark:via-yellow-900/40 dark:to-orange-900/50 rounded-full shadow-lg border border-orange-300/50 dark:border-orange-600/50 transform -rotate-12"></div>
                <div className="w-3 h-12 bg-gradient-to-b from-orange-300 via-yellow-300 to-orange-400 dark:from-orange-900/50 dark:via-yellow-900/50 dark:to-orange-900/60 rounded-full shadow-md border border-orange-400/50 dark:border-orange-500/50 transform -rotate-6 -mt-2"></div>
              </div>
            </div>

            {/* Pernas */}
            <div className="flex justify-center gap-3 mt-2">
              {/* Perna Esquerda */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-20 bg-gradient-to-b from-orange-300 via-yellow-300 to-orange-400 dark:from-orange-900/50 dark:via-yellow-900/50 dark:to-orange-900/60 rounded-full shadow-xl border-2 border-orange-400/60 dark:border-orange-500/60"></div>
                <div className="w-4 h-16 bg-gradient-to-b from-orange-400 via-yellow-400 to-orange-500 dark:from-orange-900/60 dark:via-yellow-900/60 dark:to-orange-900/70 rounded-full shadow-lg border border-orange-500/50 dark:border-orange-400/50 -mt-2"></div>
                <div className="w-5 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-900/70 dark:to-yellow-900/70 rounded-lg shadow-md border border-orange-600/50 dark:border-orange-300/50 -mt-1"></div>
              </div>

              {/* Perna Direita */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-20 bg-gradient-to-b from-orange-300 via-yellow-300 to-orange-400 dark:from-orange-900/50 dark:via-yellow-900/50 dark:to-orange-900/60 rounded-full shadow-xl border-2 border-orange-400/60 dark:border-orange-500/60"></div>
                <div className="w-4 h-16 bg-gradient-to-b from-orange-400 via-yellow-400 to-orange-500 dark:from-orange-900/60 dark:via-yellow-900/60 dark:to-orange-900/70 rounded-full shadow-lg border border-orange-500/50 dark:border-orange-400/50 -mt-2"></div>
                <div className="w-5 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-900/70 dark:to-yellow-900/70 rounded-lg shadow-md border border-orange-600/50 dark:border-orange-300/50 -mt-1"></div>
              </div>
            </div>
          </div>

          {/* Pontos de medição 3D */}
          {relevantMeasurements.map((measurement) => {
            const currentValue = measurements?.[measurement.key];
            const previousValue = previousMeasurements?.[measurement.key];
            const hasData = currentValue !== undefined || previousValue !== undefined;
            const hasChange = currentValue !== undefined && previousValue !== undefined;
            
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
                {/* Ponto de medição 3D */}
                <div className="relative">
                  <div className={`relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${measurement.color} shadow-2xl transform group-hover:scale-125 transition-all duration-300 border-2 border-white/60 backdrop-blur-sm`}>
                    <div className="absolute inset-0.5 bg-white/30 rounded-full"></div>
                    <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${measurement.color} opacity-90`}></div>
                    <div className="absolute inset-2 bg-white/60 rounded-full animate-pulse"></div>
                    
                    {/* Efeito de profundidade */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-white/20 to-black/20 rounded-full blur-sm opacity-50"></div>
                  </div>

                  {/* Indicador de mudança 3D */}
                  {hasChange && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                      change > 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 
                      change < 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    } border-2 border-white shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                      <div className={`absolute inset-0.5 rounded-full ${
                        change > 0 ? 'bg-red-300' : change < 0 ? 'bg-green-300' : 'bg-gray-300'
                      } opacity-60`}></div>
                    </div>
                  )}

                  {/* Linha de conexão */}
                  <div className={`absolute top-1/2 left-1/2 w-8 h-0.5 bg-gradient-to-r ${measurement.color} opacity-30 transform -translate-x-1/2 -translate-y-1/2 rotate-45 group-hover:opacity-60 transition-opacity duration-300`}></div>
                </div>

                {/* Tooltip 3D aprimorado */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 group-hover:scale-105">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-white/10">
                    <div className="font-bold text-center mb-1 text-yellow-300">{measurement.label}</div>
                    {currentValue && (
                      <div className="text-blue-300 font-semibold">
                        <span className="text-white">Atual:</span> {currentNum.toFixed(1)}{measurement.unit}
                      </div>
                    )}
                    {previousValue && (
                      <div className="text-gray-300 font-medium">
                        <span className="text-white">Anterior:</span> {previousNum.toFixed(1)}{measurement.unit}
                      </div>
                    )}
                    {hasChange && (
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-3xl pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

const AssessmentComparison: React.FC<AssessmentComparisonProps> = ({
  currentAssessment,
  studentId,
  className
}) => {
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[]>([]);
  const [selectedPreviousAssessment, setSelectedPreviousAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementPoint | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMeasurementCategory, setActiveMeasurementCategory] = useState<'circumferences' | 'skinfolds'>('circumferences');

  useEffect(() => {
    fetchPreviousAssessments();
  }, [studentId]);

  useEffect(() => {
    if (previousAssessments.length > 0 && !selectedPreviousAssessment) {
      const mostRecent = previousAssessments
        .filter(assessment => assessment.id !== currentAssessment.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (mostRecent) {
        setSelectedPreviousAssessment(mostRecent);
      }
    }
  }, [previousAssessments, currentAssessment.id, selectedPreviousAssessment]);

  useEffect(() => {
    if (selectedPreviousAssessment) {
      generateComparisonData();
    }
  }, [selectedPreviousAssessment]);

  const fetchPreviousAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments?student_id=${studentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPreviousAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações anteriores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateComparisonData = () => {
    if (!selectedPreviousAssessment) return;

    const comparisons: ComparisonData[] = [
      {
        metric: 'weight',
        label: 'Peso',
        current: currentAssessment.weight,
        previous: selectedPreviousAssessment.weight,
        change: currentAssessment.weight - selectedPreviousAssessment.weight,
        changePercentage: ((currentAssessment.weight - selectedPreviousAssessment.weight) / selectedPreviousAssessment.weight) * 100,
        unit: 'kg',
        icon: <Scale className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'blue',
        improvement: 'neutral'
      },
      {
        metric: 'bmi',
        label: 'IMC',
        current: currentAssessment.bmi,
        previous: selectedPreviousAssessment.bmi,
        change: currentAssessment.bmi - selectedPreviousAssessment.bmi,
        changePercentage: ((currentAssessment.bmi - selectedPreviousAssessment.bmi) / selectedPreviousAssessment.bmi) * 100,
        unit: '',
        icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'purple',
        improvement: currentAssessment.bmi < selectedPreviousAssessment.bmi ? 'positive' : 
                    currentAssessment.bmi > selectedPreviousAssessment.bmi ? 'negative' : 'neutral'
      },
      {
        metric: 'fat_percentage',
        label: '% Gordura',
        current: currentAssessment.fat_percentage,
        previous: selectedPreviousAssessment.fat_percentage,
        change: currentAssessment.fat_percentage - selectedPreviousAssessment.fat_percentage,
        changePercentage: ((currentAssessment.fat_percentage - selectedPreviousAssessment.fat_percentage) / selectedPreviousAssessment.fat_percentage) * 100,
        unit: '%',
        icon: <Target className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'red',
        improvement: currentAssessment.fat_percentage < selectedPreviousAssessment.fat_percentage ? 'positive' : 
                    currentAssessment.fat_percentage > selectedPreviousAssessment.fat_percentage ? 'negative' : 'neutral'
      },
      {
        metric: 'fat_mass',
        label: 'Massa Gorda',
        current: currentAssessment.fat_mass,
        previous: selectedPreviousAssessment.fat_mass,
        change: currentAssessment.fat_mass - selectedPreviousAssessment.fat_mass,
        changePercentage: ((currentAssessment.fat_mass - selectedPreviousAssessment.fat_mass) / selectedPreviousAssessment.fat_mass) * 100,
        unit: 'kg',
        icon: <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'orange',
        improvement: currentAssessment.fat_mass < selectedPreviousAssessment.fat_mass ? 'positive' : 
                    currentAssessment.fat_mass > selectedPreviousAssessment.fat_mass ? 'negative' : 'neutral'
      },
      {
        metric: 'lean_mass',
        label: 'Massa Magra',
        current: currentAssessment.lean_mass,
        previous: selectedPreviousAssessment.lean_mass,
        change: currentAssessment.lean_mass - selectedPreviousAssessment.lean_mass,
        changePercentage: ((currentAssessment.lean_mass - selectedPreviousAssessment.lean_mass) / selectedPreviousAssessment.lean_mass) * 100,
        unit: 'kg',
        icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'green',
        improvement: currentAssessment.lean_mass > selectedPreviousAssessment.lean_mass ? 'positive' : 
                    currentAssessment.lean_mass < selectedPreviousAssessment.lean_mass ? 'negative' : 'neutral'
      }
    ];

    setComparisonData(comparisons);
  };

  const getTrendIcon = (change: number, improvement: string) => {
    if (Math.abs(change) < 0.01) return <ArrowRightCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
    
    if (improvement === 'positive') {
      return <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
    } else if (improvement === 'negative') {
      return <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    } else {
      return change > 0 ? 
        <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> : 
        <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getOverallProgress = () => {
    if (comparisonData.length === 0) return { score: 0, status: 'neutral', message: 'Sem dados' };
    
    const positiveChanges = comparisonData.filter(d => d.improvement === 'positive').length;
    const totalMetrics = comparisonData.length;
    const score = (positiveChanges / totalMetrics) * 100;
    
    if (score >= 70) return { score, status: 'excellent', message: 'Excelente progresso!' };
    if (score >= 50) return { score, status: 'good', message: 'Bom progresso' };
    if (score >= 30) return { score, status: 'moderate', message: 'Progresso moderado' };
    return { score, status: 'needs_improvement', message: 'Precisa melhorar' };
  };

  const handleMeasurementClick = (measurement: MeasurementPoint) => {
    setSelectedMeasurement(measurement);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }
    

  if (previousAssessments.filter(a => a.id !== currentAssessment.id).length === 0) {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
            <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative mx-auto sm:mx-0">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Evolução e Comparações
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Análise temporal e comparações com avaliações anteriores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center py-16 sm:py-24 px-4">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-xl sm:shadow-2xl">
                  <Calendar className="h-16 w-16 sm:h-20 sm:w-20 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent mb-4">
                Primeira Avaliação
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
                Esta é a primeira avaliação do aluno. As comparações estarão disponíveis após a próxima avaliação.
              </p>
              <Badge className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Linha de Base Estabelecida
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = getOverallProgress();
  const availableAssessments = previousAssessments.filter(a => a.id !== currentAssessment.id);

  return (
    <>
      {/* Estilos CSS customizados */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header com seleção de avaliação - MELHORADO PARA MOBILE */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-green-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
          <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-2xl sm:rounded-t-3xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative mx-auto sm:mx-0">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Evolução e Comparações
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Análise temporal entre avaliações
                  </CardDescription>
                </div>
              </div>
              
              {/* Progress Score - RESPONSIVO */}
              <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg mx-auto lg:mx-0">
                <div className={`text-2xl sm:text-4xl font-black ${
                  progress.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                  progress.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                  progress.status === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {progress.score.toFixed(0)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">{progress.message}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {progress.status === 'excellent' && <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                  {progress.status === 'good' && <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />}
                  {progress.status === 'moderate' && <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                  {progress.status === 'needs_improvement' && <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Comparar com:</span>
                  <span className="sm:hidden">Comparar:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableAssessments.map((assessment) => (
                    <Button
                      key={assessment.id}
                      variant={selectedPreviousAssessment?.id === assessment.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPreviousAssessment(assessment)}
                      className={`text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all duration-300 px-2 py-1 sm:px-3 sm:py-2 ${
                        selectedPreviousAssessment?.id === assessment.id 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105' 
                          : 'hover:scale-105'
                      }`}
                    >
                      {format(new Date(assessment.date), 'dd/MM/yy', { locale: ptBR })}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegação - MELHORADOS PARA MOBILE */}
      {selectedPreviousAssessment && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
            <TabsList className="relative grid w-full grid-cols-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-lg sm:shadow-2xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Métricas</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger
                value="measurements"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Corpo</span>
                <span className="sm:hidden">Medidas</span>
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2"
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Resumo</span>
                <span className="sm:hidden">Resume</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Visão Geral - Métricas Principais - RESPONSIVO */}
          <TabsContent value="overview">
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {comparisonData.map((comparison) => (
                <div key={comparison.metric} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    comparison.improvement === 'positive' ? 'from-green-600 to-emerald-600' :
                    comparison.improvement === 'negative' ? 'from-red-600 to-pink-600' :
                    'from-blue-600 to-cyan-600'
                  } rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                    
                    {/* Animated gradient border */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      comparison.improvement === 'positive' ? 'from-green-500 to-emerald-500' :
                      comparison.improvement === 'negative' ? 'from-red-500 to-pink-500' :
                      'from-blue-500 to-cyan-500'
                    } rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

                    <CardContent className="relative p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-2 sm:p-3 bg-gradient-to-br ${
                            comparison.improvement === 'positive' ? 'from-green-500 to-emerald-500' :
                            comparison.improvement === 'negative' ? 'from-red-500 to-pink-500' :
                            'from-blue-500 to-cyan-500'
                          } rounded-lg sm:rounded-xl text-white shadow-lg`}>
                            {comparison.icon}
                          </div>
                          <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {comparison.label}
                          </span>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl">
                          {getTrendIcon(comparison.change, comparison.improvement)}
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Atual</span>
                          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                            {comparison.current.toFixed(2)}{comparison.unit}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Anterior</span>
                          <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">
                            {comparison.previous.toFixed(2)}{comparison.unit}
                          </span>
                        </div>
                        
                        <div className="border-t pt-3 sm:pt-4">
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
          </TabsContent>

          {/* Medidas Corporais com Figura Humanoide - TOTALMENTE RESPONSIVO */}
          <TabsContent value="measurements">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative mx-auto sm:mx-0">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
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
                    {/* Seletor de categoria - MOBILE FIRST */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-blue-600/10 to-yellow-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
                      <div className="relative grid grid-cols-2 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-lg rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0">
                        <button
                          onClick={() => setActiveMeasurementCategory('circumferences')}
                          className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                            activeMeasurementCategory === 'circumferences'
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          <span className="text-base sm:text-xl">🔵</span>
                          <span className="hidden sm:inline">Circunferências</span>
                          <span className="sm:hidden">Circunf.</span>
                        </button>
                        <button
                          onClick={() => setActiveMeasurementCategory('skinfolds')}
                          className={`flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${
                            activeMeasurementCategory === 'skinfolds'
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

                    {/* Layout responsivo: coluna única em mobile, grid em desktop */}
                    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                      {/* Figura Humanoide 3D - RESPONSIVA */}
                      <div className="lg:col-span-1 order-1 lg:order-first">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-500/20 to-indigo-600/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                          <Card className="relative border-0 bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6 text-center bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-600 bg-clip-text text-transparent">
                                Mapa Corporal 3D
                              </h4>
                              
                              {/* Container com efeitos 3D */}
                              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 shadow-inner border border-purple-200/30 dark:border-purple-700/30">
                                <HumanoidFigure
                                  measurements={currentAssessment.measurements}
                                  previousMeasurements={selectedPreviousAssessment.measurements}
                                  activeCategory={activeMeasurementCategory}
                                  onMeasurementClick={handleMeasurementClick}
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
                                  <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 px-3 py-2 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
                                    💡 Clique nos pontos para ver detalhes
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
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
          </TabsContent>

          {/* Resumo da Evolução - RESPONSIVO */}
          <TabsContent value="summary">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative mx-auto sm:mx-0">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Resumo da Evolução</CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Período: {format(new Date(selectedPreviousAssessment.date), 'dd/MM/yyyy', { locale: ptBR })} → {format(new Date(currentAssessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                          {comparisonData.filter(d => d.improvement === 'positive').length}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Métricas Melhoradas</div>
                        <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-500 mx-auto mt-2" />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-red-600 dark:text-red-400 mb-2">
                          {comparisonData.filter(d => d.improvement === 'negative').length}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Métricas Pioradas</div>
                        <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-500 mx-auto mt-2" />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                          {Math.abs(Math.ceil((new Date(currentAssessment.date).getTime() - new Date(selectedPreviousAssessment.date).getTime()) / (1000 * 60 * 60 * 24)))}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Dias de Intervalo</div>
                        <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 mx-auto mt-2" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recomendações baseadas na evolução - RESPONSIVAS */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl shadow-lg mx-auto sm:mx-0 flex-shrink-0">
                        <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 sm:mb-4 text-base sm:text-lg">Recomendações para Próxima Avaliação</h4>
                        <ul className="space-y-2 text-blue-700 dark:text-blue-400 text-sm sm:text-base">
                          {comparisonData.filter(d => d.improvement === 'positive').length > comparisonData.filter(d => d.improvement === 'negative').length ? (
                            <>
                              <li className="flex items-start gap-2">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Continue com o protocolo atual - resultados positivos!</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Mantenha a consistência no treinamento</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Considere pequenos ajustes para otimizar ainda mais</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Revisar estratégia de treinamento e nutrição</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Avaliar fatores externos (sono, estresse, hidratação)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Considerar ajustes no protocolo de avaliação</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
    </>
  );
};

export default AssessmentComparison;