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
import { Plus, Search, Filter, Calendar, ArrowRight, Copy, Trash2, Edit, CalendarCheck, Eye, Loader2, Zap, Target, TrendingUp, Users, Save, X, Clock, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, differenceInDays } from "date-fns";
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

      setStudents(Array.isArray(data.students) ? data.students : []);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarCheck className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                      Planos de Treino
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPlans.length}</span> plano{filteredPlans.length !== 1 ? 's' : ''} • Gestão Completa
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsAddingPlan(true)}
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Novo Plano
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlans}</p>
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
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePlans}</p>
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
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Alunos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((totalStudents / students.length) * 100, 100)}%` }}
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
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">Duração Média</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgDuration}d</p>
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
          <div className="space-y-8 mb-8">
            {/* Basic Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-2xl blur-xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isCloning ? 'Clonar Plano' : 'Criar Novo Plano'}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                        {isCloning ? 'Crie uma cópia de um plano existente' : 'Configure as informações básicas do plano de treino'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome do Plano *</Label>
                        <Input
                          id="name"
                          value={newPlan.name}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ex.: Programa de Força 12 Semanas"
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newPlan.description}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva os objetivos e foco do plano..."
                          className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
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
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label htmlFor="start_date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data de Início *</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={newPlan.start_date}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, start_date: e.target.value }))}
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="end_date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data de Término *</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={newPlan.end_date}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, end_date: e.target.value }))}
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
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
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Treinos</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                        Escolha e agende os treinos para este plano
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.map((workout) => (
                  <Card
                    key={workout.id}
                    className={`bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border ${selectedWorkouts.find(w => w.id === workout.id)
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
    </div>
  );
}
