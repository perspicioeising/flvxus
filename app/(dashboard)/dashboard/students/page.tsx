'use client';

import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, Key, ReactPortal } from "react";
import Link from "next/link";
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
import { Plus, Search, Filter, User, Phone, Mail, CalendarDays, Eye, MoreVertical, Clock, Target, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { ptBR } from "date-fns/locale";
import { DataPagination } from "@/components/ui/data-pagination";

export default function StudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchStudents = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const response = await fetch(`/api/students?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (page: number) => {
    fetchStudents(page, pagination.limit);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchStudents(1, pageSize);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
          Ativo
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700">
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></div>
        Inativo
      </Badge>
    );
  };

  type ExperienceLevel = 'iniciante' | 'intermediário' | 'avançado' | string;

  const getExperienceBadge = (level: ExperienceLevel) => {
    const configs: Record<'iniciante' | 'intermediário' | 'avançado', { bg: string; text: string; border: string }> = {
      'iniciante': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      'intermediário': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
      'avançado': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' }
    };
    const config = configs[level as keyof typeof configs] || configs['iniciante'];
    
    return (
      <Badge className={`${config.bg} ${config.text} ${config.border} capitalize`}>
        {level}
      </Badge>
    );
  };

   if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
              Carregando alunos...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Preparando sua dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50/40 to-primary-100 dark:from-primary-950 dark:via-primary-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                      Meus Alunos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">{filteredStudents.length}</span> aluno{filteredStudents.length !== 1 ? 's' : ''} • Dashboard Inteligente
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push('/dashboard/students/new')}
                className="group bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 min-w-[200px] border-0"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Adicionar Aluno
              </Button>
            </div>
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
                      placeholder="Buscar alunos por nome, email ou telefone..."
                      className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">Status</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Cards Grid */}
        <div className="space-y-6">
          {filteredStudents.map((student, index) => (
            <div key={student.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                
                <CardContent className="relative p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                    
                    {/* Enhanced Avatar Section */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <Avatar className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl">
                          <AvatarImage alt={student.full_name} />
                          <AvatarFallback className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl">
                            {student.full_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {student.status === 'active' && (
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                              {student.full_name}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Mail className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">{student.email}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={`px-3 py-1 rounded-full font-semibold ${
                              student.status === 'active' 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600' 
                                : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-300 dark:from-gray-800/30 dark:to-slate-800/30 dark:text-gray-400 dark:border-gray-600'
                            }`}>
                              {student.status === 'active' ? '✦ Ativo' : '○ Inativo'}
                            </Badge>
                            {student.experience_level && (
                              <Badge className={`px-3 py-1 rounded-full font-semibold capitalize ${
                                student.experience_level === 'iniciante' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-600' :
                                student.experience_level === 'intermediário' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-300 dark:border-yellow-600' :
                                'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 dark:border-purple-600'
                              }`}>
                                {student.experience_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {student.phone && (
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-gray-700 dark:text-gray-200">{student.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                            <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              Desde {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Goals Section */}
                        {student.goals && student.goals.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <span className="font-bold text-gray-800 dark:text-gray-200">Objetivos de Treino:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {student.goals.map((goal: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, goalIndex: Key | null | undefined) => (
                                <Badge 
                                  key={goalIndex}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-full font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                                >
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 xl:flex-col xl:items-stretch xl:w-[180px]">
                      <Button 
                        className="flex-1 xl:flex-initial bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-green-500/25 transition-all duration-300 rounded-xl h-12 font-semibold border-0 transform hover:scale-105"
                        onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="xl:flex-initial bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl h-12 px-4 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Enhanced Empty State */}
          {filteredStudents.length === 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <User className="h-20 w-20 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || statusFilter !== 'all' ? 'Nenhum aluno encontrado' : 'Transforme Vidas!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || statusFilter !== 'all'
                      ? "Ajuste os filtros de busca para encontrar o aluno que você procura"
                      : "Comece sua jornada como personal trainer adicionando seu primeiro aluno e transformando vidas através do fitness"}
                  </p>
                  
                  <Button
                    onClick={() => router.push('/dashboard/students/new')}
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" /> 
                    {searchQuery || statusFilter !== 'all' ? 'Adicionar Aluno' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
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
        
        {/* Advanced Stats Dashboard */}
        {filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Total</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{students.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Ativos</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{students.filter(s => s.status === 'active').length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(students.filter(s => s.status === 'active').length / students.length) * 100}%` }}
                    ></div>
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
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Novos</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {students.filter(s => {
                          const createdDate = new Date(s.created_at);
                          const currentDate = new Date();
                          return createdDate.getMonth() === currentDate.getMonth() && 
                                 createdDate.getFullYear() === currentDate.getFullYear();
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
                        width: `${Math.min((students.filter(s => {
                          const createdDate = new Date(s.created_at);
                          const currentDate = new Date();
                          return createdDate.getMonth() === currentDate.getMonth() && 
                                 createdDate.getFullYear() === currentDate.getFullYear();
                        }).length / Math.max(students.length, 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}