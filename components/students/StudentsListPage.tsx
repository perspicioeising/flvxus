'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, User, Zap, X, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import dos componentes
import { StudentsHeader } from './components/StudentsHeader';
import { StudentsStats } from './components/StudentsStats';
import { StudentCard } from './components/StudentCard';
import { StudentsEmptyState } from './components/StudentsEmptyState';
import { StudentsLoadingSkeleton } from './components/StudentsLoadingSkeleton';
import { Student } from '@/types/student';


interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function StudentsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false
  });

  // Fetch students with pagination
  const fetchStudents = useCallback(async (page = 1, limit = 10, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/students?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (append) {
        setStudents(prev => [...prev, ...data.students]);
      } else {
        setStudents(data.students);
      }
      
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasMore: data.pagination.page < data.pagination.totalPages
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, statusFilter, toast]);

  // Load more students
  const loadMore = () => {
    if (!isLoadingMore && pagination.hasMore) {
      fetchStudents(pagination.page + 1, pagination.limit, true);
    }
  };

  // Reset and fetch
  const resetAndFetch = useCallback(() => {
    fetchStudents(1, pagination.limit, false);
  }, [fetchStudents, pagination.limit]);

  // Effects
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      resetAndFetch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, statusFilter, resetAndFetch]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  // Filtered students (for display)
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden">
      
   

      <div className="relative container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <StudentsHeader 
          studentsCount={filteredStudents.length}
          onNewStudent={() => router.push('/dashboard/students/new')}
        />

        {/* Stats - Only show if we have students */}
        {!isLoading && students.length > 0 && (
          <StudentsStats students={students} />
        )}

        {/* Search and Filters */}
        {/* Search and Filters */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-2xl blur-md"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="p-3 sm:p-6">
              {/* Mobile: Layout em Stack */}
              <div className="lg:hidden">
                {/* Campo de Busca - Mobile */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400 z-10" />
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
                           statusFilter === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Adicione mais filtros se necessário - exemplo: experiência */}
                  <Select value="all">
                    <SelectTrigger className="flex-1 h-10 bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg shadow-md backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium truncate">
                          Nível
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
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
                        {searchQuery && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        {statusFilter !== 'all' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Layout Inline - Tudo na mesma linha */}
              <div className="hidden lg:flex lg:items-center lg:gap-4">

                {/* Campo de Busca - Desktop (flexível) */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400 z-10" />
                  <Input
                    placeholder="Buscar por aluno ou email..."
                    className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filtro de Status - Desktop (largura fixa) */}
                <div className="shrink-0">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
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

                {/* Filtro de Nível - Desktop (largura fixa) */}
                <div className="shrink-0">
                  <Select value="all">
                    <SelectTrigger className="w-[180px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold">Nível</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-md">
                      <SelectItem value="all">Todos os Níveis</SelectItem>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
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

        {/* Content */}
        {isLoading ? (
          <StudentsLoadingSkeleton />
        ) : filteredStudents.length === 0 ? (
          <StudentsEmptyState 
            hasFilters={searchQuery !== '' || statusFilter !== 'all'}
            onNewStudent={() => router.push('/dashboard/students/new')}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            {/* Students Grid */}
            <div className="space-y-4 mb-8">
              {filteredStudents.map((student) => (
                <StudentCard 
                  key={student.id} 
                  student={student}
                  onViewProfile={(id: any) => router.push(`/dashboard/students/${id}`)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl"></div>
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-5 w-5 mr-2" />
                        Carregar mais alunos
                        <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                          +{Math.min(pagination.limit, pagination.total - filteredStudents.length)}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredStudents.length}</span> de{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> alunos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}