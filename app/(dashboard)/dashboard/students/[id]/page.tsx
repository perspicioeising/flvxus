'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXPERIENCE_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const TRAINING_TIMES = ["Madrugada", "Morning", "Tarde", "Noite", "Madrugada"];
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

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResendingInvite, setIsResendingInvite] = useState(false);
  
  const [student, setStudent] = useState({
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
    notes: "",
    status: ""
  });

  const fetchStudentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setStudent({
        name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthDate: data.birth_date || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        goals: Array.isArray(data.goals) ? data.goals : [],
        medicalConditions: data.medical_conditions || "",
        emergencyContact: data.emergency_contact || "",
        preferredTime: data.preferred_training_time || "",
        experienceLevel: data.experience_level || "",
        notes: data.notes || "",
        status: data.status || "active"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do aluno",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Alterações salvas com sucesso",
        description: "O perfil do aluno foi atualizado.",
      });
      router.push('/dashboard/students');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar alterações",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendInvite = async () => {
    try {
      setIsResendingInvite(true);
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Convite reenviado com sucesso",
        description: "Um novo email de convite foi enviado para o aluno.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar convite",
        description: error.message,
      });
    } finally {
      setIsResendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando detalhes do aluno...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos as informações.</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-muted-foreground">
              Perfil do Aluno
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResendInvite}
            disabled={isResendingInvite}
          >
            <Send className="h-4 w-4 mr-2" />
            {isResendingInvite ? "Reenviando..." : "Reenviar Convite"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Atualize os dados básicos e informações de contato do aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={student.name}
                  onChange={(e) => setStudent(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={student.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  value={student.phone}
                  onChange={(e) => setStudent(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={student.birthDate}
                  onChange={(e) => setStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={student.gender}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, gender: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={student.status}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Físicas</CardTitle>
            <CardDescription>
              Atualize as medidas físicas e objetivos de fitness do aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={student.height}
                  onChange={(e) => setStudent(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={student.weight}
                  onChange={(e) => setStudent(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objetivos de Fitness</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={goal}
                      checked={student.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStudent(prev => ({
                            ...prev,
                            goals: [...prev.goals, goal]
                          }));
                        } else {
                          setStudent(prev => ({
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                <Select
                  value={student.experienceLevel}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, experienceLevel: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Horário Preferido</Label>
                <Select
                  value={student.preferredTime}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, preferredTime: value }))}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Médicas e de Emergência</CardTitle>
            <CardDescription>
              Atualize as condições médicas e informações de contato de emergência do aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Condições Médicas</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Liste quaisquer condições médicas, lesões ou limitações"
                value={student.medicalConditions}
                onChange={(e) => setStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                placeholder="Nome e número de telefone"
                value={student.emergencyContact}
                onChange={(e) => setStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any additional notes or observations about the student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes here..."
              value={student.notes}
              onChange={(e) => setStudent(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
