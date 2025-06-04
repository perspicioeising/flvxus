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
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function EditWorkoutPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  type Workout = {
    id: string;
    name: string;
    description?: string;
    level: string;
    goal: string;
  };
  
  type Student = {
    id: string;
    full_name: string;
  };
  
  type SelectedWorkout = {
    id: string;
    name: string;
    level: string;
    goal: string;
    day_of_week: number;
  };
  
  type WorkoutPlanItem = {
    workout: Workout;
    day_of_week: number;
  };
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<SelectedWorkout[]>([]);
  
  const [plan, setPlan] = useState({
    name: "",
    description: "",
    student_id: "",
    start_date: "",
    end_date: "",
  });

  const fetchPlanDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/workout-plans/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlan({
        name: data.name,
        description: data.description || "",
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date,
      });

      setSelectedWorkouts(
        data.workout_plan_items.map((item: WorkoutPlanItem) => ({
          id: item.workout.id,
          name: item.workout.name,
          level: item.workout.level,
          goal: item.workout.goal,
          day_of_week: item.day_of_week
        }))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do plano",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast]);

  const fetchWorkouts = useCallback(async () => {
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
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(data);
        setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  useEffect(() => {
    const init = async () => {
      await fetchPlanDetails();
      await fetchStudents();
      await fetchWorkouts();
    };
    init();
  }, [fetchPlanDetails, fetchStudents, fetchWorkouts]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const planData = {
        ...plan,
        workouts: selectedWorkouts.map(workout => ({
          workout_id: workout.id,
          day_of_week: workout.day_of_week
        }))
      };

      const response = await fetch(`/api/workout-plans/${params.id}`, {
        method: 'PUT',
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
        title: "Plano atualizado",
        description: "As alterações foram salvas com sucesso",
      });
      
      router.push(`/dashboard/workout-plans/${params.id}`);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar plano",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface HandleWorkoutSelectWorkout {
    id: string;
    name: string;
    description?: string;
    level: string;
    goal: string;
  }

  const handleWorkoutSelect = (workout: HandleWorkoutSelectWorkout) => {
    if (!selectedWorkouts.find((w) => w.id === workout.id)) {
      setSelectedWorkouts([
        ...selectedWorkouts,
        {
          ...workout,
          day_of_week: 1,
        },
      ]);
    }
  };

  interface HandleWorkoutUpdateField {
    day_of_week: number;
    [key: string]: number | string;
  }

  const handleWorkoutUpdate = (
    index: number,
    field: keyof HandleWorkoutUpdateField,
    value: number | string
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando detalhes do plano...</h2>
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
            <h2 className="text-3xl font-bold tracking-tight">Editar Plano de Treino</h2>
            <p className="text-muted-foreground">
              Modifique os detalhes do plano de treino
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
            <CardDescription>
              Atualize os detalhes básicos do seu plano de treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Plano *</Label>
                  <Input
                    id="name"
                    value={plan.name}
                    onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex.: Programa de Força 12 Semanas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={plan.description}
                    onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os objetivos e foco do plano..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Aluno *</Label>
                  <Select
                    value={plan.student_id}
                    onValueChange={(value) => setPlan(prev => ({ ...prev, student_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione aluno" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                        {Array.isArray(students) && students.map((student) => (
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
                      value={plan.start_date}
                      onChange={(e) => setPlan(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Data de Término *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={plan.end_date}
                      onChange={(e) => setPlan(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Treinos</CardTitle>
            <CardDescription>
              Adicione ou remova treinos deste plano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <Card 
                  key={workout.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedWorkouts.find(w => w.id === workout.id) 
                      ? 'border-primary' 
                      : 'hover:border-primary/50'
                  }`}
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
                      <Badge variant="outline" className="capitalize">
                        {workout.level}
                      </Badge>
                      <Badge variant="outline">
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
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{workout.name}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveWorkout(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Dia da Semana</Label>
                        <Select
                          value={workout.day_of_week.toString()}
                          onValueChange={(value) => handleWorkoutUpdate(index, 'day_of_week', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
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
      </div>
    </div>
  );
}