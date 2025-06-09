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
import { ArrowLeft, Calendar, Trash2, CalendarCheck, Zap, Edit, Target, Settings, Dumbbell, Save, X, Loader2, Plus } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  
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
        data.workout_plan_items?.map((item: WorkoutPlanItem) => ({
          id: item.workout.id,
          name: item.workout.name,
          level: item.workout.level,
          goal: item.workout.goal,
          day_of_week: item.day_of_week
        })) || []
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
      
      setStudents(Array.isArray(data.students) ? data.students : Array.isArray(data) ? data : []);
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
      setIsSaving(true);
      
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
      setIsSaving(false);
    }
  };

  const handleWorkoutSelect = (workout: Workout) => {
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

  const handleWorkoutUpdate = (
    index: number,
    field: keyof { day_of_week: number },
    value: number
  ) => {
    const updatedWorkouts = [...selectedWorkouts];
    updatedWorkouts[index] = {
      ...updatedWorkouts[index],
      [field]: value
    };
    setSelectedWorkouts(updatedWorkouts);
  };

  const handleRemoveWorkout = (index: number) => {
    setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        
        {/* Modern Header */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Edit className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Editar Plano de Treino
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1">
                      Modifique os detalhes e configurações do plano
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !plan.name || !plan.student_id}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Informações do Plano</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Atualize os detalhes básicos do seu plano de treino
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome do Plano *</Label>
                      <Input
                        id="name"
                        value={plan.name}
                        onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ex.: Programa de Força 12 Semanas"
                        className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição</Label>
                      <Textarea
                        id="description"
                        value={plan.description}
                        onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva os objetivos e foco do plano..."
                        className="min-h-[100px] sm:min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="student" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aluno *</Label>
                      <Select
                        value={plan.student_id}
                        onValueChange={(value) => setPlan(prev => ({ ...prev, student_id: value }))}
                      >
                        <SelectTrigger className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectValue placeholder="Selecione o aluno" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                          {Array.isArray(students) && students.map((student) => (
                            <SelectItem key={student.id} value={student.id} className="rounded-xl">
                              {student.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="start_date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data de Início *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={plan.start_date}
                          onChange={(e) => setPlan(prev => ({ ...prev, start_date: e.target.value }))}
                          className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="end_date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data de Término *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={plan.end_date}
                          onChange={(e) => setPlan(prev => ({ ...prev, end_date: e.target.value }))}
                          className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout Management */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Treinos</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Adicione ou remova treinos deste plano
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {workouts.map((workout, index) => (
                    <Card 
                      key={workout.id} 
                      className={`group cursor-pointer transition-all duration-300 ${
                        selectedWorkouts.find(w => w.id === workout.id) 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-lg'
                          : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      } rounded-xl shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm`}
                      onClick={() => handleWorkoutSelect(workout)}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            selectedWorkouts.find(w => w.id === workout.id)
                              ? 'bg-blue-500'
                              : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800'
                          } transition-colors duration-300`}>
                            <Dumbbell className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              selectedWorkouts.find(w => w.id === workout.id)
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }`} />
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{workout.name}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                          {workout.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full text-xs capitalize">
                            {workout.level}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full text-xs">
                            {workout.goal}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedWorkouts.length > 0 && (
                  <div className="relative mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Agendar Treinos</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                              Configure os dias da semana para cada treino
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {selectedWorkouts.map((workout, index) => (
                          <div key={index} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md rounded-2xl">
                            <div className="p-4 sm:p-6">
                              <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">{workout.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Treino {index + 1}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl"
                                  onClick={() => handleRemoveWorkout(index)}
                                >
                                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Dia da Semana</Label>
                                <Select
                                  value={workout.day_of_week.toString()}
                                  onValueChange={(value) => handleWorkoutUpdate(index, 'day_of_week', parseInt(value))}
                                >
                                  <SelectTrigger className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all">
                                    <SelectValue placeholder="Selecione o dia" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                                    {DAYS_OF_WEEK.map((day) => (
                                      <SelectItem key={day.value} value={day.value.toString()} className="rounded-xl">
                                        {day.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedWorkouts.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="relative mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center shadow-lg">
                        <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-orange-400/30 rounded-full blur-xl animate-pulse"></div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Nenhum treino selecionado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Clique nos treinos acima para adicioná-los ao plano
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
