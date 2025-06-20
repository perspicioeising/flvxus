'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, User, Zap, X, Loader2, ChevronDown, Users, Calendar } from "lucide-react";
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
  const [experienceFilter, setExperienceFilter] = useState("all");
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

  // Check if has active filters
  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== 'all' || experienceFilter !== 'all';
  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'all',
    experienceFilter !== 'all'
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setExperienceFilter('all');
  };

  // Fetch students with pagination
  const fetchStudents = useCallback(async (page = 1, limit = 10, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/students?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter}&experience=${experienceFilter}`);
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
  }, [searchQuery, statusFilter, experienceFilter, toast]);

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
  }, [searchQuery, statusFilter, experienceFilter, resetAndFetch]);

  // Filtered students (for display)
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    const matchesExperience =
      experienceFilter === "all" || student.experience_level === experienceFilter;

    return matchesSearch && matchesStatus && matchesExperience;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden">
      <div className="relative container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <StudentsHeader 
          studentsCount={filteredStudents.length}
          onNewStudent={() => router.push('/dashboard/students/new')}
        />

        {/* Filters Section - Estilo das Avaliações Físicas */}
        <div className="mb-6 space-y-4">
          {/* Desktop: Search + Filters na mesma linha */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Search Bar - Desktop (flexível) */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl blur-lg"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  placeholder="Buscar por nome do aluno, email..."
                  className="pl-12 h-14 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Desktop - mesma linha */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Status Filter */}
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className={`
                  w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
                  ${statusFilter !== 'all' 
                    ? 'bg-green-50 border-green-200 shadow-md dark:bg-green-900/20 dark:border-green-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                  }
                `}>
                  <Users className={`h-6 w-6 ${statusFilter !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Todos os Status
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="focus:bg-green-50 dark:focus:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Ativo
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Inativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Experience Filter */}
              <Select 
                value={experienceFilter} 
                onValueChange={setExperienceFilter}
              >
                <SelectTrigger className={`
                  w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center
                  ${experienceFilter !== 'all' 
                    ? 'bg-purple-50 border-purple-200 shadow-md dark:bg-purple-900/20 dark:border-purple-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                  }
                `}>
                  <User className={`h-6 w-6 ${experienceFilter !== 'all' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Todos os Níveis
                    </div>
                  </SelectItem>
                  <SelectItem value="beginner" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Iniciante
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Intermediário
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Avançado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear All Button Desktop */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-14 px-4 rounded-2xl border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 group"
                >
                  <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Mobile: Layout melhorado */}
          <div className="lg:hidden">
            {/* Search Bar - Mobile */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl blur-lg"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  placeholder="Buscar aluno..."
                  className="pl-12 h-12 text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Row - Mobile - Grid layout */}
            <div className="grid grid-cols-4 gap-3">
              {/* Status Filter - Expandido */}
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className={`
                  col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
                  ${statusFilter !== 'all' 
                    ? 'bg-green-50 border-green-200 shadow-md dark:bg-green-900/20 dark:border-green-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
                  }
                `}>
                  <div className="flex flex-col items-center gap-1">
                    <Users className={`h-5 w-5 ${statusFilter !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    {statusFilter !== 'all' && (
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="focus:bg-green-50 dark:focus:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Ativo
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Inativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Experience Filter - Expandido */}
              <Select 
                value={experienceFilter} 
                onValueChange={setExperienceFilter}
              >
                <SelectTrigger className={`
                  col-span-1 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center p-0
                  ${experienceFilter !== 'all' 
                    ? 'bg-purple-50 border-purple-200 shadow-md dark:bg-purple-900/20 dark:border-purple-700' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700'
                  }
                `}>
                  <div className="flex flex-col items-center gap-1">
                    <User className={`h-5 w-5 ${experienceFilter !== 'all' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    {experienceFilter !== 'all' && (
                      <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="focus:bg-gray-50 dark:focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Todos
                    </div>
                  </SelectItem>
                  <SelectItem value="beginner" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Iniciante
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Intermediário
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced" className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Avançado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Status Badge - Expandido */}
              {hasActiveFilters ? (
                <div className="col-span-1 h-14 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{activeFiltersCount}</span>
                  </div>
                </div>
              ) : (
                <div className="col-span-1 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              )}

              {/* Clear Button - Expandido */}
              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="col-span-1 h-14 rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-all duration-200 group flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <X className="h-4 w-4 text-red-600 dark:text-red-400 group-hover:rotate-90 transition-transform duration-200" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Limpar</span>
                  </div>
                </Button>
              ) : (
                <div className="col-span-1 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <X className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Limpar</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm dark:bg-blue-900/20 dark:text-blue-300">
                  <Users className="h-3 w-3" />
                  <span>"{searchQuery}"</span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {statusFilter !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm dark:bg-green-900/20 dark:text-green-300">
                  <Users className="h-3 w-3" />
                  <span>{statusFilter === 'active' ? 'Ativo' : 'Inativo'}</span>
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {experienceFilter !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm dark:bg-purple-900/20 dark:text-purple-300">
                  <User className="h-3 w-3" />
                  <span className="capitalize">{experienceFilter}</span>
                  <button 
                    onClick={() => setExperienceFilter('all')}
                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <StudentsLoadingSkeleton />
        ) : filteredStudents.length === 0 ? (
          <StudentsEmptyState 
            hasFilters={hasActiveFilters}
            onNewStudent={() => router.push('/dashboard/students/new')}
            onClearFilters={clearAllFilters}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl"></div>
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
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
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
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