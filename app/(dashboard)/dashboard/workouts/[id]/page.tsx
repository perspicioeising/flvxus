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
import { ArrowLeft, Dumbbell, Clock, Trash2, Save, Plus, Search, Filter, Target, Edit, Loader2, X, Settings, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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

  const handleExerciseUpdate = (
    index: number,
    field: keyof Pick<SelectedExercise, "sets" | "reps" | "rest" | "notes">,
    value: number | string
  ) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
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

  // Calculate statistics
  const totalExercises = selectedExercises.length;
  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const avgRestTime = totalExercises > 0 ? Math.round(selectedExercises.reduce((sum, ex) => sum + ex.rest, 0) / totalExercises) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="group bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  Voltar
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Edit className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                        Editar Treino
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                        Modifique os detalhes e exercícios do treino
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !workout.name || !workout.level || !workout.goal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-3 rounded-2xl font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Dumbbell className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Exercícios</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExercises}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalExercises / 15) * 100, 100)}%` }}
                  ></div>
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
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Total de Séries</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSets}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalSets / 50) * 100, 100)}%` }}
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
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Descanso Médio</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRestTime}s</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((avgRestTime / 120) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Informações do Treino
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                      Atualize os detalhes básicos do seu treino
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
                        value={workout.name}
                        onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ex.: Força do Corpo Superior A"
                        className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição</Label>
                      <Textarea
                        id="description"
                        value={workout.description}
                        onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o foco e os objetivos específicos deste treino..."
                        className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="level" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nível de Dificuldade *</Label>
                      <Select
                        value={workout.level}
                        onValueChange={(value) => setWorkout(prev => ({ ...prev, level: value }))}
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
                        value={workout.goal}
                        onValueChange={(value) => setWorkout(prev => ({ ...prev, goal: value }))}
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
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Exercícios</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                      Gerencie os exercícios deste treino
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
                        placeholder="Buscar exercícios para adicionar..."
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
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Exercícios Selecionados</CardTitle>
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