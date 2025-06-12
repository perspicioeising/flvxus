// /opt/flvxus/app/(dashboard)/dashboard/physical-assessments/new/page.tsx - CORRIGIDO E RESPONSIVO
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
  Calendar,
  Crown,
  Star,
  TrendingUp,
  Search,
  Book
} from 'lucide-react';

// Protocolos corrigidos conforme especificação
const BODY_PROTOCOLS = [
  {
    value: "jackson_pollock_3",
    label: "Jackson & Pollock (3 dobras)",
    gender: "both",
    description: "Protocolo padrão - H: peito, abdômen, coxa / M: tríceps, supra-ilíaca, coxa",
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "jackson_pollock_7",
    label: "Jackson & Pollock (7 dobras)",
    gender: "both",
    description: "Protocolo mais preciso com 7 pontos de medição",
    color: "from-purple-500 to-pink-500"
  },
  {
    value: "durnin_womersley",
    label: "Durnin & Womersley",
    gender: "both",
    description: "4 dobras: tríceps, bíceps, subescapular, supra-ilíaca",
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "slaughter",
    label: "Slaughter et al.",
    gender: "both",
    description: "Para crianças/adolescentes: tríceps e subescapular",
    color: "from-orange-500 to-red-500"
  },
  {
    value: "boileau",
    label: "Boileau et al.",
    gender: "youth",
    description: "Para jovens: tríceps e subescapular",
    color: "from-indigo-500 to-purple-500"
  },
  {
    value: "guedes_1994",
    label: "Guedes 1994",
    gender: "both",
    description: "H: tríceps, supra-ilíaca, abdominal / M: subescapular, supra-ilíaca, coxa",
    color: "from-yellow-500 to-orange-500"
  }
];

// Campos de medição corrigidos
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
    { key: 'triceps', label: 'Tríceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley'], color: 'from-yellow-500 to-orange-500' },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley', 'slaughter', 'boileau', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' },
    { key: 'thigh', label: 'Coxa', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'chest', label: 'Peitoral', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' }
  ]
};

interface Student {
  id: string;
  full_name: string;
  birthDate: string;
  gender: 'male' | 'female';
  height?: number;
  weight?: number;
  goals?: string[];
}

interface Assessment {
  student_id: string;
  protocol: string;
  date: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
  measurements: Record<string, string>;
  notes: string;
}

interface BodyCompositionResult {
  bmi: number;
  bodyDensity: number;
  fatPercentage: number;
  fatMass: number;
  leanMass: number;
}

export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Estados do componente
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [calculations, setCalculations] = useState<BodyCompositionResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [assessment, setAssessment] = useState<Assessment>({
    student_id: '',
    protocol: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    age: '',
    gender: '',
    measurements: {},
    notes: ''
  });

  // Filtrar estudantes baseado na busca
  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes((studentSearch || '').toLowerCase())
  );

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

      const studentsData: Student[] = data.students || [];
      setStudents(studentsData);

      const preSelectedStudentId = searchParams.get('student');
      if (preSelectedStudentId) {
        const student = studentsData.find((s: Student) => s.id === preSelectedStudentId);
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
  };

  const calculateBodyComposition = useCallback((): BodyCompositionResult | null => {
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
          // Para homens: peito, abdômen, coxa
          const sum3 = (parseFloat(measurements.chest) || 0) +
            (parseFloat(measurements.abdominal) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.10938 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * ageNum);
        } else {
          // Para mulheres: tríceps, supra-ilíaca, coxa
          const sum3 = (parseFloat(measurements.triceps) || 0) +
            (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.0994921 - (0.0009929 * sum3) + (0.0000023 * sum3 * sum3) - (0.0001392 * ageNum);
        }
        break;

      case 'jackson_pollock_7':
        if (gender === 'male') {
          // Para homens: peito, axilar média, tríceps, subescapular, abdômen, supra-ilíaca, coxa
          const sum7 = (parseFloat(measurements.chest) || 0) + (parseFloat(measurements.midaxillary) || 0) +
            (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0) +
            (parseFloat(measurements.abdominal) || 0) + (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * ageNum);
        } else {
          // Para mulheres: tríceps, subescapular, axilar média, supra-ilíaca, abdômen, coxa, bíceps
          const sum7 = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0) +
            (parseFloat(measurements.midaxillary) || 0) + (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.abdominal) || 0) + (parseFloat(measurements.thigh) || 0) +
            (parseFloat(measurements.biceps) || 0);
          bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * ageNum);
        }
        break;

      case 'durnin_womersley':
        // Tríceps, bíceps, subescapular, supra-ilíaca
        const sumDW = (parseFloat(measurements.biceps) || 0) +
          (parseFloat(measurements.triceps) || 0) +
          (parseFloat(measurements.subscapular) || 0) +
          (parseFloat(measurements.suprailiac) || 0);

        let logSum = Math.log10(sumDW);

        if (gender === 'male') {
          if (ageNum <= 16) {
            bodyDensity = 1.1533 - (0.0643 * logSum);
          } else if (ageNum <= 19) {
            bodyDensity = 1.1620 - (0.0630 * logSum);
          } else if (ageNum <= 29) {
            bodyDensity = 1.1631 - (0.0632 * logSum);
          } else if (ageNum <= 39) {
            bodyDensity = 1.1422 - (0.0544 * logSum);
          } else if (ageNum <= 49) {
            bodyDensity = 1.1620 - (0.0700 * logSum);
          } else {
            bodyDensity = 1.1715 - (0.0779 * logSum);
          }
        } else {
          if (ageNum <= 16) {
            bodyDensity = 1.1369 - (0.0598 * logSum);
          } else if (ageNum <= 19) {
            bodyDensity = 1.1549 - (0.0678 * logSum);
          } else if (ageNum <= 29) {
            bodyDensity = 1.1599 - (0.0717 * logSum);
          } else if (ageNum <= 39) {
            bodyDensity = 1.1423 - (0.0632 * logSum);
          } else if (ageNum <= 49) {
            bodyDensity = 1.1333 - (0.0612 * logSum);
          } else {
            bodyDensity = 1.1339 - (0.0645 * logSum);
          }
        }
        break;

      case 'slaughter':
        // Tríceps e subescapular
        const sumSlaughter = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0);

        if (gender === 'male') {
          if (sumSlaughter <= 35) {
            fatPercentage = (1.21 * sumSlaughter) - (0.008 * sumSlaughter * sumSlaughter) - 1.7;
          } else {
            fatPercentage = (0.783 * sumSlaughter) + 1.6;
          }
        } else {
          if (sumSlaughter <= 35) {
            fatPercentage = (1.33 * sumSlaughter) - (0.013 * sumSlaughter * sumSlaughter) - 2.5;
          } else {
            fatPercentage = (0.546 * sumSlaughter) + 9.7;
          }
        }
        break;

      case 'boileau':
        // Tríceps e subescapular
        const sumBoileau = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0);

        if (gender === 'male') {
          fatPercentage = (0.735 * sumBoileau) + 1.0;
        } else {
          fatPercentage = (0.610 * sumBoileau) + 5.1;
        }
        break;

      case 'guedes_1994':
        if (gender === 'male') {
          // Para homens: tríceps, supra-ilíaca, abdominal
          const sumGuedesM = (parseFloat(measurements.triceps) || 0) +
            (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.abdominal) || 0);
          fatPercentage = (0.31457 * sumGuedesM) - (0.00229 * sumGuedesM * ageNum) + 1.114;
        } else {
          // Para mulheres: subescapular, supra-ilíaca, coxa
          const sumGuedesF = (parseFloat(measurements.subscapular) || 0) +
            (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.thigh) || 0);
          fatPercentage = (0.35041 * sumGuedesF) - (0.00270 * sumGuedesF * ageNum) + 1.366;
        }
        break;

      default:
        if (gender === 'male') {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 16.2;
        } else {
          fatPercentage = (1.2 * bmi) + (0.23 * ageNum) - 5.4;
        }
    }

    // Converter densidade corporal em % de gordura (fórmula de Siri)
    if (bodyDensity > 0 && !['slaughter', 'boileau', 'guedes_1994'].includes(protocol)) {
      fatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
    }

    // Garantir valores dentro de limites razoáveis
    fatPercentage = Math.max(2, Math.min(50, fatPercentage));

    const fatMass = (parseFloat(weight) * fatPercentage) / 100;
    const leanMass = parseFloat(weight) - fatMass;

    return {
      bmi: parseFloat(bmi.toFixed(2)),
      bodyDensity: parseFloat(bodyDensity.toFixed(4)),
      fatPercentage: parseFloat(fatPercentage.toFixed(2)),
      fatMass: parseFloat(fatMass.toFixed(2)),
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

  const getRequiredFields = (protocol: string, gender: string) => {
    // Ajustar campos obrigatórios baseado no protocolo e gênero
    switch (protocol) {
      case 'jackson_pollock_3':
        if (gender === 'male') {
          return ['chest', 'abdominal', 'thigh'];
        } else {
          return ['triceps', 'suprailiac', 'thigh'];
        }
      case 'jackson_pollock_7':
        if (gender === 'male') {
          return ['chest', 'midaxillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'];
        } else {
          return ['triceps', 'subscapular', 'midaxillary', 'suprailiac', 'abdominal', 'thigh', 'biceps'];
        }
      case 'durnin_womersley':
        return ['triceps', 'biceps', 'subscapular', 'suprailiac'];
      case 'slaughter':
      case 'boileau':
        return ['triceps', 'subscapular'];
      case 'guedes_1994':
        if (gender === 'male') {
          return ['triceps', 'suprailiac', 'abdominal'];
        } else {
          return ['subscapular', 'suprailiac', 'thigh'];
        }
      default:
        return [];
    }
  };

  const hasRequiredMeasurements = () => {
    if (!assessment.protocol || !assessment.gender) return false;
    const required = getRequiredFields(assessment.protocol, assessment.gender);
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-6xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="p-2 sm:p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </Button>

                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <Book className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent truncate">
                      Nova Avaliação
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-lg mt-1 truncate">
                      Sistema inteligente de análise corporal com IA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 flex-wrap gap-y-2 sm:gap-y-4">
            {[
              { id: 'basic', label: 'Básico', fullLabel: 'Dados Básicos', icon: User, color: 'from-blue-500 to-cyan-500' },
              { id: 'protocol', label: 'Protocol', fullLabel: 'Protocolo', icon: Calculator, color: 'from-purple-500 to-pink-500' },
              { id: 'measurements', label: 'Medidas', fullLabel: 'Medidas', icon: Ruler, color: 'from-green-500 to-emerald-500' },
              { id: 'results', label: 'Result', fullLabel: 'Resultados', icon: BarChart3, color: 'from-orange-500 to-red-500' },
              { id: 'analysis', label: 'IA', fullLabel: 'Análise IA', icon: Brain, color: 'from-indigo-500 to-purple-500' }
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = activeTab === step.id;
              const completedSteps = ['basic', 'protocol', 'measurements', 'results'];
              const currentIndex = completedSteps.indexOf(activeTab);
              const stepIndex = completedSteps.indexOf(step.id);
              const isCompleted = stepIndex < currentIndex && stepIndex !== -1;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg ${isActive
                    ? `bg-gradient-to-r ${step.color} text-white transform scale-105 sm:scale-110`
                    : isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7" />
                    ) : (
                      <StepIcon className="h-5 w-5 sm:h-7 sm:w-7" />
                    )}
                    {isActive && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    } hidden sm:inline`}>
                    {step.fullLabel}
                  </span>
                  <span className={`ml-2 text-xs font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    } sm:hidden`}>
                    {step.label}
                  </span>
                  {index < 4 && (
                    <div className={`mx-2 sm:mx-6 h-0.5 sm:h-1 w-4 sm:w-12 rounded-full transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50/50 via-cyan-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-blue-900/10 rounded-t-2xl sm:rounded-t-3xl">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Selecionar Aluno</CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                        Escolha o aluno para a avaliação física
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Campo de seleção de aluno */}
                    <div className="space-y-3">
                      <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        Selecionar Aluno
                      </Label>
                      <Select
                        value={assessment.student_id}
                        onValueChange={(value) => {
                          const student = students.find(s => s.id === value);
                          if (student) {
                            handleStudentSelect(student);
                          }
                        }}
                      >
                        <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                          <SelectValue placeholder="Selecione um aluno para avaliação...">
                            {selectedStudent && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                                  {selectedStudent.full_name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="truncate">{selectedStudent.full_name}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 sm:max-h-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                          <div className="p-2">
                            <Input
                              placeholder="Digite para buscar..."
                              value={studentSearch}
                              onChange={(e) => setStudentSearch(e.target.value)}
                              className="h-8 sm:h-10 text-sm border-0 bg-gray-50 dark:bg-gray-800"
                            />
                          </div>
                          {filteredStudents.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              {studentSearch ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                            </div>
                          ) : (
                            filteredStudents.map((student) => (
                              <SelectItem
                                key={student.id}
                                value={student.id}
                                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                                    {student.full_name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{student.full_name}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                      {calculateAge(student.birthDate)} anos • {student.gender === 'male' ? 'M' : 'F'}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dados do aluno selecionado */}
                    {selectedStudent && (
                      <div className="space-y-6">
                        {/* Card do aluno */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
                          <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-lg shrink-0">
                                {selectedStudent.full_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                                  {selectedStudent.full_name}
                                </h3>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                    <span className="font-medium truncate">{assessment.age} anos</span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                    <span className="font-medium truncate">{selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                                  </div>
                                  {selectedStudent.height && (
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                      <span className="font-medium">{selectedStudent.height}cm</span>
                                    </div>
                                  )}
                                  {selectedStudent.weight && (
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                      <span className="font-medium">{selectedStudent.weight}kg</span>
                                    </div>
                                  )}
                                </div>
                                {selectedStudent.goals && selectedStudent.goals.length > 0 && (
                                  <div className="mt-3 sm:mt-4">
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                      {selectedStudent.goals.slice(0, 3).map((goal, index) => (
                                        <Badge key={index} className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 rounded-full text-xs font-semibold dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                                          <Target className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                          <span className="truncate max-w-20 sm:max-w-none">{goal}</span>
                                        </Badge>
                                      ))}
                                      {selectedStudent.goals.length > 3 && (
                                        <Badge className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-0 rounded-full text-xs font-semibold">
                                          +{selectedStudent.goals.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedStudent(null);
                                  setAssessment(prev => ({ ...prev, student_id: '', age: '', gender: '', height: '', weight: '' }));
                                }}
                                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl shadow-lg shrink-0 text-xs sm:text-sm px-2 sm:px-4"
                              >
                                Alterar
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Dados da avaliação */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                              <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              Peso Atual (kg)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={assessment.weight}
                              onChange={(e) => setAssessment(prev => ({ ...prev, weight: e.target.value }))}
                              className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                              placeholder="70.5"
                            />
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                              <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                              Altura (cm)
                            </Label>
                            <Input
                              type="number"
                              value={assessment.height}
                              onChange={(e) => setAssessment(prev => ({ ...prev, height: e.target.value }))}
                              className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                              placeholder="175"
                            />
                          </div>
                          <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                            <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              Data da Avaliação
                            </Label>
                            <Input
                              type="date"
                              value={assessment.date}
                              onChange={(e) => setAssessment(prev => ({ ...prev, date: e.target.value }))}
                              className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão de navegação */}
                    <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Button
                        onClick={() => setActiveTab('protocol')}
                        disabled={!assessment.student_id || !assessment.weight || !assessment.height}
                        className="w-full sm:w-auto px-6 sm:px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold"
                      >
                        Próximo
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                        <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${assessment.protocol === protocol.value
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
                              <div className={`p-3 rounded-xl shadow-lg ${assessment.protocol === protocol.value
                                ? 'bg-white/20'
                                : 'bg-gradient-to-r ' + protocol.color
                                }`}>
                                <Calculator className={`h-6 w-6 ${assessment.protocol === protocol.value ? 'text-white' : 'text-white'
                                  }`} />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg mb-2 ${assessment.protocol === protocol.value
                                  ? 'text-white'
                                  : 'text-gray-900 dark:text-white'
                                  }`}>
                                  {protocol.label}
                                </h4>
                                <p className={`text-sm leading-relaxed ${assessment.protocol === protocol.value
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
                            {getRequiredFields(assessment.protocol, assessment.gender).map((field) => {
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

                  <div className="flex justify-between gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
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
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold"
                    >
                      Próximo
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
                    <div className="relative mb-12 sm:mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
                      <TabsList className="relative grid w-full grid-cols-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
                        <TabsTrigger
                          value="skinfolds"
                          className="flex items-center gap-2 rounded-xl data-[state=active]:bg-yellow-600 data-[state=active]:text-white transition-all duration-300 font-semibold"
                        >
                          <span className="text-xl">🟡</span>
                          Dobras
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
                          const isRequired = assessment.protocol && assessment.gender && getRequiredFields(assessment.protocol, assessment.gender).includes(field.key);
                          return (
                            <div key={field.key} className="group relative">
                              <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                              <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${isRequired
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
                                  <Label className={`text-base font-bold flex items-center gap-2 ${isRequired ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'
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
                                    className={`h-12 text-lg transition-all duration-300 ${isRequired
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

                  <div className="flex justify-between gap-4 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
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
                      className="px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
                    >
                      Resultados
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
                                Analisar
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
                                Salvar
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