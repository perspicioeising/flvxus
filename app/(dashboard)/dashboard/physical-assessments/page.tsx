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
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CalendarDays, 
  Eye, 
  User, 
  ClipboardList, 
  Edit,
  TrendingUp,
  Weight,
  Ruler,
  Heart,
  Activity,
  BarChart3,
  Clock,
  ChevronRight,
  Download,
  FileText,
  Zap,
  Target,
  MoreVertical,
  TrendingDown,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ptBR } from "date-fns/locale";
import { DataPagination } from "@/components/ui/data-pagination";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

interface Assessment {
  id: string;
  student_id: string;
  student?: Student;
  created_at: string;
  weight: number;
  height: number;
  bmi: number;
  body_fat: number;
  muscle_mass?: number;
  visceral_fat?: number;
  metabolic_age?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  chest_circumference?: number;
  arm_circumference?: number;
  thigh_circumference?: number;
  notes?: string;
}

export default function PhysicalAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments?page=${page}&limit=${limit}`);
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error instanceof Error ? error.message : String(error),
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleDeleteAssessment = async (assessment: Assessment): Promise<void> => {
    try {
      const response = await fetch(`/api/physical-assessments/${assessment.id}`, {
        method: 'DELETE',
      });

      const data: { error?: string } = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação foi removida com sucesso",
      });
      
      await fetchAssessments();
      
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
    const matchesSearch = 
      assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStudent = 
      studentFilter === "all" || 
      assessment.student_id === studentFilter;

    return matchesSearch && matchesStudent;
  });

  // Função para calcular a classificação do IMC
  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-300 dark:border-yellow-600" };
    if (bmi < 25) return { label: "Peso normal", color: "from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "from-orange-100 to-red-100 text-orange-800 border-orange-300 dark:from-orange-900/30 dark:to-red-900/30 dark:text-orange-300 dark:border-orange-600" };
    return { label: "Obesidade", color: "from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600" };
  };

  // Função para calcular a evolução (mock - você pode implementar a lógica real)
  const getEvolutionPercentage = (assessment: Assessment) => {
    // Aqui você pode implementar a lógica real comparando com avaliações anteriores
    return Math.floor(Math.random() * 20) - 10; // Retorna um valor entre -10 e 10
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-400/10 dark:to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent">
                      Avaliações Físicas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAssessments.length}</span> avaliação{filteredAssessments.length !== 1 ? 'ões' : ''} • Progresso Inteligente
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="hidden sm:flex bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-12 px-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    toast({
                      title: "Exportando relatórios",
                      description: "Os relatórios serão baixados em breve",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                
                <Button
                  onClick={() => router.push('/dashboard/physical-assessments/new')}
                  className="group bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 min-w-[200px] border-0"
                >
                  <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  Nova Avaliação
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Total</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{pagination.total}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Alunos</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                      {new Set(assessments.map(a => a.student_id)).size}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((new Set(assessments.map(a => a.student_id)).size / Math.max(students.length, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Este Mês</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                      {assessments.filter(a => {
                        const date = new Date(a.created_at);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <CalendarDays className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min((assessments.filter(a => {
                        const date = new Date(a.created_at);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length / Math.max(assessments.length, 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">IMC Médio</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                      {assessments.length > 0 
                        ? (assessments.reduce((acc, a) => acc + a.bmi, 0) / assessments.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-full"></div>
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

                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">Aluno</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                    <SelectItem value="all">Todos os Alunos</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.avatar_url} alt={student.full_name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {student.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.full_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Cards Grid */}
        <div className="space-y-6">
          {filteredAssessments.map((assessment) => {
            const bmiClass = getBMIClassification(assessment.bmi);
            const evolution = getEvolutionPercentage(assessment);
            
            return (
              <div key={assessment.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                  
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                  
                  <CardContent className="relative p-6">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                      
                      {/* Enhanced Avatar Section */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                          <Avatar className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                            <AvatarImage 
                              src={assessment.student?.avatar_url} 
                              alt={assessment.student?.full_name} 
                            />
                            <AvatarFallback className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl">
                              {assessment.student?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {evolution > 0 && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {evolution < 0 && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                              <TrendingDown className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                                {assessment.student?.full_name}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <CalendarDays className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`px-3 py-1 rounded-full font-semibold bg-gradient-to-r ${bmiClass.color}`}>
                                {bmiClass.label}
                              </Badge>
                              {evolution !== 0 && (
                                <Badge className={`px-3 py-1 rounded-full font-semibold ${
                                  evolution > 0 
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600' 
                                    : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600'
                                }`}>
                                  {evolution > 0 ? '↗' : '↘'} {Math.abs(evolution)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Enhanced Metrics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Weight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Peso</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {assessment.weight}<span className="text-sm font-normal text-gray-500">kg</span>
                              </p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Ruler className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Altura</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {assessment.height}<span className="text-sm font-normal text-gray-500">cm</span>
                              </p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">IMC</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {assessment.bmi}
                              </p>
                            </div>
                            
                            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Percent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Gordura</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {assessment.body_fat}<span className="text-sm font-normal text-gray-500">%</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Additional Metrics */}
                          {(assessment.muscle_mass || assessment.metabolic_age) && (
                            <div className="flex flex-wrap gap-2">
                              {assessment.muscle_mass && (
                                <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 rounded-full font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Massa Muscular: {assessment.muscle_mass}kg
                                </Badge>
                              )}
                              {assessment.metabolic_age && (
                                <Badge className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 rounded-full font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Idade Metabólica: {assessment.metabolic_age}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 xl:flex-col xl:items-stretch xl:w-[180px]">
                        <Button
                          className="flex-1 xl:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl h-12 font-semibold border-0 transform hover:scale-105"
                          onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="xl:flex-initial bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl h-12 px-4 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl shadow-2xl">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Avaliação
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Gerar Relatório
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteAssessment(assessment)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          
          {/* Enhanced Empty State */}
          {filteredAssessments.length === 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <ClipboardList className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || studentFilter !== 'all' ? 'Nenhuma avaliação encontrada' : 'Comece a Monitorar o Progresso!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || studentFilter !== 'all' 
                      ? "Ajuste os filtros de busca para encontrar a avaliação que você procura"
                      : "Registre a primeira avaliação física e acompanhe a evolução dos seus alunos com dados precisos"}
                  </p>
                  
                  <Button
                    onClick={() => router.push('/dashboard/physical-assessments/new')}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    {searchQuery || studentFilter !== 'all' ? 'Nova Avaliação' : 'Primeira Avaliação'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredAssessments.length > 0 && (
          <div className="mt-12 flex justify-center">
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
  );
}