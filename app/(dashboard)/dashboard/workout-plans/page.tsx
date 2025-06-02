'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Search, Filter, Calendar, ArrowRight, Copy, Trash2, Edit, CalendarCheck, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ptBR } from "date-fns/locale";
import { Tooltip } from "@/components/ui/tooltip";

const DAYS_OF_WEEK = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function WorkoutPlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  type Workout = {
    id: string;
    name: string;
    description?: string;
    level?: string;
    goal?: string;
    // Add other fields as needed
    day_of_week?: number;
  };

  type Student = {
    id: string;
    full_name: string;
    // Add other fields as needed
  };

  type Plan = {
    id: string;
    name: string;
    description?: string;
    student_id: string;
    start_date: string;
    end_date: string;
    workouts: any[];
    student?: Student;
    // Add other fields as needed
  };

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    student_id: "",
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    workouts: []
  });

  useEffect(() => {
    fetchWorkoutPlans();
    fetchWorkouts();
    fetchStudents();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch('/api/workout-plans');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlans(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar planos de treino",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setWorkouts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar treinos",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const handleAddPlan = async () => {
    try {
      setIsLoading(true);
      
      const planData = {
        ...newPlan,
        workouts: selectedWorkouts.map(workout => ({
          workout_id: workout.id,
          day_of_week: workout.day_of_week
        }))
      };

      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Plano de treino criado",
        description: `${newPlan.name} has been created successfully`,
      });
      
      await fetchWorkoutPlans();
      handleCancel();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar plano de treino",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingPlan(false);
    setNewPlan({
      name: "",
      description: "",
      student_id: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      workouts: []
    });
    setSelectedWorkouts([]);
  };


  const handleWorkoutSelect = (workout: Workout) => {
    if (!selectedWorkouts.find(w => w.id === workout.id)) {
      setSelectedWorkouts([...selectedWorkouts, {
        ...workout,
        day_of_week: 1
      }]);
    }
  };

  interface HandleWorkoutUpdateField {
    day_of_week: number;
    // Add other fields as needed
  }

  const handleWorkoutUpdate = (
    index: number,
    field: keyof HandleWorkoutUpdateField,
    value: number
  ) => {
    const updatedWorkouts = [...selectedWorkouts];
    updatedWorkouts[index] = {
      ...updatedWorkouts[index],
      [field]: value
    };
    setSelectedWorkouts(updatedWorkouts);
  };

  interface HandleRemoveWorkout {
    (index: number): void;
  }

  const handleRemoveWorkout: HandleRemoveWorkout = (index) => {
    setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
  };

  interface DeletePlan {
    id: string;
    name: string;
    // Add other fields as needed
  }

  const handleDeletePlan = async (plan: DeletePlan): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Plano de treino deletado",
        description: `${plan.name} has been removed`,
      });
      
      await fetchWorkoutPlans();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano de treino",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && new Date(plan.end_date) >= new Date()) ||
      (statusFilter === "completed" && new Date(plan.end_date) < new Date());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
  {/* Cabeçalho Aprimorado */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Gerenciar Planos de Treino</h2>
              <p className="text-muted-foreground">
                Crie e gerencie planos de treino para seus alunos
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsAddingPlan(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Criar Plano
        </Button>
      </div>
    </div>
  </div>

  {/* Formulário de Criação */}
  {isAddingPlan && (
    <div className="space-y-6">
      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Criar Plano de Treino</CardTitle>
          <CardDescription>
            Crie um novo plano de treino para seu aluno
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex.: Programa de Força 12 Semanas"
                  className="bg-background/70 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os objetivos e foco do plano..."
                  className="min-h-[100px] bg-background/70 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="student">Aluno *</Label>
                <Select
                  value={newPlan.student_id}
                  onValueChange={(value) => setNewPlan(prev => ({ ...prev, student_id: value }))}
                >
                  <SelectTrigger className="bg-background/70 backdrop-blur-sm">
                    <SelectValue placeholder="Selecione aluno" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newPlan.start_date}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, start_date: e.target.value }))}
                    className="bg-background/70 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Data de Término *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newPlan.end_date}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, end_date: e.target.value }))}
                    className="bg-background/70 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Treinos */}
      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle>Selecionar Treinos</CardTitle>
          <CardDescription>
            Escolha e agende os treinos para este plano
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <Card 
                key={workout.id} 
                className={`bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border ${
                  selectedWorkouts.find(w => w.id === workout.id) 
                    ? 'border-primary' 
                    : 'border-primary/20 hover:border-primary/30'
                } cursor-pointer`}
                onClick={() => handleWorkoutSelect(workout)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{workout.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {workout.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="capitalize bg-primary/5">
                      {workout.level}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      {workout.goal}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedWorkouts.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold">Agendar Treinos</h3>
              {selectedWorkouts.map((workout, index) => (
                <Card key={index} className="bg-background/40 backdrop-blur-sm border border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{workout.name}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/70 backdrop-blur-sm hover:text-destructive"
                        onClick={() => handleRemoveWorkout(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select
                        value={(workout.day_of_week !== undefined ? workout.day_of_week.toString() : "")}
                        onValueChange={(value) => handleWorkoutUpdate(index, 'day_of_week', parseInt(value))}
                      >
                        <SelectTrigger className="bg-background/70 backdrop-blur-sm">
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="bg-background/70 backdrop-blur-sm"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleAddPlan} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : "Criar Plano"}
        </Button>
      </div>
    </div>
  )}

  {/* Lista de Planos */}
  <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold">Planos de Treino</CardTitle>
          <CardDescription className="text-muted-foreground">
            Navegue e gerencie seus planos de treino
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            className="pl-10 bg-background/70 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Status</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <Badge variant={new Date(plan.end_date) >= new Date() ? 'default' : 'secondary'}>
                      {new Date(plan.end_date) >= new Date() ? 'Ativo' : 'Concluído'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground mt-1">
                    <div>Aluno: <span className="font-medium">{plan.student?.full_name}</span></div>
                    <div>Início: {format(new Date(plan.start_date), 'PPP', { locale: ptBR })}</div>
                    <div>Término: {format(new Date(plan.end_date), 'PPP', { locale: ptBR })}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-background/70 backdrop-blur-sm"
                        onClick={() => router.push(`/dashboard/workout-plans/${plan.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver detalhes do plano</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="bg-background/70 backdrop-blur-sm"
                        onClick={() => router.push(`/dashboard/workout-plans/${plan.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar plano</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="bg-background/70 backdrop-blur-sm hover:text-destructive"
                        onClick={() => handleDeletePlan(plan)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir plano</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
            <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Nenhum plano de treino encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Crie um novo plano para começar"}
            </p>
            <Button
              variant="ghost"
              className="mt-4 bg-background/70 backdrop-blur-sm"
              onClick={() => setIsAddingPlan(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Plano
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</div>
  );
}