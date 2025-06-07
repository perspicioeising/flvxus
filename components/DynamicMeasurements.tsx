'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Ruler, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Info,
  Eye,
  Activity,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeasurementField {
  id: string;
  label: string;
  category: 'circumferences' | 'skinfolds';
  required: boolean;
  unit: string;
  normalRange?: [number, number];
  description?: string;
}

interface DynamicMeasurementsProps {
  protocol: string;
  gender: string;
  age: number;
  measurements: Record<string, string>;
  onMeasurementsChange: (measurements: Record<string, string>) => void;
  onCalculatedResults: (results: any) => void;
}

const MEASUREMENT_FIELDS: Record<string, MeasurementField[]> = {
  "Jackson & Pollock (3 dobras)": [
    // Circunferências básicas
    { id: "neck", label: "Pescoço", category: "circumferences", required: false, unit: "cm", normalRange: [30, 45] },
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [60, 120] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [80, 140] },
    
    // Dobras obrigatórias
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40], description: "Dobra posterior do braço" },
    { id: "suprailiac", label: "Suprailíaca", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45], description: "Acima da crista ilíaca" },
    { id: "thigh", label: "Coxa", category: "skinfolds", required: true, unit: "mm", normalRange: [8, 50], description: "Face anterior da coxa (apenas mulheres)" },
    { id: "chest", label: "Peitoral", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 35], description: "Diagonal do peitoral (apenas homens)" }
  ],
  
  "Jackson & Pollock (7 dobras)": [
    // Circunferências
    { id: "neck", label: "Pescoço", category: "circumferences", required: false, unit: "cm", normalRange: [30, 45] },
    { id: "shoulders", label: "Ombros", category: "circumferences", required: false, unit: "cm", normalRange: [90, 140] },
    { id: "chest_circ", label: "Tórax", category: "circumferences", required: false, unit: "cm", normalRange: [70, 130] },
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [60, 120] },
    { id: "abdomen", label: "Abdômen", category: "circumferences", required: false, unit: "cm", normalRange: [65, 130] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [80, 140] },
    { id: "right_arm", label: "Braço Direito", category: "circumferences", required: false, unit: "cm", normalRange: [20, 45] },
    { id: "left_arm", label: "Braço Esquerdo", category: "circumferences", required: false, unit: "cm", normalRange: [20, 45] },
    { id: "right_thigh", label: "Coxa Direita", category: "circumferences", required: false, unit: "cm", normalRange: [40, 75] },
    { id: "left_thigh", label: "Coxa Esquerda", category: "circumferences", required: false, unit: "cm", normalRange: [40, 75] },
    { id: "right_calf", label: "Panturrilha Direita", category: "circumferences", required: false, unit: "cm", normalRange: [25, 45] },
    { id: "left_calf", label: "Panturrilha Esquerda", category: "circumferences", required: false, unit: "cm", normalRange: [25, 45] },
    
    // 7 Dobras obrigatórias
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40] },
    { id: "subscapular", label: "Subescapular", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] },
    { id: "chest", label: "Peitoral", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 35] },
    { id: "midaxillary", label: "Axilar Média", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40] },
    { id: "suprailiac", label: "Suprailíaca", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] },
    { id: "abdominal", label: "Abdominal", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 50] },
    { id: "thigh", label: "Coxa", category: "skinfolds", required: true, unit: "mm", normalRange: [8, 50] }
  ],
  
  "Durnin & Womersley": [
    // Circunferências básicas
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [60, 120] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [80, 140] },
    
    // 4 Dobras obrigatórias
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40] },
    { id: "biceps", label: "Bíceps", category: "skinfolds", required: true, unit: "mm", normalRange: [3, 25] },
    { id: "subscapular", label: "Subescapular", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] },
    { id: "suprailiac", label: "Suprailíaca", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] }
  ],
  
  "Guedes (1994)": [
    // Circunferências básicas
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [60, 120] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [80, 140] },
    
    // 3 Dobras obrigatórias
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40] },
    { id: "suprailiac", label: "Suprailíaca", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] },
    { id: "abdominal", label: "Abdominal", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 50] }
  ],
  
  "ACSM": [
    // Mesmos campos que Jackson & Pollock 3 dobras
    { id: "neck", label: "Pescoço", category: "circumferences", required: false, unit: "cm", normalRange: [30, 45] },
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [60, 120] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [80, 140] },
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 40] },
    { id: "suprailiac", label: "Suprailíaca", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 45] },
    { id: "thigh", label: "Coxa", category: "skinfolds", required: true, unit: "mm", normalRange: [8, 50] },
    { id: "chest", label: "Peitoral", category: "skinfolds", required: true, unit: "mm", normalRange: [5, 35] }
  ],
  
  "PROESP-BR": [
    // Circunferências básicas para jovens
    { id: "waist", label: "Cintura", category: "circumferences", required: false, unit: "cm", normalRange: [50, 90] },
    { id: "hips", label: "Quadril", category: "circumferences", required: false, unit: "cm", normalRange: [60, 110] },
    
    // 2 Dobras principais
    { id: "triceps", label: "Tríceps", category: "skinfolds", required: true, unit: "mm", normalRange: [4, 30] },
    { id: "subscapular", label: "Subescapular", category: "skinfolds", required: true, unit: "mm", normalRange: [4, 35] }
  ]
};

export default function DynamicMeasurements({
  protocol,
  gender,
  age,
  measurements,
  onMeasurementsChange,
  onCalculatedResults
}: DynamicMeasurementsProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);

  const fields = MEASUREMENT_FIELDS[protocol] || [];
  const circumferenceFields = fields.filter(f => f.category === 'circumferences');
  const skinfoldFields = fields.filter(f => f.category === 'skinfolds');

  useEffect(() => {
    calculateResults();
  }, [measurements, protocol, gender, age]);

  const calculateResults = () => {
    if (!canCalculate()) return;

    try {
      const results = performCalculations();
      setCalculatedResults(results);
      onCalculatedResults(results);
    } catch (error) {
      console.error('Erro no cálculo:', error);
    }
  };

  const canCalculate = () => {
    const requiredFields = fields.filter(f => f.required);
    return requiredFields.every(field => {
      const value = measurements[field.id];
      return value && !isNaN(parseFloat(value)) && parseFloat(value) > 0;
    });
  };

  const performCalculations = () => {
    const numericMeasurements: Record<string, number> = {};
    Object.entries(measurements).forEach(([key, value]) => {
      if (value) {
        numericMeasurements[key] = parseFloat(value);
      }
    });

    let bodyDensity: number;
    let fatPercentage: number;

    // Implementação dos cálculos por protocolo
    switch (protocol) {
      case "Jackson & Pollock (3 dobras)":
        bodyDensity = calculateJacksonPollock3(numericMeasurements, gender, age);
        break;
      case "Jackson & Pollock (7 dobras)":
        bodyDensity = calculateJacksonPollock7(numericMeasurements, gender, age);
        break;
      case "Durnin & Womersley":
        bodyDensity = calculateDurninWomersley(numericMeasurements, gender, age);
        break;
      case "Guedes (1994)":
        bodyDensity = calculateGuedes(numericMeasurements, gender);
        break;
      case "ACSM":
        bodyDensity = calculateJacksonPollock3(numericMeasurements, gender, age); // ACSM usa JP3
        break;
      case "PROESP-BR":
        bodyDensity = calculateProespBR(numericMeasurements, gender, age);
        break;
      default:
        throw new Error("Protocolo não implementado");
    }

    // Fórmula de Siri para converter densidade em percentual de gordura
    fatPercentage = ((4.95 / bodyDensity) - 4.50) * 100;

    // Validação dos resultados
    if (fatPercentage < 2 || fatPercentage > 50) {
      throw new Error("Resultado fora dos parâmetros normais. Verifique as medições.");
    }

    const weight = parseFloat(measurements.weight || "0");
    const fatMass = (fatPercentage / 100) * weight;
    const leanMass = weight - fatMass;

    // Cálculo do IMC se altura estiver disponível
    const height = parseFloat(measurements.height || "0") / 100; // converter cm para m
    const bmi = height > 0 ? weight / (height * height) : 0;

    return {
      body_density: bodyDensity.toFixed(4),
      fat_percentage: fatPercentage.toFixed(2),
      fat_mass: fatMass.toFixed(2),
      lean_mass: leanMass.toFixed(2),
      bmi: bmi > 0 ? bmi.toFixed(1) : null,
      calculations_used: protocol
    };
  };

  // Implementações específicas dos protocolos
  const calculateJacksonPollock3 = (measurements: Record<string, number>, gender: string, age: number): number => {
    if (gender === "male") {
      const sum = measurements.chest + measurements.abdominal + measurements.thigh;
      return 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age);
    } else {
      const sum = measurements.triceps + measurements.suprailiac + measurements.thigh;
      return 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
    }
  };

  const calculateJacksonPollock7 = (measurements: Record<string, number>, gender: string, age: number): number => {
    if (gender === "male") {
      const sum = measurements.triceps + measurements.subscapular + measurements.chest + 
                   measurements.midaxillary + measurements.suprailiac + measurements.abdominal + measurements.thigh;
      return 1.112 - (0.00043499 * sum) + (0.00000055 * Math.pow(sum, 2)) - (0.00028826 * age);
    } else {
      const sum = measurements.triceps + measurements.subscapular + measurements.chest + 
                   measurements.midaxillary + measurements.suprailiac + measurements.abdominal + measurements.thigh;
      return 1.097 - (0.00046971 * sum) + (0.00000056 * Math.pow(sum, 2)) - (0.00012828 * age);
    }
  };

  const calculateDurninWomersley = (measurements: Record<string, number>, gender: string, age: number): number => {
    const sum = measurements.triceps + measurements.biceps + measurements.subscapular + measurements.suprailiac;
    const logSum = Math.log10(sum);

    if (gender === "male") {
      if (age >= 17 && age <= 19) return 1.1620 - 0.0630 * logSum;
      if (age >= 20 && age <= 29) return 1.1631 - 0.0632 * logSum;
      if (age >= 30 && age <= 39) return 1.1422 - 0.0544 * logSum;
      if (age >= 40 && age <= 49) return 1.1620 - 0.0700 * logSum;
      if (age >= 50) return 1.1715 - 0.0779 * logSum;
    } else {
      if (age >= 16 && age <= 19) return 1.1549 - 0.0678 * logSum;
      if (age >= 20 && age <= 29) return 1.1599 - 0.0717 * logSum;
      if (age >= 30 && age <= 39) return 1.1423 - 0.0632 * logSum;
      if (age >= 40 && age <= 49) return 1.1333 - 0.0612 * logSum;
      if (age >= 50) return 1.1339 - 0.0645 * logSum;
    }
    
    // Fallback para idades fora do range
    return gender === "male" ? 1.1620 - 0.0630 * logSum : 1.1549 - 0.0678 * logSum;
  };

  const calculateGuedes = (measurements: Record<string, number>, gender: string): number => {
    const sum = measurements.triceps + measurements.suprailiac + measurements.abdominal;
    const logSum = Math.log10(sum);
    
    if (gender === "male") {
      return 1.17136 - 0.06706 * logSum;
    } else {
      return 1.16650 - 0.07063 * logSum;
    }
  };

  const calculateProespBR = (measurements: Record<string, number>, gender: string, age: number): number => {
    const sum = measurements.triceps + measurements.subscapular;
    
    // Fórmulas específicas para jovens brasileiros
    if (gender === "male") {
      return 1.1533 - 0.0643 * Math.log10(sum);
    } else {
      return 1.1369 - 0.0598 * Math.log10(sum);
    }
  };

  const validateMeasurement = (field: MeasurementField, value: string): string | null => {
    if (!value) {
      return field.required ? "Campo obrigatório" : null;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return "Valor deve ser um número positivo";
    }

    if (field.normalRange) {
      const [min, max] = field.normalRange;
      if (numValue < min || numValue > max) {
        return `Valor fora do esperado (${min}-${max} ${field.unit})`;
      }
    }

    return null;
  };

  const handleMeasurementChange = (fieldId: string, value: string) => {
    const newMeasurements = { ...measurements, [fieldId]: value };
    onMeasurementsChange(newMeasurements);

    // Validação
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateMeasurement(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: error || ''
      }));
    }
  };

  const getFieldStatus = (field: MeasurementField): 'empty' | 'valid' | 'invalid' | 'warning' => {
    const value = measurements[field.id];
    const error = validationErrors[field.id];
    
    if (!value) return 'empty';
    if (error) return error.includes('fora do esperado') ? 'warning' : 'invalid';
    return 'valid';
  };

  const getCompletionPercentage = () => {
    const requiredFields = fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => measurements[f.id] && !validationErrors[f.id]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const getFieldsInCategory = (category: 'circumferences' | 'skinfolds') => {
    return fields.filter(f => f.category === category);
  };

  const renderMeasurementField = (field: MeasurementField) => {
    const status = getFieldStatus(field);
    const value = measurements[field.id] || '';
    const error = validationErrors[field.id];
    
    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.id} className="text-sm font-medium flex items-center gap-2">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
            {status === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'invalid' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            {status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
          </Label>
          <span className="text-xs text-gray-500">{field.unit}</span>
        </div>
        
        <Input
          id={field.id}
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
          className={cn(
            "transition-all duration-200",
            status === 'valid' && "border-green-500 focus:border-green-600",
            status === 'invalid' && "border-red-500 focus:border-red-600",
            status === 'warning' && "border-yellow-500 focus:border-yellow-600"
          )}
          placeholder={`Ex: ${field.normalRange ? field.normalRange[0] : '0'}`}
        />
        
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
        
        {error && (
          <p className={cn(
            "text-xs",
            error.includes('fora do esperado') ? "text-yellow-600" : "text-red-500"
          )}>
            {error}
          </p>
        )}
      </div>
    );
  };

  if (!protocol) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Selecione um protocolo para visualizar os campos de medição necessários.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso das Medições</span>
            <span className="text-sm text-gray-600">{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Dobras Cutâneas */}
      {skinfoldFields.length > 0 && (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Ruler className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Dobras Cutâneas</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Medições em milímetros (mm) • {skinfoldFields.filter(f => f.required).length} obrigatórias
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skinfoldFields.map(renderMeasurementField)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Circunferências */}
      {circumferenceFields.length > 0 && (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Circunferências</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Medições em centímetros (cm) • Complementares para análise
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circumferenceFields.map(renderMeasurementField)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados Calculados */}
      {calculatedResults && (
        <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200">
                  Resultados Calculados
                </CardTitle>
                <p className="text-green-600 dark:text-green-300 text-sm">
                  Protocolo: {calculatedResults.calculations_used}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Densidade Corporal</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculatedResults.body_density}
                </div>
                <div className="text-xs text-gray-500">g/ml</div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">% Gordura</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculatedResults.fat_percentage}%
                </div>
                <Badge className={cn(
                  "text-xs mt-1",
                  parseFloat(calculatedResults.fat_percentage) < 10 ? "bg-blue-100 text-blue-800" :
                  parseFloat(calculatedResults.fat_percentage) < 20 ? "bg-green-100 text-green-800" :
                  parseFloat(calculatedResults.fat_percentage) < 25 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {parseFloat(calculatedResults.fat_percentage) < 10 ? "Muito Baixo" :
                   parseFloat(calculatedResults.fat_percentage) < 20 ? "Normal" :
                   parseFloat(calculatedResults.fat_percentage) < 25 ? "Moderado" : "Alto"}
                </Badge>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Massa Gorda</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculatedResults.fat_mass}
                </div>
                <div className="text-xs text-gray-500">kg</div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Massa Magra</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculatedResults.lean_mass}
                </div>
                <div className="text-xs text-gray-500">kg</div>
              </div>
            </div>

            {calculatedResults.bmi && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Índice de Massa Corporal (IMC)</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calculatedResults.bmi}
                    </div>
                  </div>
                  <Badge className={cn(
                    parseFloat(calculatedResults.bmi) < 18.5 ? "bg-yellow-100 text-yellow-800" :
                    parseFloat(calculatedResults.bmi) < 25 ? "bg-green-100 text-green-800" :
                    parseFloat(calculatedResults.bmi) < 30 ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {parseFloat(calculatedResults.bmi) < 18.5 ? "Abaixo do Peso" :
                     parseFloat(calculatedResults.bmi) < 25 ? "Peso Normal" :
                     parseFloat(calculatedResults.bmi) < 30 ? "Sobrepeso" : "Obesidade"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {Object.values(validationErrors).some(error => error) && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Atenção:</strong> Algumas medições estão fora dos valores esperados. 
            Verifique se os valores estão corretos antes de finalizar a avaliação.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}