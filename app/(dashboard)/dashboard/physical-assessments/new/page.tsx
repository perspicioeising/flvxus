// /opt/flvxus/app/(dashboard)/dashboard/physical-assessments/new/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Calculator,
  Brain,
  Target,
  Ruler,
  Weight,
  Activity,
  Save,
  Sparkles,
  BarChart3,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Scale,
  Heart,
  Calendar
} from 'lucide-react';

// Constantes - ADICIONADO PROTOCOLO GUEDES 1994
const BODY_PROTOCOLS = [
  { value: "jackson_pollock_3", label: "Jackson & Pollock (3 dobras)", gender: "both", description: "Protocolo padrão com 3 pontos de medição" },
  { value: "jackson_pollock_7", label: "Jackson & Pollock (7 dobras)", gender: "both", description: "Protocolo mais preciso com 7 pontos" },
  { value: "durnin_womersley", label: "Durnin & Womersley", gender: "both", description: "Protocolo clássico de 4 dobras" },
  { value: "slaughter", label: "Slaughter et al.", gender: "both", description: "Específico para adolescentes" },
  { value: "boileau", label: "Boileau et al.", gender: "youth", description: "Para jovens atletas" },
  { value: "guedes_1994", label: "Guedes 1994", gender: "both", description: "Protocolo brasileiro para população jovem" }
];

const MEASUREMENT_FIELDS = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', icon: '🔵' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', icon: '🔵' },
    { key: 'chest', label: 'Tórax', unit: 'cm', icon: '🔵' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', icon: '🔵' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: '🔵' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', icon: '🔵' },
    { key: 'hips', label: 'Quadril', unit: 'cm', icon: '🔵' },
    { key: 'left_arm', label: 'Braço Esquerdo', unit: 'cm', icon: '🔵' },
    { key: 'right_arm', label: 'Braço Direito', unit: 'cm', icon: '🔵' },
    { key: 'left_thigh', label: 'Coxa Esquerda', unit: 'cm', icon: '🔵' },
    { key: 'right_thigh', label: 'Coxa Direita', unit: 'cm', icon: '🔵' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', icon: '🔵' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', icon: '🔵' }
  ],
  skinfolds: [
    { key: 'triceps', label: 'Tríceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'durnin_womersley', 'guedes_1994'] },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley'] },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley', 'guedes_1994'] },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'] },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley'] },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7'] },
    { key: 'thigh', label: 'Coxa', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'] },
    { key: 'chest', label: 'Peitoral', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3'] }
  ]
};

interface Student {
  id: string;
  full_name: string;
  birth_date: string; // CORRIGIDO: era birthDate, agora é birth_date
  gender: string;
  height: number;
  weight: number;
  goals: string[];
}


export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [calculations, setCalculations] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [assessment, setAssessment] = useState({
    student_id: '',
    protocol: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    age: '',
    gender: '',
    measurements: {} as Record<string, string>,
    notes: ''
  });

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
        // Verificar se é trainer
        if (data.role !== 'trainer') {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Apenas treinadores podem criar avaliações físicas.",
          });
          router.push('/dashboard/physical-assessments');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  }, [router, toast]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStudents(data.students || []);

      // Se há um student_id na URL, selecionar automaticamente
      const preSelectedStudentId = searchParams.get('student');
      if (preSelectedStudentId) {
        const student = data.students?.find((s: Student) => s.id === preSelectedStudentId);
        if (student) {
          handleStudentSelect(student);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const initializePage = async () => {
      await fetchUserRole();
      await fetchStudents();
    };
    initializePage();
  }, [fetchUserRole, fetchStudents]);

  // CORRIGIDO: Função para calcular idade
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);

    // Verificar se a data é válida
    if (isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age); // Garantir que não retorne idade negativa
  };

  // Selecionar aluno
  const handleStudentSelect = (student: Student) => {
    console.log('Student data:', student); // Debug
    const calculatedAge = calculateAge(student.birth_date);
    console.log('Calculated age:', calculatedAge); // Debug

    setSelectedStudent(student);
    setAssessment(prev => ({
      ...prev,
      student_id: student.id,
      age: calculatedAge.toString(),
      gender: student.gender,
      height: student.height?.toString() || '',
      weight: student.weight?.toString() || ''
    }));
    setActiveTab('protocol');
  };

  // Calcular composição corporal - ADICIONADO PROTOCOLO GUEDES 1994
  const calculateBodyComposition = useCallback(() => {
    const { weight, height, age, gender, protocol, measurements } = assessment;

    if (!weight || !height || !protocol || !age) return null;

    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightM * heightM);
    const ageNum = parseInt(age);

    let bodyDensity = 0;
    let fatPercentage = 0;

    // Cálculos baseados no protocolo selecionado
    switch (protocol) {
      case 'jackson_pollock_3':
        if (gender === 'male') {
          const sum3 = (parseFloat(measurements.chest) || 0) +
            (parseFloat(measurements.abdominal) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.10938 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * ageNum);
        } else {
          const sum3 = (parseFloat(measurements.triceps) || 0) +
            (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.0994921 - (0.0009929 * sum3) + (0.0000023 * sum3 * sum3) - (0.0001392 * ageNum);
        }
        break;

      case 'jackson_pollock_7':
        const sum7 = Object.values(measurements).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        if (gender === 'male') {
          bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * ageNum);
        } else {
          bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * ageNum);
        }
        break;

      case 'durnin_womersley':
        const sumDW = (parseFloat(measurements.biceps) || 0) +
          (parseFloat(measurements.triceps) || 0) +
          (parseFloat(measurements.subscapular) || 0) +
          (parseFloat(measurements.suprailiac) || 0);
        if (gender === 'male') {
          bodyDensity = 1.1765 - (0.0744 * Math.log10(sumDW));
        } else {
          bodyDensity = 1.1567 - (0.0717 * Math.log10(sumDW));
        }
        break;

      // NOVO PROTOCOLO GUEDES 1994
      case 'guedes_1994':
        const sumGuedes = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0);
        if (gender === 'male') {
          fatPercentage = (0.735 * sumGuedes) + 1.0;
        } else {
          fatPercentage = (0.610 * sumGuedes) + 5.1;
        }
        break;

      default:
        // Estimativa básica usando IMC
        if (gender === 'male') {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 16.2;
        } else {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 5.4;
        }
    }

    if (bodyDensity > 0) {
      fatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
    }

    const fatMass = (parseFloat(weight) * fatPercentage) / 100;
    const leanMass = parseFloat(weight) - fatMass;

    return {
      bmi: parseFloat(bmi.toFixed(2)),
      bodyDensity: parseFloat(bodyDensity.toFixed(4)),
      fatPercentage: parseFloat(Math.max(0, fatPercentage).toFixed(2)),
      fatMass: parseFloat(Math.max(0, fatMass).toFixed(2)),
      leanMass: parseFloat(leanMass.toFixed(2))
    };
  }, [assessment]);

  // Recalcular quando dados mudarem
  useEffect(() => {
    if (assessment.weight && assessment.height && assessment.protocol && assessment.age) {
      const calc = calculateBodyComposition();
      setCalculations(calc);
    }
  }, [assessment, calculateBodyComposition]);

  // CORRIGIDO: Analisar com IA
  const analyzeWithAI = async () => {
    setIsAnalyzing(true);

    try {
      if (!calculations) {
        throw new Error('Dados insuficientes para análise');
      }

      // CORRIGIDO: Preparar dados corretamente
      const requestData = {
        assessmentData: {
          age: parseInt(assessment.age),
          gender: assessment.gender as 'male' | 'female',
          weight: parseFloat(assessment.weight),
          height: parseFloat(assessment.height),
          bmi: calculations.bmi,
          fatPercentage: calculations.fatPercentage,
          fatMass: calculations.fatMass,
          leanMass: calculations.leanMass,
          protocol: assessment.protocol
        },
        studentInfo: {
          name: selectedStudent?.full_name,
          goals: selectedStudent?.goals || []
        },
        previousAssessments: [] // TODO: Buscar avaliações anteriores
      };

      console.log('Sending to AI:', requestData); // Debug

      const response = await fetch('/api/physical-assessments/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na análise IA');
      }

      setAiAnalysis(data.analysis);
      setActiveTab('analysis');

      toast({
        title: "Análise IA concluída!",
        description: "A inteligência artificial gerou recomendações personalizadas.",
      });

    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      toast({
        variant: "destructive",
        title: "Erro na análise IA",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Salvar avaliação
  const saveAssessment = async () => {
    setIsLoading(true);

    try {
      if (!calculations) {
        throw new Error('Complete os dados básicos para salvar');
      }

      const response = await fetch('/api/physical-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...assessment,
          // Adicionar os cálculos aos dados
          bmi: calculations.bmi,
          fat_percentage: calculations.fatPercentage,
          fat_mass: calculations.fatMass,
          lean_mass: calculations.leanMass,
          body_density: calculations.bodyDensity,
          ai_analysis: aiAnalysis,
          ai_recommendations: aiAnalysis ? {
            training: aiAnalysis.recommendations?.training,
            nutrition: aiAnalysis.recommendations?.nutrition,
            lifestyle: aiAnalysis.recommendations?.lifestyle
          } : null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação salva com sucesso!",
        description: "A avaliação física foi criada e está disponível para consulta.",
      });

      router.push('/dashboard/physical-assessments');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar avaliação",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se campos obrigatórios estão preenchidos - ATUALIZADO PARA GUEDES
  const getRequiredFields = (protocol: string) => {
    const required = MEASUREMENT_FIELDS.skinfolds.filter(field =>
      field.required && field.required.includes(protocol)
    );
    return required.map(field => field.key);
  };

  const hasRequiredMeasurements = () => {
    if (!assessment.protocol) return false;
    const required = getRequiredFields(assessment.protocol);
    return required.every(field => assessment.measurements[field]);
  };

  // Atualizar medida
  const handleMeasurementChange = (field: string, value: string) => {
    setAssessment(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </Button>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Nova Avaliação Física
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Sistema inteligente de análise corporal com IA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'basic', label: 'Dados Básicos', icon: User },
              { id: 'protocol', label: 'Protocolo', icon: Calculator },
              { id: 'measurements', label: 'Medidas', icon: Ruler },
              { id: 'results', label: 'Resultados', icon: BarChart3 },
              { id: 'analysis', label: 'Análise IA', icon: Brain }
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = ['basic', 'protocol', 'measurements', 'results'].indexOf(step.id) < ['basic', 'protocol', 'measurements', 'results'].indexOf(activeTab);

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                  {index < 4 && (
                    <div className={`mx-4 h-0.5 w-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Dados Básicos */}
          <TabsContent value="basic">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Aluno</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Escolha o aluno para a avaliação física
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    {/* Aluno selecionado */}
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                          {selectedStudent.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {selectedStudent.full_name}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>{assessment.age} anos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span>{selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                            </div>
                            {selectedStudent.height && (
                              <div className="flex items-center gap-2">
                                <Ruler className="h-4 w-4 text-green-600" />
                                <span>{selectedStudent.height}cm</span>
                              </div>
                            )}
                            {selectedStudent.weight && (
                              <div className="flex items-center gap-2">
                                <Weight className="h-4 w-4 text-green-600" />
                                <span>{selectedStudent.weight}kg</span>
                              </div>
                            )}
                          </div>
                          {selectedStudent.goals && selectedStudent.goals.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {selectedStudent.goals.map((goal, index) => (
                                  <Badge key={index} className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
                                    {goal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedStudent(null)}
                          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          Alterar
                        </Button>
                      </div>
                    </div>

                    {/* Dados da avaliação */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Peso Atual (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={assessment.weight}
                          onChange={(e) => setAssessment(prev => ({ ...prev, weight: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                          placeholder="70.5"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Altura (cm)</Label>
                        <Input
                          type="number"
                          value={assessment.height}
                          onChange={(e) => setAssessment(prev => ({ ...prev, height: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                          placeholder="175"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data da Avaliação</Label>
                        <Input
                          type="date"
                          value={assessment.date}
                          onChange={(e) => setAssessment(prev => ({ ...prev, date: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => setActiveTab('protocol')}
                        disabled={!assessment.weight || !assessment.height}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
                      >
                        Próximo: Protocolo
                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="group cursor-pointer p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {student.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {student.full_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {calculateAge(student.birth_date)} anos • {student.gender === 'male' ? 'M' : 'F'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protocolo */}
          <TabsContent value="protocol">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Protocolo de Avaliação</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Selecione o método de cálculo da composição corporal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {BODY_PROTOCOLS.map((protocol) => (
                    <div
                      key={protocol.value}
                      onClick={() => setAssessment(prev => ({ ...prev, protocol: protocol.value }))}
                      className={`group cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 ${assessment.protocol === protocol.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${assessment.protocol === protocol.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                          <Calculator className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-lg mb-2 ${assessment.protocol === protocol.value
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-900 dark:text-white'
                            }`}>
                            {protocol.label}
                          </h4>
                          <p className={`text-sm ${assessment.protocol === protocol.value
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {protocol.description}
                          </p>
                          {assessment.protocol === protocol.value && (
                            <Badge className="mt-3 bg-purple-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selecionado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {assessment.protocol && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          Campos obrigatórios para {BODY_PROTOCOLS.find(p => p.value === assessment.protocol)?.label}:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {getRequiredFields(assessment.protocol).map((field) => {
                            const fieldInfo = MEASUREMENT_FIELDS.skinfolds.find(f => f.key === field);
                            return (
                              <Badge key={field} className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600">
                                {fieldInfo?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('basic')}
                    className="px-6 py-3 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setActiveTab('measurements')}
                    disabled={!assessment.protocol}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl"
                  >
                    Próximo: Medidas
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medidas */}
          <TabsContent value="measurements">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Ruler className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Medidas Corporais</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Insira as medidas de circunferências e dobras cutâneas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="skinfolds" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="skinfolds" className="flex items-center gap-2">
                      <span className="text-xl">🟡</span>
                      Dobras Cutâneas
                    </TabsTrigger>
                    <TabsTrigger value="circumferences" className="flex items-center gap-2">
                      <span className="text-xl">🔵</span>
                      Circunferências
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="skinfolds" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {MEASUREMENT_FIELDS.skinfolds.map((field) => {
                        const isRequired = assessment.protocol && getRequiredFields(assessment.protocol).includes(field.key);
                        return (
                          <div key={field.key} className={`space-y-2 p-4 rounded-xl border-2 transition-all ${isRequired
                            ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20'
                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                            }`}>
                            <Label className={`text-sm font-semibold flex items-center gap-2 ${isRequired ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'
                              }`}>
                              <span className="text-lg">{field.icon}</span>
                              {field.label}
                              {isRequired && <span className="text-red-500">*</span>}
                              <span className="text-xs text-gray-500">({field.unit})</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={assessment.measurements[field.key] || ''}
                              onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                              className={`h-10 transition-all ${isRequired
                                ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500'
                                : 'border-gray-200 dark:border-gray-700'
                                }`}
                              placeholder="0.0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="circumferences" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {MEASUREMENT_FIELDS.circumferences.map((field) => (
                        <div key={field.key} className="space-y-2 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <span className="text-lg">{field.icon}</span>
                            {field.label}
                            <span className="text-xs text-gray-500">({field.unit})</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={assessment.measurements[field.key] || ''}
                            onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                            className="h-10 border-gray-200 dark:border-gray-700"
                            placeholder="0.0"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('protocol')}
                    className="px-6 py-3 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setActiveTab('results')}
                    disabled={!hasRequiredMeasurements()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl"
                  >
                    Ver Resultados
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resultados */}
          <TabsContent value="results">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Resultados da Avaliação</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Composição corporal calculada automaticamente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {calculations ? (
                  <>
                    {/* Métricas principais */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calculations.bmi}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">IMC</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{calculations.fatPercentage}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">% Gordura</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{calculations.fatMass}kg</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Massa Gorda</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{calculations.leanMass}kg</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Massa Magra</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{calculations.bodyDensity}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Densidade</div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700 dark:text-gray-200">Observações da Avaliação</Label>
                      <Textarea
                        placeholder="Adicione observações sobre a avaliação, condições especiais, limitações encontradas..."
                        value={assessment.notes}
                        onChange={(e) => setAssessment(prev => ({ ...prev, notes: e.target.value }))}
                        className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl resize-none"
                      />
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('measurements')}
                        className="px-6 py-3 rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar às Medidas
                      </Button>

                      <div className="flex-1 flex gap-3">
                        <Button
                          onClick={analyzeWithAI}
                          disabled={isAnalyzing}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Analisar com IA
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={saveAssessment}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl"
                        >
                          {isLoading ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Avaliação
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Dados insuficientes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Complete as medidas obrigatórias para ver os resultados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análise IA */}
          <TabsContent value="analysis">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Recomendações personalizadas geradas por IA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {aiAnalysis ? (
                  <div className="space-y-6">
                    {/* Classificação */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                      <h4 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-3">
                        Classificação da Composição Corporal
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                            {aiAnalysis.classification}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Status Atual</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                            {aiAnalysis.somatotype}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Somatótipo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-green-600 dark:text-green-400">
                            {aiAnalysis.healthStatus}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Status de Saúde</div>
                        </div>
                      </div>
                    </div>

                    {/* Recomendações de Treino */}
                    {Object.entries(aiAnalysis.recommendations.training).map(([key, value]) => (
                      <div key={key} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="font-semibold text-blue-700 dark:text-blue-300 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </div>
                        <div className="text-gray-900 dark:text-white text-sm">
                          {value as React.ReactNode}
                        </div>
                      </div>
                    ))}


                    {/* Recomendações Nutricionais */}
                    {aiAnalysis.recommendations?.nutrition && (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                        <h4 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                          <Heart className="h-6 w-6" />
                          Recomendações Nutricionais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(aiAnalysis.recommendations.nutrition).map(([key, value]) => (
                            <div key={key} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <div className="font-semibold text-green-700 dark:text-green-300 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </div>
                              <div className="text-gray-900 dark:text-white text-sm">
                                {value as React.ReactNode}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {/* Pontos Fortes e Melhorias */}
                    {aiAnalysis.analysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pontos Fortes */}
                        {aiAnalysis.analysis.strengths && aiAnalysis.analysis.strengths.length > 0 && (
                          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
                            <h5 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5" />
                              Pontos Fortes
                            </h5>
                            <ul className="space-y-2">
                              {aiAnalysis.analysis.strengths.map((strength: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-green-700 dark:text-green-300 text-sm">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Áreas de Melhoria */}
                        {aiAnalysis.analysis.improvements && aiAnalysis.analysis.improvements.length > 0 && (
                          <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-orange-200 dark:border-orange-700">
                            <h5 className="font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Áreas de Melhoria
                            </h5>
                            <ul className="space-y-2">
                              {aiAnalysis.analysis.improvements.map((improvement: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-orange-700 dark:text-orange-300 text-sm">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fatores de Risco */}
                    {aiAnalysis.analysis?.risks && aiAnalysis.analysis.risks.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-700">
                        <h5 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Fatores de Risco Identificados
                        </h5>
                        <ul className="space-y-2">
                          {aiAnalysis.analysis.risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-red-700 dark:text-red-300 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Acompanhamento */}
                    {aiAnalysis.progressTracking && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl">
                        <h4 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                          <BarChart3 className="h-6 w-6" />
                          Plano de Acompanhamento
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Próxima Avaliação:</div>
                            <div className="text-gray-900 dark:text-white text-sm">{aiAnalysis.progressTracking.nextAssessment}</div>
                          </div>
                          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Timeline Esperada:</div>
                            <div className="text-gray-900 dark:text-white text-sm">{aiAnalysis.progressTracking.expectedTimeline}</div>
                          </div>
                          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Métricas Chave:</div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {aiAnalysis.progressTracking.keyMetrics?.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Observações Específicas */}
                    {aiAnalysis.specificNotes && (
                      <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          Observações Específicas
                        </h5>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                          {aiAnalysis.specificNotes}
                        </p>
                      </div>
                    )}

                    {/* Ações finais */}
                    <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('results')}
                        className="px-6 py-3 rounded-xl"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar aos Resultados
                      </Button>
                      <Button
                        onClick={saveAssessment}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar com Análise IA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Análise IA não disponível
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-6">
                      Volte à aba "Resultados" e clique em "Analisar com IA" para gerar recomendações personalizadas
                    </p>
                    <Button
                      onClick={() => setActiveTab('results')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Ir para Resultados
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}