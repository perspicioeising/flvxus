// /opt/flvxus/app/(dashboard)/dashboard/physical-assessments/new/page.tsx - REFATORADO
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
import AssessmentAIAnalysis from '@/components/AssessmentAIAnalysis';
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
  Calendar,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';

// Constantes (iguais ao código anterior)
const BODY_PROTOCOLS = [
  { value: "jackson_pollock_3", label: "Jackson & Pollock (3 dobras)", gender: "both", description: "Protocolo padrão com 3 pontos de medição", color: "from-blue-500 to-cyan-500" },
  { value: "jackson_pollock_7", label: "Jackson & Pollock (7 dobras)", gender: "both", description: "Protocolo mais preciso com 7 pontos", color: "from-purple-500 to-pink-500" },
  { value: "durnin_womersley", label: "Durnin & Womersley", gender: "both", description: "Protocolo clássico de 4 dobras", color: "from-green-500 to-emerald-500" },
  { value: "slaughter", label: "Slaughter et al.", gender: "both", description: "Específico para adolescentes", color: "from-orange-500 to-red-500" },
  { value: "boileau", label: "Boileau et al.", gender: "youth", description: "Para jovens atletas", color: "from-indigo-500 to-purple-500" },
  { value: "guedes_1994", label: "Guedes 1994", gender: "both", description: "Protocolo brasileiro para população jovem", color: "from-yellow-500 to-orange-500" }
];

const MEASUREMENT_FIELDS = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'chest', label: 'Tórax', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'hips', label: 'Quadril', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'left_arm', label: 'Braço Esquerdo', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'right_arm', label: 'Braço Direito', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'left_thigh', label: 'Coxa Esquerda', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'right_thigh', label: 'Coxa Direita', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', icon: '🔵', color: 'from-blue-500 to-cyan-500' }
  ],
  skinfolds: [
    { key: 'triceps', label: 'Tríceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley'], color: 'from-yellow-500 to-orange-500' },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley'], color: 'from-yellow-500 to-orange-500' },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' },
    { key: 'thigh', label: 'Coxa', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' },
    { key: 'chest', label: 'Peitoral', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3'], color: 'from-yellow-500 to-orange-500' }
  ]
};

interface Student {
  id: string;
  full_name: string;
  birthDate: string;
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

  // Funções existentes (iguais ao código anterior)
  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleStudentSelect = (student: Student) => {
    const calculatedAge = calculateAge(student.birthDate);
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

  const calculateBodyComposition = useCallback(() => {
    const { weight, height, age, gender, protocol, measurements } = assessment;

    if (!weight || !height || !protocol || !age) return null;

    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightM * heightM);
    const ageNum = parseInt(age);

    let bodyDensity = 0;
    let fatPercentage = 0;

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

      case 'guedes_1994':
        const sumGuedes = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0);
        if (gender === 'male') {
          fatPercentage = (0.735 * sumGuedes) + 1.0;
        } else {
          fatPercentage = (0.610 * sumGuedes) + 5.1;
        }
        break;

      default:
        if (gender === 'male') {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 16.2;
        } else {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 5.4;
        }
    }

    if (bodyDensity > 0 && protocol !== 'guedes_1994') {
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

  useEffect(() => {
    if (assessment.weight && assessment.height && assessment.protocol && assessment.age) {
      const calc = calculateBodyComposition();
      setCalculations(calc);
    }
  }, [assessment, calculateBodyComposition]);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);

    try {
      if (!calculations) {
        throw new Error('Dados insuficientes para análise');
      }

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
        previousAssessments: []
      };

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
        title: "Análise IA concluída! 🧠",
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

  const saveAssessment = async () => {
    setIsLoading(true);

    try {
      if (!calculations) {
        throw new Error('Complete os dados básicos para salvar');
      }

      const requestData = {
        student_id: assessment.student_id,
        protocol: assessment.protocol,
        date: assessment.date,
        weight: assessment.weight,
        height: assessment.height,
        age: assessment.age,
        gender: assessment.gender,
        measurements: assessment.measurements,
        notes: assessment.notes,
        bmi: calculations.bmi,
        fat_percentage: calculations.fatPercentage,
        fat_mass: calculations.fatMass,
        lean_mass: calculations.leanMass,
        body_density: calculations.bodyDensity,
        ai_analysis: aiAnalysis || null,
        ai_recommendations: aiAnalysis ? {
          training: aiAnalysis.recommendations?.training || null,
          nutrition: aiAnalysis.recommendations?.nutrition || null,
          lifestyle: aiAnalysis.recommendations?.lifestyle || null
        } : null
      };

      const response = await fetch('/api/physical-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação salva com sucesso! 🎉",
        description: `Avaliação física criada${aiAnalysis ? ' com análise IA' : ''} e está disponível para consulta.`,
      });

      router.push('/dashboard/physical-assessments');

    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar avaliação",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
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
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-y-4">
            {[
              { id: 'basic', label: 'Dados Básicos', icon: User, color: 'from-blue-500 to-cyan-500' },
              { id: 'protocol', label: 'Protocolo', icon: Calculator, color: 'from-purple-500 to-pink-500' },
              { id: 'measurements', label: 'Medidas', icon: Ruler, color: 'from-green-500 to-emerald-500' },
              { id: 'results', label: 'Resultados', icon: BarChart3, color: 'from-orange-500 to-red-500' },
              { id: 'analysis', label: 'Análise IA', icon: Brain, color: 'from-indigo-500 to-purple-500' }
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = ['basic', 'protocol', 'measurements', 'results'].indexOf(step.id) < ['basic', 'protocol', 'measurements', 'results'].indexOf(activeTab);

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg ${isActive
                    ? `bg-gradient-to-r ${step.color} text-white transform scale-110`
                    : isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <StepIcon className="h-7 w-7" />
                    )}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                  {index < 4 && (
                    <div className={`mx-6 h-1 w-12 rounded-full transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Dados Básicos - Tab Content */}
          <TabsContent value="basic">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-blue-50/50 via-cyan-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-blue-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Aluno</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Escolha o aluno para a avaliação física
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {selectedStudent ? (
                    <div className="space-y-8">
                      {/* Aluno selecionado */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75"></div>
                        <div className="relative p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {selectedStudent.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedStudent.full_name}
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{assessment.age} anos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                                </div>
                                {selectedStudent.height && (
                                  <div className="flex items-center gap-2">
                                    <Ruler className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{selectedStudent.height}cm</span>
                                  </div>
                                )}
                                {selectedStudent.weight && (
                                  <div className="flex items-center gap-2">
                                    <Weight className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{selectedStudent.weight}kg</span>
                                  </div>
                                )}
                              </div>
                              {selectedStudent.goals && selectedStudent.goals.length > 0 && (
                                <div className="mt-4">
                                  <div className="flex flex-wrap gap-2">
                                    {selectedStudent.goals.map((goal, index) => (
                                      <Badge key={index} className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 rounded-full text-xs font-semibold dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                                        <Target className="h-3 w-3 mr-1" />
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
                              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl shadow-lg"
                            >
                              Alterar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Dados da avaliação */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Weight className="h-4 w-4 text-blue-600" />
                            Peso Atual (kg)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={assessment.weight}
                            onChange={(e) => setAssessment(prev => ({ ...prev, weight: e.target.value }))}
                            className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                            placeholder="70.5"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-purple-600" />
                            Altura (cm)
                          </Label>
                          <Input
                            type="number"
                            value={assessment.height}
                            onChange={(e) => setAssessment(prev => ({ ...prev, height: e.target.value }))}
                            className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                            placeholder="175"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Data da Avaliação
                          </Label>
                          <Input
                            type="date"
                            value={assessment.date}
                            onChange={(e) => setAssessment(prev => ({ ...prev, date: e.target.value }))}
                            className="h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Button
                          onClick={() => setActiveTab('protocol')}
                          disabled={!assessment.weight || !assessment.height}
                          className="px-10 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                        >
                          Próximo: Protocolo
                          <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className="group cursor-pointer relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                            
                            <CardContent className="relative p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                  {student.full_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {student.full_name}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {calculateAge(student.birthDate)} anos • {student.gender === 'male' ? 'M' : 'F'}
                                  </p>
                                </div>
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Protocolo Tab */}
          <TabsContent value="protocol">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-purple-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                        <Calculator className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Protocolo de Avaliação</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Selecione o método de cálculo da composição corporal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {BODY_PROTOCOLS.map((protocol) => (
                      <div
                        key={protocol.value}
                        onClick={() => setAssessment(prev => ({ ...prev, protocol: protocol.value }))}
                        className="group cursor-pointer relative"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${protocol.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${
                          assessment.protocol === protocol.value 
                            ? 'bg-gradient-to-r ' + protocol.color + ' text-white'
                            : 'bg-white/90 dark:bg-gray-900/90'
                        }`}>
                          
                          {assessment.protocol !== protocol.value && (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-r ${protocol.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                            </>
                          )}

                          <CardContent className="relative p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl shadow-lg ${
                                assessment.protocol === protocol.value
                                  ? 'bg-white/20'
                                  : 'bg-gradient-to-r ' + protocol.color
                              }`}>
                                <Calculator className={`h-6 w-6 ${
                                  assessment.protocol === protocol.value ? 'text-white' : 'text-white'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg mb-2 ${
                                  assessment.protocol === protocol.value
                                    ? 'text-white'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {protocol.label}
                                </h4>
                                <p className={`text-sm leading-relaxed ${
                                  assessment.protocol === protocol.value
                                    ? 'text-white/80'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {protocol.description}
                                </p>
                                {assessment.protocol === protocol.value && (
                                  <Badge className="mt-4 bg-white/20 text-white border-0 rounded-full font-bold">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Selecionado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>

                  {assessment.protocol && (
                    <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                          <Info className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-lg">
                            Campos obrigatórios para {BODY_PROTOCOLS.find(p => p.value === assessment.protocol)?.label}:
                          </h5>
                          <div className="flex flex-wrap gap-3">
                            {getRequiredFields(assessment.protocol).map((field) => {
                              const fieldInfo = MEASUREMENT_FIELDS.skinfolds.find(f => f.key === field);
                              return (
                                <Badge key={field} className={`px-3 py-1 bg-gradient-to-r ${fieldInfo?.color || 'from-blue-500 to-purple-500'} text-white border-0 rounded-full text-xs font-semibold shadow-lg`}>
                                  {fieldInfo?.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('basic')}
                      className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setActiveTab('measurements')}
                      disabled={!assessment.protocol}
                      className="px-10 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                    >
                      Próximo: Medidas
                      <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medidas Tab */}
          <TabsContent value="measurements">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                        <Ruler className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Medidas Corporais</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Insira as medidas de circunferências e dobras cutâneas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Tabs defaultValue="skinfolds" className="w-full">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
                      <TabsList className="relative grid w-full grid-cols-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
                        <TabsTrigger
                          value="skinfolds"
                          className="flex items-center gap-2 rounded-xl data-[state=active]:bg-yellow-600 data-[state=active]:text-white transition-all duration-300 font-semibold"
                        >
                          <span className="text-xl">🟡</span>
                          Dobras Cutâneas
                        </TabsTrigger>
                        <TabsTrigger
                          value="circumferences"
                          className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 font-semibold"
                        >
                          <span className="text-xl">🔵</span>
                          Circunferências
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="skinfolds" className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MEASUREMENT_FIELDS.skinfolds.map((field) => {
                          const isRequired = assessment.protocol && getRequiredFields(assessment.protocol).includes(field.key);
                          return (
                            <div key={field.key} className="group relative">
                              <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                              <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${
                                isRequired 
                                  ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
                                  : 'bg-white/90 dark:bg-gray-900/90'
                              }`}>
                                
                                {!isRequired && (
                                  <>
                                    <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                                  </>
                                )}

                                <CardContent className="relative p-6 space-y-4">
                                  <Label className={`text-base font-bold flex items-center gap-2 ${
                                    isRequired ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'
                                  }`}>
                                    <span className="text-xl">{field.icon}</span>
                                    {field.label}
                                    {isRequired && <span className="text-red-500 text-lg">*</span>}
                                    <Badge className={`ml-auto px-2 py-1 bg-gradient-to-r ${field.color} text-white border-0 rounded-full text-xs font-semibold`}>
                                      {field.unit}
                                    </Badge>
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={assessment.measurements[field.key] || ''}
                                    onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                                    className={`h-12 text-lg transition-all duration-300 ${
                                      isRequired
                                        ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white/80 dark:bg-gray-800/80'
                                        : 'border-0 bg-white/80 dark:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800'
                                    } rounded-xl shadow-lg backdrop-blur-sm`}
                                    placeholder="0.0"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="circumferences" className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MEASUREMENT_FIELDS.circumferences.map((field) => (
                          <div key={field.key} className="group relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                              
                              <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                              <CardContent className="relative p-6 space-y-4">
                                <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                  <span className="text-xl">{field.icon}</span>
                                  {field.label}
                                  <Badge className={`ml-auto px-2 py-1 bg-gradient-to-r ${field.color} text-white border-0 rounded-full text-xs font-semibold`}>
                                    {field.unit}
                                  </Badge>
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={assessment.measurements[field.key] || ''}
                                  onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                                  className="h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                                  placeholder="0.0"
                                />
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('protocol')}
                      className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setActiveTab('results')}
                      disabled={!hasRequiredMeasurements()}
                      className="px-10 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                    >
                      Ver Resultados
                      <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resultados Tab */}
          <TabsContent value="results">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-500/10 to-orange-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
                <CardHeader className="p-8 bg-gradient-to-r from-orange-50/50 via-red-50/50 to-orange-50/50 dark:from-orange-900/10 dark:via-red-900/10 dark:to-orange-900/10 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Resultados da Avaliação</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Composição corporal calculada automaticamente
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {calculations ? (
                    <>
                      {/* Métricas principais */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">IMC</p>
                                  <p className="text-3xl font-black text-gray-900 dark:text-white">{calculations.bmi}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                  <Scale className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                  style={{ width: `${Math.min((calculations.bmi / 35) * 100, 100)}%` }}></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wider">% Gordura</p>
                                  <p className="text-3xl font-black text-gray-900 dark:text-white">{calculations.fatPercentage}%</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                                  <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                  style={{ width: `${Math.min((calculations.fatPercentage / 35) * 100, 100)}%` }}></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">M. Gorda</p>
                                  <p className="text-3xl font-black text-gray-900 dark:text-white">{calculations.fatMass}kg</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                                  <Weight className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                                  style={{ width: `${(calculations.fatMass / parseFloat(assessment.weight)) * 100}%` }}></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">M. Magra</p>
                                  <p className="text-3xl font-black text-gray-900 dark:text-white">{calculations.leanMass}kg</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                                  <Activity className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                  style={{ width: `${(calculations.leanMass / parseFloat(assessment.weight)) * 100}%` }}></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                  <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Densidade</p>
                                  <p className="text-3xl font-black text-gray-900 dark:text-white">{calculations.bodyDensity}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                                  <Calculator className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-3/4"></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Observações */}
                      <div className="space-y-4">
                        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          Observações da Avaliação
                        </Label>
                        <Textarea
                          placeholder="Adicione observações sobre a avaliação, condições especiais, limitações encontradas..."
                          value={assessment.notes}
                          onChange={(e) => setAssessment(prev => ({ ...prev, notes: e.target.value }))}
                          className="min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                        />
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('measurements')}
                          className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl font-semibold shadow-lg transition-all duration-300"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Voltar às Medidas
                        </Button>

                        <div className="flex-1 flex gap-4">
                          <Button
                            onClick={analyzeWithAI}
                            disabled={isAnalyzing}
                            className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-8 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analisando...
                              </>
                            ) : (
                              <>
                                <Brain className="h-5 w-5 mr-2" />
                                Analisar com IA
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={saveAssessment}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-8 py-3 rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                          >
                            {isLoading ? (
                              <>
                                <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5 mr-2" />
                                Salvar Avaliação
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-24">
                      <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                          <AlertCircle className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
                      </div>

                      <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-4">
                        Dados insuficientes
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                        Complete as medidas obrigatórias para ver os resultados
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Análise IA Tab */}
          <TabsContent value="analysis">
            <AssessmentAIAnalysis
              mode="create"
              aiAnalysis={aiAnalysis}
              aiRecommendations={aiAnalysis?.recommendations}
              isLoading={isLoading}
              onAnalyze={analyzeWithAI}
              onSave={saveAssessment}
              onBack={() => setActiveTab('results')}
              assessmentData={calculations ? {
                weight: parseFloat(assessment.weight),
                height: parseFloat(assessment.height),
                age: parseInt(assessment.age),
                gender: assessment.gender as 'male' | 'female',
                bmi: calculations.bmi,
                fatPercentage: calculations.fatPercentage,
                fatMass: calculations.fatMass,
                leanMass: calculations.leanMass,
                protocol: assessment.protocol
              } : undefined}
              studentInfo={{
                name: selectedStudent?.full_name,
                goals: selectedStudent?.goals
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}