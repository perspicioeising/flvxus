// /hooks/usePhysicalAssessmentForm.ts

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PhysicalAssessmentFormData, BodyCompositionResult, Student, AIAnalysis } from '@/types/physical-assessment';

const initialFormData: PhysicalAssessmentFormData = {
  student_id: '',
  protocol: '',
  date: new Date().toISOString().split('T')[0],
  weight: '',
  height: '',
  age: '',
  gender: '',
  measurements: {},
  notes: ''
};

export function usePhysicalAssessmentForm(mode: 'create' | 'edit' = 'create', assessmentId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Estados
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calculations, setCalculations] = useState<BodyCompositionResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [activeStep, setActiveStep] = useState('basic');
  
  const [formData, setFormData] = useState<PhysicalAssessmentFormData>(initialFormData);

  // Calcular idade
  const calculateAge = useCallback((birthDate: string) => {
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
  }, []);

  // Buscar estudantes
  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      const studentsData: Student[] = data.students || [];
      setStudents(studentsData);

      // Se estiver criando e tiver um student pré-selecionado
      if (mode === 'create') {
        const preSelectedStudentId = searchParams.get('student');
        if (preSelectedStudentId) {
          const student = studentsData.find((s: Student) => s.id === preSelectedStudentId);
          if (student) {
            handleStudentSelect(student);
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, toast, mode]);

  // Buscar dados da avaliação (para modo edição)
  const fetchAssessmentData = useCallback(async () => {
    if (mode !== 'edit' || !assessmentId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments/${assessmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Mapear dados da API para o formulário
      setFormData({
        student_id: data.student_id,
        protocol: data.protocol,
        date: data.date,
        weight: data.weight.toString(),
        height: data.height.toString(),
        age: data.age.toString(),
        gender: data.gender,
        measurements: data.measurements || {},
        notes: data.notes || ''
      });

      // Buscar dados do aluno
      const studentResponse = await fetch(`/api/students/${data.student_id}`);
      const studentData = await studentResponse.json();
      
      if (studentResponse.ok) {
        setSelectedStudent({
          id: studentData.id,
          full_name: studentData.full_name,
          birthDate: studentData.birth_date,
          gender: studentData.gender,
          height: studentData.height,
          weight: studentData.weight,
          goals: studentData.goals
        });
      }

      // Se tiver análise IA, carregar também
      if (data.ai_analysis) {
        setAiAnalysis(data.ai_analysis);
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar avaliação",
        description: error.message,
      });
      router.push('/dashboard/physical-assessments');
    } finally {
      setIsLoading(false);
    }
  }, [mode, assessmentId, router, toast]);

  // Selecionar aluno
  const handleStudentSelect = useCallback((student: Student) => {
    const calculatedAge = calculateAge(student.birthDate);
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      student_id: student.id,
      age: calculatedAge.toString(),
      gender: student.gender,
      height: student.height?.toString() || '',
      weight: student.weight?.toString() || ''
    }));
  }, [calculateAge]);

  // Calcular composição corporal
  const calculateBodyComposition = useCallback((): BodyCompositionResult | null => {
    const { weight, height, age, gender, protocol, measurements } = formData;

    if (!weight || !height || !protocol || !age) return null;

    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightM * heightM);
    const ageNum = parseInt(age);

    let bodyDensity = 0;
    let fatPercentage = 0;

    // Aplicar fórmulas baseadas no protocolo selecionado
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
        if (gender === 'male') {
          const sum7 = (parseFloat(measurements.chest) || 0) + (parseFloat(measurements.midaxillary) || 0) +
            (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0) +
            (parseFloat(measurements.abdominal) || 0) + (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.thigh) || 0);
          bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * ageNum);
        } else {
          const sum7 = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0) +
            (parseFloat(measurements.midaxillary) || 0) + (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.abdominal) || 0) + (parseFloat(measurements.thigh) || 0) +
            (parseFloat(measurements.biceps) || 0);
          bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * ageNum);
        }
        break;

      case 'durnin_womersley':
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
        const sumBoileau = (parseFloat(measurements.triceps) || 0) + (parseFloat(measurements.subscapular) || 0);

        if (gender === 'male') {
          fatPercentage = (0.735 * sumBoileau) + 1.0;
        } else {
          fatPercentage = (0.610 * sumBoileau) + 5.1;
        }
        break;

      case 'guedes_1994':
        if (gender === 'male') {
          const sumGuedesM = (parseFloat(measurements.triceps) || 0) +
            (parseFloat(measurements.suprailiac) || 0) +
            (parseFloat(measurements.abdominal) || 0);
          fatPercentage = (0.31457 * sumGuedesM) - (0.00229 * sumGuedesM * ageNum) + 1.114;
        } else {
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
  }, [formData]);

  // Obter campos obrigatórios
  const getRequiredFields = useCallback((protocol: string, gender: string) => {
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
  }, []);

  // Verificar se tem medidas obrigatórias
  const hasRequiredMeasurements = useCallback(() => {
    if (!formData.protocol || !formData.gender) return false;
    const required = getRequiredFields(formData.protocol, formData.gender);
    return required.every(field => formData.measurements[field]);
  }, [formData.protocol, formData.gender, formData.measurements, getRequiredFields]);

  // Atualizar medida
  const updateMeasurement = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  }, []);

  // Atualizar campo do formulário
  const updateFormField = useCallback((field: keyof PhysicalAssessmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Analisar com IA
  const analyzeWithAI = useCallback(async () => {
    if (!calculations) {
      toast({
        variant: "destructive",
        title: "Dados insuficientes",
        description: "Complete os dados básicos para análise",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const requestData = {
        assessmentData: {
          age: parseInt(formData.age),
          gender: formData.gender as 'male' | 'female',
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          bmi: calculations.bmi,
          fatPercentage: calculations.fatPercentage,
          fatMass: calculations.fatMass,
          leanMass: calculations.leanMass,
          protocol: formData.protocol
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
      setActiveStep('analysis');

      toast({
        title: "Análise IA concluída! 🧠",
        description: "A inteligência artificial gerou recomendações personalizadas.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na análise IA",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculations, formData, selectedStudent, toast]);

  // Salvar avaliação
  const saveAssessment = useCallback(async () => {
    if (!calculations) {
      toast({
        variant: "destructive",
        title: "Dados insuficientes",
        description: "Complete os dados básicos para salvar",
      });
      return;
    }

    setIsSaving(true);

    try {
      const requestData = {
        student_id: formData.student_id,
        protocol: formData.protocol,
        date: formData.date,
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender,
        measurements: formData.measurements,
        notes: formData.notes,
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

      const url = mode === 'edit' && assessmentId 
        ? `/api/physical-assessments/${assessmentId}`
        : '/api/physical-assessments';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        title: mode === 'edit' 
          ? "Avaliação atualizada com sucesso! 🎉"
          : "Avaliação salva com sucesso! 🎉",
        description: `Avaliação física ${mode === 'edit' ? 'atualizada' : 'criada'}${aiAnalysis ? ' com análise IA' : ''} e está disponível para consulta.`,
      });

      router.push('/dashboard/physical-assessments');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Erro ao ${mode === 'edit' ? 'atualizar' : 'salvar'} avaliação`,
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [calculations, formData, aiAnalysis, mode, assessmentId, router, toast]);

  // Efeitos
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (mode === 'edit') {
      fetchAssessmentData();
    }
  }, [mode, fetchAssessmentData]);

  useEffect(() => {
    if (formData.weight && formData.height && formData.protocol && formData.age) {
      const calc = calculateBodyComposition();
      setCalculations(calc);
    }
  }, [formData, calculateBodyComposition]);

  return {
    // Estados
    students,
    selectedStudent,
    formData,
    calculations,
    aiAnalysis,
    activeStep,
    isLoading,
    isAnalyzing,
    isSaving,
    
    // Ações
    setActiveStep,
    handleStudentSelect,
    updateFormField,
    updateMeasurement,
    analyzeWithAI,
    saveAssessment,
    
    // Validações
    hasRequiredMeasurements,
    getRequiredFields,
    
    // Dados
    mode
  };
}