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
import { Plus, Search, Filter, Dumbbell, Clock, Trash2, Edit, Eye, Loader2, Zap, Target, TrendingUp, Users, Copy, X, Save, Settings, Activity } from "lucide-react";
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

  // Calculate statistics
  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce((sum, workout) => sum + (workout.workout_exercises?.length || 0), 0);
  const avgExercisesPerWorkout = totalWorkouts > 0 ? Math.round(totalExercises / totalWorkouts) : 0;
  const uniqueDifficulties = new Set(workouts.map(w => w.level)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Treinos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">{filteredWorkouts.length}</span> treino{filteredWorkouts.length !== 1 ? 's' : ''} • Biblioteca Completa
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsAddingWorkout(true)}
            className="group bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 border-0 min-h-[44px]"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Novo
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Exercícios</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExercises}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalExercises / (exercises.length || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Média</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgExercisesPerWorkout}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((avgExercisesPerWorkout / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">Níveis</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueDifficulties}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((uniqueDifficulties / DIFFICULTY_LEVELS.length) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Creation Form */}
        {isAddingWorkout && (
          <div className="space-y-8 mb-8">
            {/* Basic Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isCloning ? 'Clonar Treino' : 'Criar Novo Treino'}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                        {isCloning ? 'Crie uma cópia de um treino existente' : 'Configure as informações básicas do seu programa de treino'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome do Treino *</Label>
                        <Input
                          id="name"
                          value={newWorkout.name}
                          onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ex.: Força do Corpo Superior A"
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newWorkout.description}
                          onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o foco e os objetivos específicos deste treino..."
                          className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="level" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nível de Dificuldade *</Label>
                        <Select
                          value={newWorkout.level}
                          onValueChange={(value) => setNewWorkout(prev => ({ ...prev, level: value }))}
                        >
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                            {DIFFICULTY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level} className="rounded-xl">{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="goal" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Objetivo Principal *</Label>
                        <Select
                          value={newWorkout.goal}
                          onValueChange={(value) => setNewWorkout(prev => ({ ...prev, goal: value }))}
                        >
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                            <SelectValue placeholder="Selecione o objetivo" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                            {GOALS.map((goal) => (
                              <SelectItem key={goal} value={goal} className="rounded-xl">{goal}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Selection */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Exercícios</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                        Escolha os exercícios que farão parte do seu treino
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-50"></div>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <Input
                          placeholder="Buscar exercícios por nome..."
                          className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                          value={exerciseSearchQuery}
                          onChange={(e) => setExerciseSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <Select value={exerciseMuscleFilter} onValueChange={setExerciseMuscleFilter}>
                      <SelectTrigger className="w-full lg:w-[220px] h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold">Grupo Muscular</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
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
                        className={`group cursor-pointer transition-all duration-300 ${
                          selectedExercises.find(e => e.id === exercise.id)
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-400 shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                        } rounded-xl shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm`}
                        onClick={() => handleExerciseSelect(exercise)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              selectedExercises.find(e => e.id === exercise.id)
                                ? 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-green-200 dark:group-hover:bg-green-800'
                            } transition-colors duration-300`}>
                              <Dumbbell className={`h-4 w-4 ${
                                selectedExercises.find(e => e.id === exercise.id)
                                  ? 'text-white'
                                  : 'text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400'
                              }`} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{exercise.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {exercise.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {exercise.muscle_group.map((group) => (
                              <Badge key={group} className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full text-xs">
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
            </div>

            {/* Exercise Configuration */}
            {selectedExercises.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Configurar Exercícios</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                          Configure séries, repetições e descanso para cada exercício
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedExercises.map((exercise, index) => (
                      <div key={index} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md rounded-2xl">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <Dumbbell className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exercise.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Exercício {index + 1}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Séries</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                                min={1}
                                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Repetições</Label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                                min={1}
                                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descanso (seg)</Label>
                              <Input
                                type="number"
                                value={exercise.rest}
                                onChange={(e) => handleExerciseUpdate(index, 'rest', parseInt(e.target.value))}
                                min={0}
                                step={15}
                                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notas</Label>
                              <Input
                                value={exercise.notes}
                                onChange={(e) => handleExerciseUpdate(index, 'notes', e.target.value)}
                                placeholder="Instruções especiais..."
                                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleAddWorkout}
                disabled={isLoading || !newWorkout.name || !newWorkout.level || !newWorkout.goal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isCloning ? "Clonando..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    {isCloning ? "Clonar Treino" : "Criar Treino"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Workouts List */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Biblioteca de Treinos</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                      Gerencie todos os seus programas de treino
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
                    <Input
                      placeholder="Buscar treinos por nome ou descrição..."
                      className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full lg:w-[220px] h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">Dificuldade</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                    <SelectItem value="all">Todos os Níveis</SelectItem>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workouts Grid */}
              <div className="space-y-4">
                {filteredWorkouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="group relative"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <Card className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300/50 dark:hover:border-green-600/50 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-green-500/10 group-hover:scale-[1.01]">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-20 blur-lg" />
                                <div className="relative w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                  <Dumbbell className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                                    {workout.name}
                                  </h3>
                                  <Badge className={`capitalize rounded-full px-3 py-1 text-xs font-semibold ${
                                    workout.level === 'iniciante' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600' :
                                    workout.level === 'intermediário' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600' :
                                    'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600'
                                  }`}>
                                    {workout.level}
                                  </Badge>
                                </div>
                                {/* <p className="text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {workout.description}
                                </p> */}
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      Objetivo: <span className="text-blue-600 dark:text-blue-400">{workout.goal}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Dumbbell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      <span className="text-purple-600 dark:text-purple-400">{workout.workout_exercises?.length || 0}</span> exercícios
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={() => handleViewDetails(workout.id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes completos</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                                  className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                                  className="h-10 w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                  </div>
                ))}

                {filteredWorkouts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="relative mb-8">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-2xl">
                        <Dumbbell className="h-16 w-16 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                    </div>

                    <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
                      {searchQuery || levelFilter !== 'all' ? 'Nenhum treino encontrado' : 'Crie Seu Primeiro Treino!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                      {searchQuery || levelFilter !== 'all'
                        ? "Ajuste os filtros de busca para encontrar o treino que você procura"
                        : "Comece criando programas de treino personalizados para seus alunos"}
                    </p>

                    <Button
                      onClick={() => setIsAddingWorkout(true)}
                      className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                    >
                      <Plus className="mr-3 h-6 w-6" />
                      {searchQuery || levelFilter !== 'all' ? 'Novo Treino' : 'Começar Agora'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}