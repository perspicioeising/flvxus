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
import { Plus, Search, Filter, User, Phone, Mail, CalendarDays, Eye, MoreVertical, Clock, Target, TrendingUp, Zap, X } from "lucide-react";
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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Main loading screen
  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Header Skeleton */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                    <div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-2" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
                    </div>
                  </div>
                </div>
                <div className="w-32 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Statistics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    <div className="text-left">
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
              <CardContent className="p-6">
                {/* Filters Skeleton */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                  <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                  <div className="w-full lg:w-[220px] h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                </div>

                {/* Loading Skeleton */}
                <LoadingSkeleton />
              </CardContent>
            </Card>
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
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              {/* Header com ícone e título */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Ícone com badge */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                    <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                </div>

                {/* Textos */}
                <div className="min-w-0 space-y-1 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                    Alunos
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base leading-tight">
                    <span className="font-semibold text-green-600 dark:text-green-400">{filteredStudents.length}</span> aluno{filteredStudents.length !== 1 ? 's' : ''}
                    <span className="hidden sm:inline"> • Dashboard Inteligente</span>
                  </p>
                </div>
              </div>

              {/* Botão Mobile/Desktop Otimizado - Quadrado no canto direito */}
              <div className="relative shrink-0">
                {/* Efeito de glow no fundo */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-md opacity-75 animate-pulse"></div>

                <Button
                  onClick={() => router.push('/dashboard/students/new')}
                  size="icon"
                  className="relative h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 dark:from-green-500 dark:via-emerald-500 dark:to-teal-500 dark:hover:from-green-600 dark:hover:via-emerald-600 dark:hover:to-teal-600 border-0 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:rotate-90 transition-transform duration-300" />

                  {/* Tooltip para desktop */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    Novo Aluno
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>

                  <span className="sr-only">Novo Aluno</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8">
            {[
              {
                value: students.length,
                label: "Total de Alunos",
                color: "from-green-600 to-emerald-600",
                icon: User,
                progress: 100,
                shortLabel: true,
                suffix: students.length === 1 ? " aluno" : " alunos"
              },
              {
                value: students.filter(s => s.status === 'active').length,
                label: "Alunos Ativos",
                color: "from-blue-600 to-cyan-600",
                icon: TrendingUp,
                progress: students.length > 0 ? (students.filter(s => s.status === 'active').length / students.length) * 100 : 0,
                shortLabel: true,
                suffix: students.filter(s => s.status === 'active').length === 1 ? " ativo" : " ativos"
              },
              {
                value: students.filter(s => {
                  const createdDate = new Date(s.created_at);
                  const currentDate = new Date();
                  return createdDate.getMonth() === currentDate.getMonth() &&
                    createdDate.getFullYear() === currentDate.getFullYear();
                }).length,
                label: "Novos Este Mês",
                color: "from-purple-600 to-pink-600",
                icon: CalendarDays,
                progress: students.length > 0 ? Math.min((students.filter(s => {
                  const createdDate = new Date(s.created_at);
                  const currentDate = new Date();
                  return createdDate.getMonth() === currentDate.getMonth() &&
                    createdDate.getFullYear() === currentDate.getFullYear();
                }).length / students.length) * 100, 100) : 0,
                shortLabel: false,
                suffix: (() => {
                  const newCount = students.filter(s => {
                    const createdDate = new Date(s.created_at);
                    const currentDate = new Date();
                    return createdDate.getMonth() === currentDate.getMonth() &&
                      createdDate.getFullYear() === currentDate.getFullYear();
                  }).length;
                  return newCount === 1 ? " novo" : " novos";
                })()
              }
            ].map((metric, index) => {
              const Icon = metric.icon;

              return (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] h-full flex flex-col">
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

                    <CardContent className="relative p-3 sm:p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider truncate ${metric.color.includes('green') ? 'text-green-600 dark:text-green-400' :
                            metric.color.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                              metric.color.includes('purple') ? 'text-purple-600 dark:text-purple-400' :
                                'text-gray-600 dark:text-gray-400'
                            }`}>
                            {metric.shortLabel ? metric.label.split(' ')[0] : metric.label}
                          </p>
                        </div>
                        <div className={`p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-xl shadow-lg flex-shrink-0`}>
                          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                          <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                            {metric.value}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {metric.suffix}
                          </p>
                        </div>

                        <div className="h-1 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${Math.min(metric.progress, 100)}%` }}></div>
                        </div>

                        {/* Percentage Label */}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {index === 0 ? 'Base total' :
                              index === 1 ? 'Taxa de atividade' :
                                'Crescimento mensal'}
                          </span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(metric.progress)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Glassmorphism Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-teal-600/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="p-3 sm:p-6">

              {/* Mobile: Layout em Stack */}
              <div className="lg:hidden">
                {/* Campo de Busca - Mobile */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600 dark:text-green-400 z-10" />
                  <Input
                    placeholder="Buscar aluno..."
                    className="pl-10 h-11 text-sm bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filtros - Mobile */}
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium truncate">
                          {statusFilter === 'all' ? 'Status' :
                            statusFilter === 'active' ? 'Ativo' :
                              statusFilter === 'inactive' ? 'Inativo' : 'Status'}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Botão Limpar - Mobile */}
                  {(searchQuery || statusFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-200 shrink-0"
                    >
                      <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  )}
                </div>

                {/* Indicadores Mobile */}
                {(searchQuery || statusFilter !== 'all') && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Filtros ativos
                      </span>
                      <div className="flex gap-1">
                        {searchQuery && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        {statusFilter !== 'all' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Layout Inline - Tudo na mesma linha */}
              <div className="hidden lg:flex lg:items-center lg:gap-4">

                {/* Campo de Busca - Desktop (flexível) */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400 z-10" />
                  <Input
                    placeholder="Buscar alunos por nome, email ou telefone..."
                    className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filtro de Status - Desktop (largura fixa) */}
                <div className="shrink-0">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botão Limpar - Desktop (condicional) */}
                {(searchQuery || statusFilter !== 'all') && (
                  <div className="shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="h-14 px-5 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200 font-semibold text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 group"
                    >
                      <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                      Limpar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Cards Grid */}
        <div className="space-y-4 sm:space-y-6">
  {filteredStudents.map((student) => (
    <div key={student.id} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01]">
        <CardContent className="p-4 sm:p-6">
          
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <Avatar className="w-14 h-14 rounded-2xl shadow-lg">
                  <AvatarImage src={student.avatar_url} alt={student.full_name} />
                  <AvatarFallback className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {student.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {student.full_name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600'
                  }`}>
                    {student.status === 'active' ? '● Ativo' : '○ Inativo'}
                  </Badge>
                  {student.experience_level && (
                    <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 capitalize">
                      {student.experience_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid Mobile */}
            <div className="grid grid-cols-1 gap-3">
              {student.phone && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {student.phone}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Desde {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Goals Mobile */}
            {student.goals && student.goals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Objetivos:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.slice(0, 3).map((goal: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, goalIndex: Key | null | undefined) => (
                    <Badge
                      key={goalIndex}
                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-full text-xs font-medium"
                    >
                      {goal}
                    </Badge>
                  ))}
                  {student.goals.length > 3 && (
                    <Badge className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 rounded-full text-xs font-medium">
                      +{student.goals.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions Mobile */}
            <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                onClick={() => router.push(`/dashboard/students/${student.id}`)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300 rounded-xl font-medium border-0 h-11"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="text-sm">Ver Perfil</span>
              </Button>
              <Button
                variant="outline"
                className="px-4 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-11"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {/* Student Info - Desktop */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <Avatar className="w-16 h-16 rounded-3xl shadow-lg">
                  <AvatarImage src={student.avatar_url} alt={student.full_name} />
                  <AvatarFallback className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center text-white font-black text-xl">
                    {student.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {student.status === 'active' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {student.full_name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {student.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600'
                  }`}>
                    {student.status === 'active' ? '● Ativo' : '○ Inativo'}
                  </Badge>
                  {student.experience_level && (
                    <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 capitalize">
                      {student.experience_level}
                    </Badge>
                  )}
                  <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600">
                    Desde {format(new Date(student.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Info Cards - Desktop */}
            <div className="grid grid-cols-2 gap-3 w-80">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                      Telefone
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {student.phone || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">
                      Objetivos
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {student.goals?.length || 0} definidos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Desktop */}
            <div className="flex gap-3 flex-col w-36">
              <Button
                onClick={() => router.push(`/dashboard/students/${student.id}`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-green-500/25 transition-all duration-300 rounded-xl font-semibold border-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
              <Button
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MoreVertical className="h-4 w-4 mr-2" />
                Opções
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ))}

  {/* Empty State Melhorado */}
  {filteredStudents.length === 0 && (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-teal-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-2xl">
              <User className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Nenhum aluno encontrado'
              : 'Transforme Vidas!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {searchQuery || statusFilter !== 'all'
              ? "Ajuste os filtros de busca para encontrar o aluno que você procura"
              : "Comece sua jornada como personal trainer adicionando seu primeiro aluno e transformando vidas através do fitness"}
          </p>

          <Button
            onClick={() => router.push('/dashboard/students/new')}
            className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0"
          >
            <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            {searchQuery || statusFilter !== 'all'
              ? 'Adicionar Aluno'
              : 'Começar Agora'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )}
</div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="mt-8 sm:mt-12 flex justify-center">
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