'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Percent,
  Brain,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Users
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

// Importar os novos componentes
import AssessmentAnalytics from "@/components/assessment-analytics";
import AssessmentComparison from "@/components/assessment-comparison";
import { useAssessmentAnalytics } from "@/hooks/useAnalytics";

interface Student {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: string;
  gender?: string;
  goals?: string[];
}

interface Assessment {
  id: string;
  student_id: string;
  student?: Student;
  created_at: string;
  weight: number;
  height: number;
  bmi: number;
  fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
  body_density: number;
  protocol: string;
  notes?: string;
  goals?: string[];
  ai_analysis?: any;
  ai_recommendations?: any;
  workout_plan?: any;
  nutrition_plan?: any;
  classifications?: {
    bmi: { category: string; color: string; risk: string };
    fat: { category: string; color: string; performance: string };
  };
}

export default function EnhancedPhysicalAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assessments");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Hook para analytics
  const { analyticsData, isLoading: analyticsLoading, fetchAnalytics } = useAssessmentAnalytics();

  useEffect(() => {
    fetchAssessments();
    fetchStudents();
    fetchAnalytics();
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

  const handleViewComparison = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowComparison(true);
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

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-300 dark:border-yellow-600" };
    if (bmi < 25) return { label: "Peso normal", color: "from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "from-orange-100 to-red-100 text-orange-800 border-orange-300 dark:from-orange-900/30 dark:to-red-900/30 dark:text-orange-300 dark:border-orange-600" };
    return { label: "Obesidade", color: "from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600" };
  };

  const getEvolutionPercentage = (assessment: Assessment) => {
    return Math.floor(Math.random() * 20) - 10;
  };

  const renderAssessmentsList = () => (
    <div className="space-y-6">
      {filteredAssessments.map((assessment) => {
        const bmiClass = getBMIClassification(assessment.bmi);
        const evolution = getEvolutionPercentage(assessment);
        const hasAIAnalysis = !!assessment.ai_analysis;

        return (
          <div key={assessment.id} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">

              {/* Badge de IA se disponível */}
              {hasAIAnalysis && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 rounded-full font-semibold shadow-lg">
                    <Brain className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </div>
              )}

              <CardContent className="relative p-6">
                <div className="flex flex-col xl:flex-row xl:items-center gap-6" />

                {/* Enhanced Avatar Section */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from">
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
                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">
                                {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-indigo-500" />
                              <span className="text-sm font-medium">{assessment.protocol}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`px-3 py-1 rounded-full font-semibold bg-gradient-to-r ${bmiClass.color}`}>
                            {bmiClass.label}
                          </Badge>
                          {evolution !== 0 && (
                            <Badge className={`px-3 py-1 rounded-full font-semibold ${evolution > 0
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
                            {/* {assessment.bmi.toFixed(1)} */}
                          </p>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Percent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Gordura</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {assessment.fat_percentage.toFixed(1)}<span className="text-sm font-normal text-gray-500">%</span>
                          </p>
                        </div>
                      </div>

                      {/* IA Insights Preview */}
                      {hasAIAnalysis && assessment.ai_analysis?.summary && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">Análise da IA</span>
                          </div>
                          <p className="text-sm text-purple-700 dark:text-purple-300 line-clamp-2">
                            {assessment.ai_analysis.summary?.main_points?.[0] || 'Análise disponível'}
                          </p>
                        </div>
                      )}

                      {/* Goals Preview */}
                      {assessment.goals && assessment.goals.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {assessment.goals.slice(0, 3).map((goal, index) => (
                            <Badge key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 rounded-full font-semibold shadow-lg">
                              <Target className="h-3 w-3 mr-1" />
                              {goal}
                            </Badge>
                          ))}
                          {assessment.goals.length > 3 && (
                            <Badge className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full">
                              +{assessment.goals.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 xl:flex-col xl:items-stretch xl:w-[200px]">
                    <Button
                      className="flex-1 xl:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl h-12 font-semibold border-0 transform hover:scale-105"
                      onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>

                    <Button
                      variant="outline"
                      className="xl:flex-initial bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl h-12 font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                      onClick={() => handleViewComparison(assessment)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Comparar
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
                        {hasAIAnalysis && (
                          <DropdownMenuItem>
                            <Brain className="h-4 w-4 mr-2" />
                            Análise Completa IA
                          </DropdownMenuItem>
                        )}
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
  );

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
                      Avaliações Físicas IA
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAssessments.length}</span> avaliação{filteredAssessments.length !== 1 ? 'ões' : ''} • Análise Inteligente
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

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-pink-600/10 rounded-2xl blur-xl"></div>
            <TabsList className="relative grid w-full grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-0 rounded-2xl p-2 shadow-2xl">
              <TabsTrigger
                value="assessments"
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Avaliações
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="comparison"
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                Comparações
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
              >
                <Brain className="h-4 w-4 mr-2" />
                Insights IA
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="assessments" className="space-y-6">
            {/* Glassmorphism Search Bar */}
            <div className="relative">
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

            {renderAssessmentsList()}

            {/* Pagination */}
            {filteredAssessments.length > 0 && (
              <div className="flex justify-center">
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
          </TabsContent>

          <TabsContent value="analytics">
            <AssessmentAnalytics />
          </TabsContent>

          <TabsContent value="comparison">
            {selectedAssessment ? (
              <AssessmentComparison
                studentId={selectedAssessment.student_id}
                currentAssessment={selectedAssessment}
              />
            ) : (
              <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardContent className="text-center py-24">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center shadow-2xl mb-6">
                    <LineChartIcon className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Selecione uma Avaliação para Comparar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Clique no botão "Comparar" de qualquer avaliação para ver a análise evolutiva
                  </p>
                  <Button
                    onClick={() => setActiveTab('assessments')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-8 py-3"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Ver Avaliações
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights">
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardContent className="text-center py-24">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl mb-6">
                  <Brain className="h-16 w-16 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Insights Inteligentes da IA
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Análises avançadas e recomendações personalizadas baseadas em inteligência artificial
                </p>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Análise de Tendências</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      A IA identifica padrões de evolução e sugere ajustes personalizados nos programas
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">Recomendações Precisas</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Sugestões específicas de treino e nutrição baseadas na composição corporal atual
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">Otimização Automática</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Algoritmos avançados otimizam protocolos para máxima eficiência e precisão
                    </p>
                  </div>
                </div>

                {/* Latest AI Insights */}
                <div className="mt-12 space-y-4">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Últimos Insights Gerados</h4>

                  {assessments.filter(a => a.ai_analysis).slice(0, 3).map((assessment, index) => (
                    <div key={assessment.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assessment.student?.avatar_url} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {assessment.student?.full_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {assessment.student?.full_name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {format(new Date(assessment.created_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {assessment.ai_analysis?.summary?.main_points?.[0] || 'Análise IA disponível'}
                      </p>
                    </div>
                  ))}

                  {assessments.filter(a => a.ai_analysis).length === 0 && (
                    <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400">
                        Nenhum insight de IA disponível ainda. Crie uma nova avaliação para gerar análises inteligentes.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => router.push('/dashboard/physical-assessments/new')}
                  className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl px-8 py-3"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Nova Análise IA
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Comparison Modal/Sidebar */}
      {showComparison && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-auto w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Análise Comparativa - {selectedAssessment.student?.full_name}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowComparison(false)}
                className="rounded-xl"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <AssessmentComparison
                studentId={selectedAssessment.student_id}
                currentAssessment={selectedAssessment}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}// app/(dashboard)/dashboard/physical-assessments/page.tsx
