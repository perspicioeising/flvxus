'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, User, Mail, Phone, Calendar, Users, Target, Heart, Clock, Award, FileText, Ruler, Scale, ArrowRight, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";

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
          <div className="space-y-4 sm:space-y-6">
            {/* Mobile: Stack vertical | Desktop: Grid */}
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
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
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newStudent.birthDate}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                  autoComplete="bday"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                Gênero
              </Label>
              <Select
                value={newStudent.gender}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-base">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="height" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="numeric"
                  placeholder="170"
                  value={newStudent.height}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, height: e.target.value }))}
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="weight" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="numeric"
                  placeholder="70"
                  value={newStudent.weight}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, weight: e.target.value }))}
                  className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                Objetivos de Treino
              </Label>

              {/* Mobile: Grid 1x1 | Tablet: 2x2 | Desktop: 3x3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      className="flex items-center justify-center p-3 sm:p-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:bg-gradient-to-r peer-checked:from-green-50 peer-checked:to-emerald-50 dark:peer-checked:from-green-900/20 dark:peer-checked:to-emerald-900/20 peer-checked:border-green-500 dark:peer-checked:border-green-400 peer-checked:text-green-700 dark:peer-checked:text-green-300 peer-checked:shadow-lg min-h-[48px] text-center"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="experienceLevel" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                Nível de Experiência
              </Label>
              <Select
                value={newStudent.experienceLevel}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-base">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="medicalConditions" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                Condições Médicas
              </Label>
              <Textarea
                id="medicalConditions"
                placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
                value={newStudent.medicalConditions}
                onChange={(e) => setNewStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
                className="min-h-[100px] sm:min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none text-base"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="emergencyContact" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                Contato de Emergência
              </Label>
              <Input
                id="emergencyContact"
                placeholder="Nome e telefone do contato de emergência"
                value={newStudent.emergencyContact}
                onChange={(e) => setNewStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="preferredTime" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                Horário Preferido de Treino
              </Label>
              <Select
                value={newStudent.preferredTime}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, preferredTime: value }))}
              >
                <SelectTrigger className="h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-base">
                  <SelectValue placeholder="Selecione o horário preferido" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                  {TRAINING_TIMES.map((time) => (
                    <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                Notas Adicionais
              </Label>
              <Textarea
                id="notes"
                placeholder="Qualquer informação adicional relevante sobre o aluno..."
                value={newStudent.notes}
                onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px] sm:min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none text-base"
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
  <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">

    {/* Header Simplificado */}
    <div className="relative mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          
          {/* Botão Voltar + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </Button>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                  Novo Aluno
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                  {currentStepInfo.title}
                </p>
              </div>
            </div>
          </div>

          {/* Badge de Progresso - Mobile */}
          <div className="shrink-0 lg:hidden">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium px-3 py-1">
              {currentStep}/3
            </Badge>
          </div>
        </div>

        {/* Stepper Desktop Only */}
        <div className="hidden lg:block mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
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
    </div>

    {/* Mobile Progress Bar */}
    <div className="lg:hidden mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            currentStep === 1 ? 'bg-green-100 dark:bg-green-900/30' :
            currentStep === 2 ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-purple-100 dark:bg-purple-900/30'
          }`}>
            {React.createElement(getStepInfo(currentStep).icon, {
              className: `h-4 w-4 ${
                currentStep === 1 ? 'text-green-600 dark:text-green-400' :
                currentStep === 2 ? 'text-blue-600 dark:text-blue-400' :
                'text-purple-600 dark:text-purple-400'
              }`
            })}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {getStepInfo(currentStep).title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getStepInfo(currentStep).description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            currentStep === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
            currentStep === 2 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
    </div>

    {/* Form Content */}
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          
          {/* Content Header - Desktop Only */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStepInfo.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStepInfo.description}
            </p>
          </div>

          {/* Form Steps Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            {/* Botão Voltar */}
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="px-4 sm:px-6 h-11 sm:h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
                <span className="sm:hidden">←</span>
              </Button>
            )}
            
            {/* Botão Cancelar - Desktop Only */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="hidden lg:flex px-6 h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium transition-all duration-200"
            >
              Cancelar
            </Button>

            {/* Botão Próximo/Finalizar */}
            <Button
              type={currentStep === 3 ? "submit" : "button"}
              onClick={currentStep === 3 ? handleAddStudent : nextStep}
              disabled={isLoading}
              className={`flex-1 lg:flex-initial lg:px-8 h-11 sm:h-12 rounded-xl font-semibold border-0 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentStep === 3
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-green-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25'
              } disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none disabled:scale-100`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : currentStep === 3 ? (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Enviar Convite</span>
                  <span className="sm:hidden">Enviar</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Próximo</span>
                  <span className="sm:hidden">Avançar</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
  );
}