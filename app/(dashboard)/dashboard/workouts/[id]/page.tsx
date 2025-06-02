'use client';

import { useState, useEffect } from "react";
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
import { ArrowLeft, Dumbbell, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";

const DIFFICULTY_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const GOALS = ["Strength", "Hipertrofia", "Resistência", "Potência", "Emagrecimento", "Reabilitação"];

// Type definitions
interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string[];
}

interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
  rest: number;
  notes: string;
}

export default function WorkoutDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { exercises } = useExercises();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("all");
  
  const [workout, setWorkout] = useState({
    name: "",
    description: "",
    level: "",
    goal: "",
    exercises: []
  });

  useEffect(() => {
    fetchWorkoutDetails();
  }, []);

  const fetchWorkoutDetails = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setWorkout({
        name: data.name,
        description: data.description || "",
        level: data.level,
        goal: data.goal,
        exercises: []
      });

      interface WorkoutExercise {
        exercise: Exercise;
        sets: number;
        reps: number;
        rest: number;
        notes?: string;
      }

      interface Exercise {
        id: string;
        name: string;
        description: string;
        muscle_group: string[];
      }

      interface SelectedExercise extends Exercise {
        sets: number;
        reps: number;
        rest: number;
        notes: string;
      }

      setSelectedExercises(
        (data.workout_exercises as WorkoutExercise[])?.map((we: WorkoutExercise): SelectedExercise => ({
          ...we.exercise,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          notes: we.notes || ""
        })) || []
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do treino",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const workoutData = {
        name: workout.name,
        description: workout.description,
        level: workout.level.toLowerCase(),
        goal: workout.goal,
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          rest: exercise.rest || 60,
          notes: exercise.notes || "",
          order: index + 1
        }))
      };

      const response = await fetch(`/api/workouts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Treino atualizado",
        description: "As alterações foram salvas com sucesso",
      });
      
      router.push('/dashboard/workouts');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar treino",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface HandleExerciseSelectProps {
    id: string;
    name: string;
    description: string;
    muscle_group: string[];
  }

  const handleExerciseSelect = (exercise: HandleExerciseSelectProps) => {
    if (!selectedExercises.find((e) => e.id === exercise.id)) {
      setSelectedExercises([
        ...selectedExercises,
        {
          ...exercise,
          sets: 3,
          reps: 12,
          rest: 60,
          notes: "",
        },
      ]);
    }
  };

  interface HandleExerciseUpdate {
    index: number;
    field: keyof Pick<SelectedExercise, "sets" | "reps" | "rest" | "notes">;
    value: number | string;
  }

  const handleExerciseUpdate = (
    index: HandleExerciseUpdate["index"],
    field: HandleExerciseUpdate["field"],
    value: HandleExerciseUpdate["value"]
  ) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };

  interface HandleRemoveExercise {
    index: number;
  }

  const handleRemoveExercise = (index: HandleRemoveExercise["index"]) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    
    const matchesMuscle = 
      exerciseMuscleFilter === "all" || 
      exercise.muscle_group.includes(exerciseMuscleFilter);

    return matchesSearch && matchesMuscle;
  });

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
            <h2 className="text-3xl font-bold tracking-tight">Editar Treino</h2>
            <p className="text-muted-foreground">
              Modifique os detalhes e exercícios do treino
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
            <CardTitle>Informações do Treino</CardTitle>
            <CardDescription>
              Atualize os detalhes básicos do seu treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Treino *</Label>
                  <Input
                    id="name"
                    value={workout.name}
                    onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex.: Força do Corpo Superior"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={workout.description}
                    onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o foco e os objetivos do treino..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="level">Nível de Dificuldade *</Label>
                  <Select
                    value={workout.level}
                    onValueChange={(value) => setWorkout(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal">Objetivo Principal *</Label>
                  <Select
                    value={workout.goal}
                    onValueChange={(value) => setWorkout(prev => ({ ...prev, goal: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOALS.map((goal) => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
            <CardDescription>
              Gerencie os exercícios deste treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar exercícios para adicionar..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                />
              </div>
              <Select value={exerciseMuscleFilter} onValueChange={setExerciseMuscleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por músculo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Grupos</SelectItem>
                  {["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"].map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card 
                  key={exercise.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedExercises.find(e => e.id === exercise.id) 
                      ? 'border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{exercise.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscle_group.map((group) => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedExercises.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold">Exercícios Selecionados</h3>
                {selectedExercises.map((exercise, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{exercise.name}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExercise(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Séries</Label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                            min={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Repetições</Label>
                          <Input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                            min={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descanso (segundos)</Label>
                          <Input
                            type="number"
                            value={exercise.rest}
                            onChange={(e) => handleExerciseUpdate(index, 'rest', parseInt(e.target.value))}
                            min={0}
                            step={15}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notas</Label>
                          <Input
                            value={exercise.notes}
                            onChange={(e) => handleExerciseUpdate(index, 'notes', e.target.value)}
                            placeholder="Instruções adicionais..."
                          />
                        </div>
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