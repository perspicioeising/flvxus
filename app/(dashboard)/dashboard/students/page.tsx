"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Search, Filter, Eye, Activity, Mail, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  birth_date: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goals: string[] | null;
  medical_conditions: string | null;
  emergency_contact: string | null;
  preferred_training_time: string | null;
  experience_level: string | null;
  notes: string | null;
};

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

export default function StudentsPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    }
  };

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
        title: "Aluno convidado com sucesso",
        description: "Um email de convite foi enviado para o endereço do aluno.",
      });

      fetchStudents();
      handleDialogClose();

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

  const handleDialogClose = () => {
    setIsAddStudentOpen(false);
    setNewStudent({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      height: "",
      weight: "",
      goals: [],
      medicalConditions: "",
      emergencyContact: "",
      preferredTime: "",
      experienceLevel: "",
      notes: ""
    });
    setCurrentStep(1);
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

  // Filter students based on search query and status filter
  const filteredStudents = students.filter((student) => {
    const matchesQuery = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={newStudent.name}
                onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={newStudent.email}
                onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
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
                placeholder="Height in centimeters"
                value={newStudent.height}
                onChange={(e) => setNewStudent(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Weight in kilograms"
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
              <Label htmlFor="experienceLevel">Experience Level</Label>
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Alunos</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe os perfis dos seus alunos.
          </p>
        </div>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>
                {currentStep === 1 && "Insira as informações básicas do aluno."}
                {currentStep === 2 && "Insira detalhes físicos e objetivos."}
                {currentStep === 3 && "Insira informações médicas e preferências."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {renderStepContent()}
            </div>
            <DialogFooter className="flex justify-between">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                {currentStep < 3 ? (
                  <Button onClick={nextStep}>Próximo</Button>
                ) : (
                  <Button onClick={handleAddStudent} disabled={isLoading}>
                    {isLoading ? "Convidando..." : "Enviar Convite"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
         
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow  >
                  <TableHead>Aluno</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Experience</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum aluno encontrado. Tente ajustar os filtros ou adicionar novos alunos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage alt={student.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {student.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {student.experience_level || '-'}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/students/${student.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Perfil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/students/${student.id}/workouts`}>
                                <Activity className="mr-2 h-4 w-4" />
                                Treinos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/students/${student.id}/assessments`}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Avaliações
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar Mensagem

                            </DropdownMenuItem>


                            <DropdownMenuItem className="text-destructive">
                              Remover Aluno
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}