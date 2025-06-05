'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Camera, ArrowRight, Trash2, CalendarDays, Eye, User, Filter, TrendingUp, Users, Image, Grid, LayoutList, Zap, Target, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ptBR } from "date-fns/locale";
import { DataPagination } from "@/components/ui/data-pagination";

export default function PostureAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchAssessments();
    fetchStudents();
  }, []);

  const fetchAssessments = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const response = await fetch(`/api/posture-assessments?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessments(data.assessments || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    }
  };

  type Assessment = {
    id: string;
    student_id: string;
    student?: {
      full_name: string;
      id: string;
    };
    created_at: string;
    front_image_url?: string;
    side_image_url?: string;
    back_image_url?: string;
    // add other fields as needed
  };

  type Student = {
    id: string;
    full_name: string;
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/posture-assessments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação postural foi removida",
      });
      
      fetchAssessments();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar avaliação",
        description: error.message,
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchAssessments(page, pagination.limit);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchAssessments(1, pageSize);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStudent = studentFilter === "all" || assessment.student_id === studentFilter;
    return matchesSearch && matchesStudent;
  });

  // Calcular estatísticas
  const totalAssessments = assessments.length;
  const totalStudents = new Set(assessments.map(a => a.student_id)).size;
  const recentAssessments = assessments.filter(a => {
    const assessmentDate = new Date(a.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return assessmentDate >= thirtyDaysAgo;
  }).length;

  const assessmentsWithPhotos = assessments.filter(a => 
    a.front_image_url || a.side_image_url || a.back_image_url
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Avaliações Posturais
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAssessments.length}</span> avaliação{filteredAssessments.length !== 1 ? 'ões' : ''} • Análise Avançada
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push('/dashboard/posture-assessments/new')}
                className="group bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600 hover:from-blue-700 hover:via-purple-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Nova Avaliação
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {filteredAssessments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Total</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{totalAssessments}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Alunos</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{totalStudents}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((totalStudents / Math.max(students.length, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">30 Dias</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{recentAssessments}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <CalendarDays className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((recentAssessments / Math.max(totalAssessments, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">Com Fotos</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{assessmentsWithPhotos}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                      <Image className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((assessmentsWithPhotos / Math.max(totalAssessments, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Glassmorphism Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <Input
                      placeholder="Buscar avaliações por nome do aluno..."
                      className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">Filtrar Aluno</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                      <SelectItem value="all">Todos os alunos</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>{student.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 shadow-lg backdrop-blur-sm">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-10 w-10 rounded-lg"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {filteredAssessments.length === 0 ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <Camera className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>

                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || studentFilter !== 'all' ? 'Nenhuma avaliação encontrada' : 'Comece Suas Avaliações!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || studentFilter !== 'all'
                      ? "Ajuste os filtros de busca para encontrar a avaliação que você procura"
                      : "Inicie sua primeira avaliação postural para acompanhar a evolução da postura dos seus alunos"}
                  </p>

                  <Button
                    onClick={() => router.push('/dashboard/posture-assessments/new')}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    {searchQuery || studentFilter !== 'all' ? 'Nova Avaliação' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssessments.map((assessment, index) => (
                <div key={assessment.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] cursor-pointer"
                        onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}>

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
                      {assessment.front_image_url || assessment.side_image_url || assessment.back_image_url ? (
                        <img
                          src={assessment.front_image_url || assessment.side_image_url || assessment.back_image_url}
                          alt={`Avaliação de ${assessment.student?.full_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm">
                            <Camera className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/posture-assessments/${assessment.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(assessment.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir avaliação</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <CardContent className="relative p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-lg" />
                          <Avatar className="relative h-12 w-12 border-2 border-white/50 shadow-lg">
                            <AvatarImage alt={assessment.student?.full_name} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                              {assessment.student?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent truncate">
                            {assessment.student?.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                            <CalendarDays className="h-4 w-4" />
                            <span>{format(new Date(assessment.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Photos */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-2">
                          Fotos Capturadas
                        </div>
                        <div className="flex gap-2">
                          {[
                            { key: 'front_image_url', label: 'Frente', color: 'bg-blue-500' },
                            { key: 'side_image_url', label: 'Lado', color: 'bg-purple-500' },
                            { key: 'back_image_url', label: 'Costas', color: 'bg-pink-500' }
                          ].map(({ key, label, color }) => 
                            assessment[key as keyof Assessment] ? (
                              <Badge 
                                key={key}
                                className={`${color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-xs`}
                              >
                                {label}
                              </Badge>
                            ) : (
                              <Badge 
                                key={key}
                                className="bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-0 text-xs"
                              >
                                {label}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
                        onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}>

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                    <CardContent className="relative p-6">
                      <div className="flex items-center gap-6">
                        {/* Image thumbnail */}
                        <div className="w-40 h-24 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
                          {assessment.front_image_url || assessment.side_image_url || assessment.back_image_url ? (
                            <img
                              src={assessment.front_image_url || assessment.side_image_url || assessment.back_image_url}
                              alt={`Avaliação de ${assessment.student?.full_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm">
                                <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-lg" />
                              <Avatar className="relative h-14 w-14 border-2 border-white/50 shadow-lg">
                                <AvatarImage alt={assessment.student?.full_name} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
                                  {assessment.student?.full_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                {assessment.student?.full_name}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Photos */}
                            <div className="space-y-2">
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                                Fotos Capturadas
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { key: 'front_image_url', label: 'Frente', color: 'bg-blue-500' },
                                  { key: 'side_image_url', label: 'Lado', color: 'bg-purple-500' },
                                  { key: 'back_image_url', label: 'Costas', color: 'bg-pink-500' }
                                ].map(({ key, label, color }) => 
                                  assessment[key as keyof Assessment] ? (
                                    <Badge 
                                      key={key}
                                      className={`${color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-xs`}
                                    >
                                      {label}
                                    </Badge>
                                  ) : (
                                    <Badge 
                                      key={key}
                                      className="bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border-0 text-xs"
                                    >
                                      {label}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Additional info */}
                            <div className="space-y-2">
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                                Informações
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <Target className="h-4 w-4" />
                                  <span className="font-semibold">Análise Completa</span>
                                </div>
                                {(assessment.front_image_url && assessment.side_image_url && assessment.back_image_url) && (
                                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Image className="h-4 w-4" />
                                    <span className="font-semibold">Todas as vistas</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/posture-assessments/${assessment.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes completos</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(assessment.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir avaliação</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredAssessments.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
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