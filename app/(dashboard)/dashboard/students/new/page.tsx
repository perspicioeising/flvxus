'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, User, Mail, Phone, Calendar, Users, Target, Heart, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXPERIENCE_LEVELS = [
  "Iniciante",
  "Intermediário", 
  "Avançado"
];

const TRAINING_TIMES = [
  "Madrugada",
  "Manhã",
  "Tarde",
  "Noite"
];

const GOALS = [
  "Perda de Peso",
  "Ganho de Massa",
  "Força",
  "Resistência",
  "Flexibilidade",
  "Condicionamento Geral",
  "Performance Esportiva",
  "Reabilitação"
];

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    height: "",
    weight: "",
    goals: [] as string[],
    medicalConditions: "",
    emergencyContact: "",
    preferredTime: "",
    experienceLevel: "",
    notes: ""
  });

  const handleAddStudent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Aluno adicionado",
        description: "O convite foi enviado para o email do aluno.",
      });

      router.push('/dashboard/students');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar aluno",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  interface StepInfo {
    title: string;
    description: string;
    icon: React.ElementType;
  }

  const getStepInfo = (step: number): StepInfo => {
    switch (step) {
      case 1:
        return {
          title: "Informações Pessoais",
          description: "Dados básicos e contato",
          icon: User
        };
      case 2:
        return {
          title: "Perfil Físico",
          description: "Objetivos e experiência",
          icon: Target
        };
      case 3:
        return {
          title: "Informações Médicas",
          description: "Saúde e observações",
          icon: Heart
        };
      default:
        return { title: "", description: "", icon: User };
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newStudent.birthDate}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                Gênero
              </Label>
              <Select
                value={newStudent.gender}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="height" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={newStudent.height}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, height: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="weight" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={newStudent.weight}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, weight: e.target.value }))}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                Objetivos de Treino
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOALS.map((goal) => (
                  <div key={goal} className="relative">
                    <input
                      type="checkbox"
                      id={goal}
                      checked={newStudent.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewStudent(prev => ({
                            ...prev,
                            goals: [...prev.goals, goal]
                          }));
                        } else {
                          setNewStudent(prev => ({
                            ...prev,
                            goals: prev.goals.filter(g => g !== goal)
                          }));
                        }
                      }}
                      className="peer sr-only"
                    />
                    <label 
                      htmlFor={goal}
                      className="flex items-center justify-center p-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:border-green-500 dark:peer-checked:border-green-400 peer-checked:text-green-700 dark:peer-checked:text-green-300"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="experienceLevel" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Nível de Experiência
              </Label>
              <Select
                value={newStudent.experienceLevel}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectValue placeholder="Selecione o nível de experiência" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="medicalConditions" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                Condições Médicas
              </Label>
              <Textarea
                id="medicalConditions"
                placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
                value={newStudent.medicalConditions}
                onChange={(e) => setNewStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
                className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="emergencyContact" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                Contato de Emergência
              </Label>
              <Input
                id="emergencyContact"
                placeholder="Nome e telefone do contato de emergência"
                value={newStudent.emergencyContact}
                onChange={(e) => setNewStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="preferredTime" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                Horário Preferido de Treino
              </Label>
              <Select
                value={newStudent.preferredTime}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, preferredTime: value }))}
              >
                <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectValue placeholder="Selecione o horário preferido" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                  {TRAINING_TIMES.map((time) => (
                    <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Notas Adicionais
              </Label>
              <Textarea
                id="notes"
                placeholder="Qualquer informação adicional relevante sobre o aluno..."
                value={newStudent.notes}
                onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const currentStepInfo = getStepInfo(currentStep);
  const StepIcon = currentStepInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <StepIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                    Adicionar Novo Aluno
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    {currentStepInfo.title} • {currentStepInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="flex justify-between items-center">
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  ></div>
                </div>
                
                {[1, 2, 3].map((step) => {
                  const stepInfo = getStepInfo(step);
                  const StepIconComponent = stepInfo.icon;
                  const isActive = currentStep >= step;
                  const isCurrent = currentStep === step;
                  
                  return (
                    <div key={step} className="relative flex flex-col items-center z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-white dark:border-gray-900 shadow-lg' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}>
                        <StepIconComponent className={`h-5 w-5 ${
                          isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-sm font-semibold ${
                          isCurrent ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {stepInfo.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Passo {step}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentStepInfo.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStepInfo.description}
                </p>
              </div>

              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      className="px-6 py-3 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancelar
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button 
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAddStudent} 
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando Convite...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Convite
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}