'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Brain, User, Calendar, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtocolSelector from "@/components/ProtocolSelector";
import DynamicMeasurements from "@/components/DynamicMeasurements";

interface Student {
  id: string;
  full_name: string;
  birth_date?: string;
  gender?: string;
  height?: number;
  weight?: number;
}

export default function EnhancedAssessmentForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [assessment, setAssessment] = useState({
    protocol: "",
    student_id: "",
    date: new Date().toISOString().split('T')[0],
    weight: "",
    height: "",
    age: "",
    gender: "",
    goals: [] as string[],
    notes: "",
    measurements: {} as Record<string, string>
  });

  const steps = [
    { number: 1, title: "Informações Básicas", description: "Dados do aluno e protocolo" },
    { number: 2, title: "Medições", description: "Antropometria e composição corporal" },
    { number: 3, title: "Objetivos & Observações", description: "Metas e anotações finais" },
    { number: 4, title: "Revisão", description: "Conferir dados antes de salvar" }
  ];

  const availableGoals = [
    "Redução de gordura corporal",
    "Ganho de massa muscular",
    "Melhoria do condicionamento",
    "Manutenção do peso",
    "Reabilitação",
    "Performance esportiva",
    "Saúde geral",
    "Preparação para competição"
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (assessment.student_id) {
      const student = students.find(s => s.id === assessment.student_id);
      setSelectedStudent(student || null);
      
      if (student) {
        // Auto-preencher dados do estudante se disponível
        const updates: any = {};
        
        if (student.birth_date) {
          const age = calculateAge(student.birth_date);
          updates.age = age.toString();
        }
        
        if (student.gender) {
          updates.gender = student.gender;
        }
        
        if (student.height) {
          updates.height = student.height.toString();
        }
        
        if (student.weight) {
          updates.weight = student.weight.toString();
        }
        
        if (Object.keys(updates).length > 0) {
          setAssessment(prev => ({ ...prev, ...updates }));
        }
      }
    }
  }, [assessment.student_id, students]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleMeasurementsChange = (measurements: Record<string, string>) => {
    setAssessment(prev => ({ ...prev, measurements }));
  };

  const handleCalculatedResults = (results: any) => {
    setCalculatedResults(results);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(assessment.protocol && assessment.student_id && assessment.date && 
                 assessment.weight && assessment.height && assessment.age && assessment.gender);
      case 2:
        return !!calculatedResults;
      case 3:
        return true; // Objetivos e observações são opcionais
      case 4:
        return true; // Revisão sempre válida se chegou até aqui
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Complete todos os campos obrigatórios antes de continuar.",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!calculatedResults) {
        throw new Error("Por favor, complete todas as medições obrigatórias");
      }

      const assessmentData = {
        ...assessment,
        ...calculatedResults,
        // Converter valores string para números
        weight: parseFloat(assessment.weight),
        height: parseFloat(assessment.height),
        age: parseInt(assessment.age),
        // Converter medições
        ...Object.fromEntries(
          Object.entries(assessment.measurements).map(([key, value]) => [
            key, value ? parseFloat(value) : null
          ])
        )
      };

      const response = await fetch('/api/physical-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "✅ Avaliação criada com sucesso!",
        description: "Os dados foram salvos e já estão disponíveis no histórico do aluno.",
      });

      router.push('/dashboard/physical-assessments');

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Seleção de Protocolo */}
            <ProtocolSelector
              selectedProtocol={assessment.protocol}
              onProtocolChange={(protocol) => setAssessment(prev => ({ ...prev, protocol }))}
              studentAge={parseInt(assessment.age) || undefined}
              studentGender={assessment.gender || undefined}
            />

            {/* Informações do Aluno */}
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Informações do Aluno</CardTitle>
                    <CardDescription>Dados básicos para a avaliação física</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="student">Aluno *</Label>
                    <Select
                      value={assessment.student_id}
                      onValueChange={(value) => setAssessment(prev => ({ ...prev, student_id: value }))}
                    >
                      <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg">
                        <SelectValue placeholder="Selecione o aluno para avaliação" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {student.full_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{student.full_name}</div>
                                {student.birth_date && (
                                  <div className="text-sm text-gray-500">
                                    {calculateAge(student.birth_date)} anos
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Data da Avaliação *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={assessment.date}
                      onChange={(e) => setAssessment(prev => ({ ...prev, date: e.target.value }))}
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select
                      value={assessment.gender}
                      onValueChange={(value) => setAssessment(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="7"
                      max="100"
                      value={assessment.age}
                      onChange={(e) => setAssessment(prev => ({ ...prev, age: e.target.value }))}
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg"
                      placeholder="Anos completos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Peso (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      value={assessment.weight}
                      onChange={(e) => setAssessment(prev => ({ ...prev, weight: e.target.value }))}
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg"
                      placeholder="Ex: 70.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Altura (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="100"
                      max="250"
                      value={assessment.height}
                      onChange={(e) => setAssessment(prev => ({ ...prev, height: e.target.value }))}
                      className="h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg"
                      placeholder="Ex: 175.0"
                    />
                  </div>
                </div>

                {selectedStudent && (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <User className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Aluno selecionado:</strong> {selectedStudent.full_name}
                      {selectedStudent.birth_date && (
                        <span> • {calculateAge(selectedStudent.birth_date)} anos</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <DynamicMeasurements
            protocol={assessment.protocol}
            gender={assessment.gender}
            age={parseInt(assessment.age)}
            measurements={assessment.measurements}
            onMeasurementsChange={handleMeasurementsChange}
            onCalculatedResults={handleCalculatedResults}
          />
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Objetivos */}
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Objetivos do Aluno</CardTitle>
                    <CardDescription>Selecione os principais objetivos desta avaliação</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableGoals.map((goal) => (
                    <div
                      key={goal}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        assessment.goals.includes(goal)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/10'
                      }`}
                      onClick={() => {
                        const newGoals = assessment.goals.includes(goal)
                          ? assessment.goals.filter(g => g !== goal)
                          : [...assessment.goals, goal];
                        setAssessment(prev => ({ ...prev, goals: newGoals }));
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          assessment.goals.includes(goal)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {assessment.goals.includes(goal) && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          assessment.goals.includes(goal)
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {goal}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Observações Adicionais</CardTitle>
                <CardDescription>Anote observações importantes sobre a avaliação</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={assessment.notes}
                  onChange={(e) => setAssessment(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[120px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg resize-none"
                  placeholder="Ex: Aluno relatou dor no joelho direito durante agachamento. Recomendo avaliação postural complementar. Histórico de lesão no ombro esquerdo..."
                />
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Resumo da Avaliação */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Revisão da Avaliação</CardTitle>
                    <CardDescription>Confira todos os dados antes de finalizar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Dados Básicos</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Aluno:</strong> {selectedStudent?.full_name}</div>
                      <div><strong>Data:</strong> {new Date(assessment.date).toLocaleDateString('pt-BR')}</div>
                      <div><strong>Protocolo:</strong> {assessment.protocol}</div>
                      <div><strong>Idade:</strong> {assessment.age} anos</div>
                      <div><strong>Peso:</strong> {assessment.weight} kg</div>
                      <div><strong>Altura:</strong> {assessment.height} cm</div>
                    </div>
                  </div>

                  {calculatedResults && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resultados</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>% Gordura:</strong> {calculatedResults.fat_percentage}%</div>
                        <div><strong>Massa Gorda:</strong> {calculatedResults.fat_mass} kg</div>
                        <div><strong>Massa Magra:</strong> {calculatedResults.lean_mass} kg</div>
                        <div><strong>Densidade:</strong> {calculatedResults.body_density} g/ml</div>
                        {calculatedResults.bmi && (
                          <div><strong>IMC:</strong> {calculatedResults.bmi}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Objetivos */}
                {assessment.goals.length > 0 && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Objetivos</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessment.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {assessment.notes && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Observações</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {assessment.notes}
                    </p>
                  </div>
                )}

                {/* Validação Final */}
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Avaliação completa!</strong> Todos os dados necessários foram preenchidos. 
                    Clique em "Finalizar Avaliação" para salvar os resultados.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-400/10 dark:to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-12 px-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                    Nova Avaliação Física
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Sistema inteligente de avaliação corporal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.number 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-12 px-8"
          >
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl h-12 px-8 font-semibold"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !calculatedResults}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl h-12 px-8 font-semibold"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Avaliação
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}