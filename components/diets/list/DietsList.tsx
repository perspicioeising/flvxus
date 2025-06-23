// /components/diets/components/list/DietsPage.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/components/diets/hooks/use-debounce';

import { DietsHeader } from './DietsHeader';
import { DietsFilters } from './DietsFilters';
import { DietCard } from './DietCard';
import { DietsEmptyState } from './DietsEmptyState';
import { DietsLoadMore } from './DietsLoadMore';
import { DietsPaginationInfo } from './DietsPaginationInfo';
import { DietsListSkeleton } from './DietsListSkeleton';

import type { Diet, DietStatistics } from '../types';
import { DEFAULT_PAGINATION } from '../constants';

export function DietsPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  
  // State
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [hasMoreDiets, setHasMoreDiets] = useState(false);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    searchQuery !== '' || statusFilter !== 'all' || goalFilter !== 'all'
  , [searchQuery, statusFilter, goalFilter]);

  const filteredDiets = useMemo(() => {
    let filtered = [...diets];

    // Search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(diet =>
        diet.name.toLowerCase().includes(query) ||
        diet.description?.toLowerCase().includes(query) ||
        diet.student?.full_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(diet => diet.status === statusFilter);
    }

    // Goal filter
    if (goalFilter !== 'all') {
      filtered = filtered.filter(diet => diet.goal === goalFilter);
    }

    return filtered;
  }, [diets, debouncedSearchQuery, statusFilter, goalFilter]);

  const stats: DietStatistics = useMemo(() => {
    return {
      total: diets.length,
      active: diets.filter(d => d.status === 'active').length,
      completed: diets.filter(d => d.status === 'completed').length,
      draft: diets.filter(d => d.status === 'draft').length,
      students: new Set(diets.map(d => d.student_id)).size,
      aiGenerated: diets.length
    };
  }, [diets]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: error.message
      });
    }
  }, [supabase, toast]);

  // Fetch diets using your API
  const fetchDiets = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/diets?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dietas');
      }

      const data = await response.json();

      if (data.diets && Array.isArray(data.diets)) {
        if (pagination.page === 1) {
          setDiets(data.diets);
        } else {
          setDiets(prev => [...prev, ...data.diets]);
        }
        
        // Update pagination info
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || data.diets.length,
          totalPages: data.pagination?.totalPages || 1
        }));

        // Check if has more
        setHasMoreDiets(data.diets.length === pagination.limit && diets.length + data.diets.length < (data.pagination?.total || data.diets.length));
      } else {
        setDiets([]);
        setHasMoreDiets(false);
      }

    } catch (error: any) {
      console.error('Error fetching diets:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dietas",
        description: error.message
      });
      setDiets([]);
      setHasMoreDiets(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [pagination.page, pagination.limit, toast, diets.length]);

  // Load more function
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMoreDiets) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [loading, hasMoreDiets]);

  // Handle filter changes
  const handleFiltersChange = useCallback((
    newSearchQuery: string, 
    newStatusFilter: string, 
    newGoalFilter: string
  ) => {
    setSearchQuery(newSearchQuery);
    setStatusFilter(newStatusFilter);
    setGoalFilter(newGoalFilter);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    setDiets([]);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setGoalFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
    setDiets([]);
  }, []);

  const handleDeleteDiet = useCallback(async (diet: Diet) => {
    if (!confirm("Tem certeza que deseja excluir esta dieta?")) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/diets?id=${diet.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir dieta');
      }

      setDiets(prev => prev.filter(d => d.id !== diet.id));

      toast({
        title: "Dieta excluída com sucesso!",
        description: "A dieta foi removida permanentemente"
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir dieta",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Effects
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchDiets();
    }
  }, [userProfile, pagination.page]);

  // Refetch when filters change
  useEffect(() => {
    if (userProfile && (searchQuery !== '' || statusFilter !== 'all' || goalFilter !== 'all')) {
      fetchDiets();
    }
  }, [userProfile, searchQuery, statusFilter, goalFilter]);

  // Event handlers
  const handleCreateNew = () => {
    router.push('/dashboard/diets/new');
  };

  const handleViewDiet = (id: string) => {
    router.push(`/dashboard/diets/${id}`);
  };

  const handleEditDiet = (id: string) => {
    router.push(`/dashboard/diets/${id}/edit`);
  };

  const handleCloneDiet = (diet: Diet) => {
    router.push(`/dashboard/diets/new?clone=${diet.id}`);
  };

  // Loading state
  if (initialLoading) {
    return <DietsListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <DietsHeader
          userRole={userProfile?.role || 'student'}
          stats={stats}
          onCreateNew={handleCreateNew}
        />

        {/* Filters */}
        <DietsFilters
          onFiltersChange={handleFiltersChange}
          viewMode="list"
        />

        {/* Content */}
        <div className="space-y-6">
          {filteredDiets.length === 0 && !loading ? (
            <DietsEmptyState
              hasFilters={hasActiveFilters}
              onCreateNew={handleCreateNew}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredDiets.length > 0 && (
                <>
                  {/* Lista de dietas - Grid similar aos planos de treino */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDiets.map((diet, index) => (
                      <div
                        key={diet.id}
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <DietCard
                          diet={diet}
                          onView={handleViewDiet}
                          onEdit={handleEditDiet}
                          onClone={handleCloneDiet}
                          onDelete={handleDeleteDiet}
                          viewMode="grid"
                          isLoading={loading}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Loading indicator */}
                  {loading && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Carregando mais dietas...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botão Carregar Mais */}
                  <div className="mt-8">
                    <DietsLoadMore
                      isLoading={loading}
                      hasMore={hasMoreDiets}
                      totalLoaded={filteredDiets.length}
                      totalAvailable={pagination.total}
                      itemsPerPage={pagination.limit}
                      onLoadMore={handleLoadMore}
                    />
                  </div>

                  {/* Informações de Paginação */}
                  <DietsPaginationInfo
                    currentCount={filteredDiets.length}
                    totalCount={pagination.total}
                  />

                  {/* Indicador de fim da lista */}
                  {!hasMoreDiets && filteredDiets.length > 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                          Todas as dietas foram carregadas
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* CSS para animações */}
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
    </div>
  );
}