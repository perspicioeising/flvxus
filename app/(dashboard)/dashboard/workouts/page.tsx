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
import { Plus, Search, Filter, MoreHorizontal, Users, ArrowRight, Copy, Dumbbell, Clock, Trash2, Edit, Eye, Loader2 } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const DIFFICULTY_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const GOALS = ["Strength", "Hipertrofia", "Resistência", "Potência", "Emagrecimento", "Reabilitação"];

export default function WorkoutsPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { exercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("all");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    level: "",
    goal: "",
    exercises: []
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

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
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleAddWorkout = async () => {
    try {
      setIsLoading(true);

      const workoutData = {
        name: newWorkout.name,
        description: newWorkout.description,
        level: newWorkout.level.toLowerCase(),
        goal: newWorkout.goal,
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          rest: exercise.rest || 60,
          notes: exercise.notes || "",
          order: index + 1
        }))
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
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
        title: isCloning ? "Treino clonado" : "Treino criado",
        description: `${newWorkout.name} foi ${isCloning ? 'clonado' : 'adicionado'} à sua biblioteca de treinos`,
      });

      await fetchWorkouts();
      handleCancel();

    } catch (error) {
      toast({
        variant: "destructive",
        title: isCloning ? "Erro ao clonar treino" : "Erro ao criar treino",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingWorkout(false);
    setIsCloning(false);
    setNewWorkout({
      name: "",
      description: "",
      level: "",
      goal: "",
      exercises: []
    });
    setSelectedExercises([]);
  };

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

  const handleExerciseSelect = (exercise: Exercise) => {
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

  interface HandleExerciseUpdateParams {
    index: number;
    field: keyof SelectedExercise;
    value: number | string;
  }

  const handleExerciseUpdate = (
    index: HandleExerciseUpdateParams["index"],
    field: HandleExerciseUpdateParams["field"],
    value: HandleExerciseUpdateParams["value"]
  ) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };

  interface HandleRemoveExerciseParams {
    index: number;
  }

  const handleRemoveExercise = (index: HandleRemoveExerciseParams["index"]) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  interface HandleViewDetailsParams {
    workoutId: string;
  }

  const handleViewDetails = (workoutId: HandleViewDetailsParams["workoutId"]) => {
    router.push(`/dashboard/workouts/${workoutId}`);
  };

  interface Workout {
    id: string;
    name: string;
    description?: string;
    level: string;
    goal: string;
    workout_exercises?: WorkoutExercise[];
  }

  interface WorkoutExercise {
    sets: number;
    reps: number;
    rest: number;
    notes?: string;
    exercise: Exercise;
  }

  const handleCloneWorkout = async (workout: Workout): Promise<void> => {
    try {
      setIsLoading(true);

      // First fetch the complete workout details including exercises
      const detailsResponse = await fetch(`/api/workouts/${workout.id}`);
      const workoutDetails: Workout = await detailsResponse.json();

      if (!detailsResponse.ok) {
        throw new Error((workoutDetails as any).error);
      }

      // Set the workout details in the form
      setNewWorkout({
        name: `${workout.name} (Copy)`,
        description: workout.description || "",
        level: workout.level,
        goal: workout.goal,
        exercises: []
      });

      // Set the exercises with their configurations
      setSelectedExercises(
        workoutDetails.workout_exercises?.map((we: WorkoutExercise) => ({
          ...we.exercise,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          notes: we.notes || ""
        })) || []
      );

      // Show the form in clone mode
      setIsCloning(true);
      setIsAddingWorkout(true);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao preparar clonagem do treino",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface HandleDeleteWorkoutParams {
    id: string;
    name: string;
  }

  const handleDeleteWorkout = async (workout: HandleDeleteWorkoutParams): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Workout deleted",
        description: `${workout.name} foi removido`,
      });

      await fetchWorkouts();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar treino",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      levelFilter === "all" ||
      workout.level === levelFilter;

    return matchesSearch && matchesLevel;
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
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Treinos</h2>
                  <p className="text-muted-foreground">
                    Crie e gerencie programas de treino
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsAddingWorkout(true)}
              className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-6 w-6" />
               <span className="text-xs">Adicionar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Formulário de Criação */}
      {isAddingWorkout && (
        <div className="space-y-6">
          <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>{isCloning ? 'Clonar Treino' : 'Criar Novo Treino'}</CardTitle>
              <CardDescription>
                {isCloning ? 'Crie uma cópia de um treino existente' : 'Digite as informações básicas do seu treino'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Treino *</Label>
                    <Input
                      id="name"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex.: Força do Corpo Superior"
                      className="bg-background/70 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newWorkout.description}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o foco e os objetivos do treino..."
                      className="min-h-[100px] bg-background/70 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="level">Nível de Dificuldade *</Label>
                    <Select
                      value={newWorkout.level}
                      onValueChange={(value) => setNewWorkout(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger className="bg-background/70 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goal">Objetivo Principal *</Label>
                    <Select
                      value={newWorkout.goal}
                      onValueChange={(value) => setNewWorkout(prev => ({ ...prev, goal: value }))}
                    >
                      <SelectTrigger className="bg-background/70 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
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

          {/* Seleção de Exercícios */}
          <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>Selecionar Exercícios</CardTitle>
              <CardDescription>
                Escolha os exercícios para incluir no seu treino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar exercícios..."
                    className="pl-10 bg-background/70 backdrop-blur-sm"
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={exerciseMuscleFilter} onValueChange={setExerciseMuscleFilter}>
                  <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Grupo Muscular</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
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
                    className={`bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border ${selectedExercises.find(e => e.id === exercise.id)
                        ? 'border-primary'
                        : 'border-primary/20 hover:border-primary/30'
                      } cursor-pointer`}
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
                          <Badge key={group} variant="outline" className="text-xs bg-primary/5">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuração de Exercícios */}
          {selectedExercises.length > 0 && (
            <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle>Configurar Exercícios</CardTitle>
                <CardDescription>
                  Configure os detalhes de cada exercício no seu treino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExercises.map((exercise, index) => (
                  <Card key={index} className="bg-background/40 backdrop-blur-sm border border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{exercise.name}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background/70 backdrop-blur-sm hover:text-destructive"
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
                            className="bg-background/70 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Repetições</Label>
                          <Input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                            min={1}
                            className="bg-background/70 backdrop-blur-sm"
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
                            className="bg-background/70 backdrop-blur-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notas</Label>
                          <Input
                            value={exercise.notes}
                            onChange={(e) => handleExerciseUpdate(index, 'notes', e.target.value)}
                            placeholder="Instruções adicionais..."
                            className="bg-background/70 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-background/70 backdrop-blur-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddWorkout}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCloning ? "Clonando..." : "Criando..."}
                </>
              ) : isCloning ? "Clonar Treino" : "Criar Treino"}
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Treinos */}
      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Gerenciamento de Treinos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Navegue e gerencie seus programas de treino
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar treinos..."
                className="pl-10 bg-background/70 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Dificuldade</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                <SelectItem value="all">Todos os Níveis</SelectItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {filteredWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{workout.name}</h3>
                        <Badge variant="outline" className="capitalize bg-primary/5">
                          {workout.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workout.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div>Objetivo: <span className="font-medium">{workout.goal}</span></div>
                        <div>•</div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {workout.workout_exercises?.length || 0} exercícios
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-background/70 backdrop-blur-sm"
                            onClick={() => handleViewDetails(workout.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes do treino</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/70 backdrop-blur-sm"
                            onClick={() => handleViewDetails(workout.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar treino</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/70 backdrop-blur-sm"
                            onClick={() => handleCloneWorkout(workout)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clonar treino</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/70 backdrop-blur-sm hover:text-destructive"
                            onClick={() => handleDeleteWorkout(workout)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir treino</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredWorkouts.length === 0 && (
              <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Nenhum treino encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || levelFilter !== 'all'
                    ? "Tente ajustar os filtros de busca"
                    : "Crie um novo treino para começar"}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-background/70 backdrop-blur-sm"
                  onClick={() => setIsAddingWorkout(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Criar Treino
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}