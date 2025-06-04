'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXPERIENCE_LEVELS = [
  "Iniciante",
  "Intermediário",
  "Avançado"
];

const TRAINING_TIMES = [
  "Madrugada",
  "Morning",
  "Tarde",
  "Noite",
  "Madrugada"
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newStudent.name}
                onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                placeholder="Telefone"
                value={newStudent.phone}
                onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={newStudent.birthDate}
                onChange={(e) => setNewStudent(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={newStudent.gender}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Altura em centímetros"
                value={newStudent.height}
                onChange={(e) => setNewStudent(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Peso em quilogramas"
                value={newStudent.weight}
                onChange={(e) => setNewStudent(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivos</Label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
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
                    />
                    <label htmlFor={goal}>{goal}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Nível de Experiência</Label>
              <Select
                value={newStudent.experienceLevel}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de experiência" />
                </SelectTrigger>
                <SelectContent>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Condições Médicas</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Liste quaisquer condições médicas, lesões ou limitações"
                value={newStudent.medicalConditions}
                onChange={(e) => setNewStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                placeholder="Nome e número de telefone"
                value={newStudent.emergencyContact}
                onChange={(e) => setNewStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Horário Preferido de Treino</Label>
              <Select
                value={newStudent.preferredTime}
                onValueChange={(value) => setNewStudent(prev => ({ ...prev, preferredTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário preferido" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_TIMES.map((time) => (
                    <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionais</Label>
              <Textarea
                id="notes"
                placeholder="Qualquer informação adicional"
                value={newStudent.notes}
                onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Adicionar Novo Aluno</h2>
            <p className="text-muted-foreground">
              Preencha as informações do novo aluno
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Progress Steps Indicator */}
          <div className="px-6 pt-2">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border -translate-y-1/2 z-0" />
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep === step ? 'font-medium text-primary' : 'text-muted-foreground'
                  }`}>
                    Passo {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-4">
            {renderStepContent()}
          </div>

          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button variant="outline\" onClick={prevStep}>
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              {currentStep < 3 ? (
                <Button onClick={nextStep}>Próximo</Button>
              ) : (
                <Button onClick={handleAddStudent} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : "Enviar Convite"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}