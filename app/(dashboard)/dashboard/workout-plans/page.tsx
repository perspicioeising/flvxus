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
import { Plus, Search, Filter, Calendar, ArrowRight, Copy, Trash2, Edit, CalendarCheck, Eye, Loader2, Zap, Target, TrendingUp, Users, Save, X, Clock, Activity, Dumbbell, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, differenceInDays } from "date-fns";
import { TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ptBR } from "date-fns/locale";
import { Tooltip } from "@/components/ui/tooltip";
import { DataPagination } from "@/components/ui/data-pagination";

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
  const [isCloning, setIsCloning] = useState(false);
  
  type Workout = {
    id: string;
    name: string;
    description?: string;
    level?: string;
    goal?: string;
    day_of_week?: number;
  };

  type Student = {
    id: string;
    full_name: string;
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
  };

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

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

  const fetchWorkoutPlans = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const response = await fetch(`/api/workout-plans?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (data.plans && data.pagination) {
        // If API returns paginated data
        setPlans(data.plans);
        setPagination(data.pagination);
      } else {
        // If API returns just the array (fallback)
        setPlans(data);
        setPagination({
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1
        });
      }
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

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchWorkoutPlans(page, pagination.limit);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchWorkoutPlans(1, pageSize);
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
        title: isCloning ? "Plano clonado" : "Plano criado",
        description: `${newPlan.name} foi ${isCloning ? 'clonado' : 'criado'} com sucesso`,
      });

      await fetchWorkoutPlans();
      handleCancel();

    } catch (error) {
      toast({
        variant: "destructive",
        title: isCloning ? "Erro ao clonar plano" : "Erro ao criar plano",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingPlan(false);
    setIsCloning(false);
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

  const handleClonePlan = async (plan: Plan) => {
    setNewPlan({
      name: `${plan.name} (Cópia)`,
      description: plan.description || "",
      student_id: plan.student_id,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      workouts: []
    });
    
    // Fetch plan details to get workouts
    try {
      const response = await fetch(`/api/workout-plans/${plan.id}`);
      const data = await response.json();
      
      if (response.ok && data.workouts) {
        setSelectedWorkouts(data.workouts.map((w: any) => ({
          ...w.workout,
          day_of_week: w.day_of_week
        })));
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
    
    setIsCloning(true);
    setIsAddingPlan(true);
  };

  const handleDeletePlan = async (plan: { id: string; name: string }) => {
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
        title: "Plano deletado",
        description: `${plan.name} foi removido`,
      });

      await fetchWorkoutPlans();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano",
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

  // Calculate statistics
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => new Date(p.end_date) >= new Date()).length;
  const totalStudents = new Set(plans.map(p => p.student_id)).size;
  const avgDuration = plans.length > 0 
    ? Math.round(plans.reduce((sum, plan) => sum + differenceInDays(new Date(plan.end_date), new Date(plan.start_date)), 0) / plans.length)
    : 0;

     if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Planos de Treino
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPlans.length}</span> plano{filteredPlans.length !== 1 ? 's' : ''} • Gestão Completa
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsAddingPlan(true)}
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0 min-h-[44px]"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Novo Plano
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold">Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalPlans}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold">Ativos</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activePlans}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${totalPlans > 0 ? (activePlans / totalPlans) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold">Alunos</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${students.length > 0 ? Math.min((totalStudents / students.length) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold">Duração Média</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{avgDuration}d</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((avgDuration / 90) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Creation Form */}
        {isAddingPlan && (
          <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
            {/* Basic Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {isCloning ? 'Clonar Plano' : 'Criar Novo Plano'}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                        {isCloning ? 'Crie uma cópia de um plano existente' : 'Configure as informações básicas do plano de treino'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome do Plano *</Label>
                        <Input
                          id="name"
                          value={newPlan.name}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ex.: Programa de Força 12 Semanas"
                          className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newPlan.description}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva os objetivos e foco do plano..."
                          className="min-h-[100px] sm:min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="student" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aluno *</Label>
                        <Select
                          value={newPlan.student_id}
                          onValueChange={(value) => setNewPlan(prev => ({ ...prev, student_id: value }))}
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
                            value={newPlan.start_date}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, start_date: e.target.value }))}
                            className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="end_date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data de Término *</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={newPlan.end_date}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, end_date: e.target.value }))}
                            className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Workout Selection */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Selecionar Treinos</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                        Escolha e agende os treinos para este plano
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {workouts.map((workout) => (
                      <Card
                        key={workout.id}
                        className={`group cursor-pointer transition-all duration-300 ${
                          selectedWorkouts.find(w => w.id === workout.id)
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        } rounded-xl shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm`}
                        onClick={() => handleWorkoutSelect(workout)}
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
                            {workout.level && (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full text-xs capitalize">
                                {workout.level}
                              </Badge>
                            )}
                            {workout.goal && (
                              <Badge className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-full text-xs">
                                {workout.goal}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Configuration */}
            {selectedWorkouts.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Agendar Treinos</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                          Configure os dias da semana para cada treino
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {selectedWorkouts.map((workout, index) => (
                      <div key={index} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md rounded-2xl">
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
                              value={(workout.day_of_week !== undefined ? workout.day_of_week.toString() : "")}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 min-h-[44px]"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleAddPlan}
                disabled={isLoading || !newPlan.name || !newPlan.student_id || !newPlan.start_date || !newPlan.end_date}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 sm:px-10 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    {isCloning ? "Clonando..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {isCloning ? "Clonar Plano" : "Criar Plano"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Plans List */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Biblioteca de Planos</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                      Gerencie todos os seus planos de treino
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    <Input
                      placeholder="Buscar planos por nome, descrição ou aluno..."
                      className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[200px] h-10 sm:h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm sm:text-base">Status</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plans Grid */}
              <div className="space-y-3 sm:space-y-4">
                {filteredPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="group relative"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <Card className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 group-hover:scale-[1.01]">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
                          <div className="space-y-3 sm:space-y-4 flex-1">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-lg" />
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                  <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                              </div>
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 truncate">
                                    {plan.name}
                                  </h3>
                                  <Badge className={`self-start rounded-full px-2 py-1 sm:px-3 text-xs font-semibold ${
                                    new Date(plan.end_date) >= new Date() 
                                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600' 
                                      : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600'
                                  }`}>
                                    {new Date(plan.end_date) >= new Date() ? 'Ativo' : 'Concluído'}
                                  </Badge>
                                </div>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {plan.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                      Aluno: <span className="text-purple-600 dark:text-purple-400">{plan.student?.full_name}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      <span className="text-blue-600 dark:text-blue-400">{format(new Date(plan.start_date), 'dd/MM/yyyy')}</span> até <span className="text-blue-600 dark:text-blue-400">{format(new Date(plan.end_date), 'dd/MM/yyyy')}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      <span className="text-orange-600 dark:text-orange-400">{plan.workouts?.length || 0}</span> treinos
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 xl:flex-col xl:items-stretch xl:w-[120px] sm:xl:w-[140px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={() => router.push(`/dashboard/workout-plans/${plan.id}`)}
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 " />
                               
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes completos</TooltipContent>
                            </Tooltip>

                            <div className="flex gap-2 xl:flex-col xl:gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => router.push(`/dashboard/workout-plans/${plan.id}/edit`)}
                                  >
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar plano</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => handleClonePlan(plan)}
                                  >
                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Clonar plano</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => handleDeletePlan(plan)}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir plano</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {filteredPlans.length === 0 && (
                  <div className="text-center py-12 sm:py-20">
                    <div className="relative mb-6 sm:mb-8">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-2xl">
                        <CalendarCheck className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
                      {searchQuery || statusFilter !== 'all' ? 'Nenhum plano encontrado' : 'Crie Seu Primeiro Plano!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                      {searchQuery || statusFilter !== 'all'
                        ? "Ajuste os filtros de busca para encontrar o plano que você procura"
                        : "Comece criando planos de treino personalizados para seus alunos"}
                    </p>

                    <Button
                      onClick={() => setIsAddingPlan(true)}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 border-0 min-h-[44px] text-sm sm:text-base"
                    >
                      <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                      {searchQuery || statusFilter !== 'all' ? 'Novo Plano' : 'Começar Agora'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pagination */}
        {filteredPlans.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 sm:mt-12 flex justify-center">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <DataPagination
                page={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}