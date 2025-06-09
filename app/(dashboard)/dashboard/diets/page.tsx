'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Utensils, 
  User, 
  Calendar, 
  Target, 
  TrendingUp,
  Apple,
  Brain,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2,
  ChefHat,
  Zap,
  BarChart3,
  Pizza,
  Coffee,
  Salad,
  Beef,
  Timer
} from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { useDiets } from "@/hooks/use-diets";
import { DataPagination } from "@/components/ui/data-pagination";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function DietsPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const { 
    diets, 
    loading, 
    pagination,
    deleteDiet,
    changePage,
    changePageSize
  } = useDiets(selectedStudent === "all" ? undefined : selectedStudent);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile?.role === 'trainer') {
      fetchStudents();
    }
  }, [userProfile]);


  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'student')
        .eq('tenant_id', userProfile.tenant_id)
        .order('full_name');
      
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateDiet = () => {
    router.push('/dashboard/diets/new');
  };

  const handleViewDiet = (id: string) => {
    router.push(`/dashboard/diets/${id}`);
  };

  const handleEditDiet = (id: string) => {
    router.push(`/dashboard/diets/${id}/edit`);
  };

  const handleDeleteDiet = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta dieta?")) {
      return;
    }

    try {
      await deleteDiet(id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCloneDiet = (diet: any) => {
    router.push(`/dashboard/diets/new?clone=${diet.id}`);
  };

  // Filter diets based on search query
  const filteredDiets = diets.filter((diet) => {
    const matchesSearch =
      diet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diet.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getGoalIcon = (goal: string) => {
    const icons: Record<string, any> = {
      muscle_gain: <TrendingUp className="h-4 w-4" />,
      fat_loss: <Target className="h-4 w-4" />,
      reeducation: <Apple className="h-4 w-4" />,
      performance: <Zap className="h-4 w-4" />,
      maintenance: <BarChart3 className="h-4 w-4" />
    };
    return icons[goal] || <Target className="h-4 w-4" />;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      muscle_gain: 'Ganho de Massa',
      fat_loss: 'Perda de Gordura',
      reeducation: 'Reeducação',
      performance: 'Performance',
      maintenance: 'Manutenção'
    };
    return labels[goal] || 'Personalizado';
  };

  const getActivityLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: 'Sedentário',
      light: 'Leve',
      moderate: 'Moderado',
      intense: 'Intenso',
      athlete: 'Atleta'
    };
    return labels[level] || level;
  };

  const getBudgetIcon = (budget: string) => {
    const icons: Record<string, any> = {
      economic: <DollarSign className="h-4 w-4 text-green-600" />,
      intermediate: <DollarSign className="h-4 w-4 text-yellow-600" />,
      free: <DollarSign className="h-4 w-4 text-purple-600" />
    };
    return icons[budget] || <DollarSign className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Utensils className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Dietas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">{filteredDiets.length}</span> dieta{filteredDiets.length !== 1 ? 's' : ''} • Nutrição Inteligente
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateDiet}
                className="group bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Nova Dieta
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Total de Dietas</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{diets.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Ativas</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                      {diets.filter(d => d.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                    <Timer className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Alunos</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                      {new Set(diets.map(d => d.student_id)).size}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">Geradas com IA</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                      {diets.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Glassmorphism Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
                    <Input
                      placeholder="Buscar dietas por nome, descrição ou aluno..."
                      className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {userProfile?.role === 'trainer' && (
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-[280px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Filtrar por Aluno</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                      <SelectItem value="all">Todos os alunos</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {filteredDiets.length === 0 ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <Utensils className="h-20 w-20 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>

                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || selectedStudent !== 'all' ? 'Nenhuma dieta encontrada' : 'Crie sua Primeira Dieta!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || selectedStudent !== 'all'
                      ? "Ajuste os filtros de busca para encontrar a dieta que você procura"
                      : "Use a inteligência artificial para criar dietas personalizadas e alcançar os objetivos dos seus alunos"}
                  </p>

                  <Button
                    onClick={handleCreateDiet}
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    {searchQuery || selectedStudent !== 'all' ? 'Criar Nova Dieta' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiets.map((diet) => (
                <div key={diet.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleViewDiet(diet.id)}>

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                    <CardHeader className="relative pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {diet.student?.avatar_url ? (
                            <img
                              src={diet.student.avatar_url}
                              alt={diet.student.full_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-green-500/20"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {diet.student?.full_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDistanceToNow(new Date(diet.created_at), {
                                locale: ptBR,
                                addSuffix: true
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDiet(diet.id);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar dieta</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloneDiet(diet);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clonar dieta</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDiet(diet.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir dieta</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                        {diet.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {diet.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      {/* Diet Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            {getGoalIcon(diet.goal)}
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                              Objetivo
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                            {getGoalLabel(diet.goal)}
                          </p>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                              Refeições
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                            {diet.meals_per_day} por dia
                          </p>
                        </div>
                      </div>

                      {/* Macros */}
                      {diet.target_calories && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                              Macros Diários
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Calorias:</span>
                              <span className="font-semibold text-purple-800 dark:text-purple-300">
                                {Math.round(diet.target_calories)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Proteína:</span>
                              <span className="font-semibold text-purple-800 dark:text-purple-300">
                                {Math.round(diet.target_protein || 0)}g
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600 rounded-full text-xs font-semibold">
                          {getActivityLabel(diet.activity_level)}
                        </Badge>
                        <Badge className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs">
                          {getBudgetIcon(diet.budget_profile)}
                          <span className="ml-1">{diet.budget_profile === 'economic' ? 'Econômico' : diet.budget_profile === 'intermediate' ? 'Intermediário' : 'Livre'}</span>
                        </Badge>
                        {diet.used_physical_assessment && (
                          <Badge className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300 dark:from-orange-900/30 dark:to-red-900/30 dark:text-orange-300 dark:border-orange-600 rounded-full text-xs font-semibold">
                            Com Avaliação
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredDiets.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <DataPagination
                  page={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  totalPages={pagination.totalPages}
                  onPageChange={changePage}
                  onPageSizeChange={changePageSize}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}