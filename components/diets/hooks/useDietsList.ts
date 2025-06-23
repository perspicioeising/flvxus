// /components/diets/hooks/useDietsList.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/components/diets/hooks/use-debounce';
import type { Diet, DietFilters, DietStatistics } from '../types';
import { DEFAULT_PAGINATION } from '../constants';

interface UseDietsListState {
  diets: Diet[];
  filteredDiets: Diet[];
  paginatedDiets: Diet[];
  loading: boolean;
  initialLoading: boolean;
  userProfile: any;
  students: any[];
  filters: DietFilters;
  pagination: typeof DEFAULT_PAGINATION;
  stats: DietStatistics;
  hasActiveFilters: boolean;
}

interface UseDietsListActions {
  setFilters: (filters: DietFilters | ((prev: DietFilters) => DietFilters)) => void;
  clearFilters: () => void;
  refreshDiets: () => Promise<void>;
  deleteDiet: (dietId: string) => Promise<void>;
  changePage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
}

interface UseDietsListReturn extends UseDietsListState, UseDietsListActions {}

export function useDietsList(): UseDietsListReturn {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  
  // Core state
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  
  // Filters state
  const [filters, setFiltersState] = useState<DietFilters>({
    searchQuery: '',
    statusFilter: 'all',
    goalFilter: 'all'
  });

  // Debounced search query para evitar muitas chamadas
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  
  // Cache para evitar re-computações desnecessárias
  const cacheRef = useRef<{
    lastFilters: DietFilters | null;
    lastFilteredDiets: Diet[];
  }>({
    lastFilters: null,
    lastFilteredDiets: []
  });

  // Memoized computed values
  const filteredDiets = useMemo(() => {
    // Verificar se os filtros mudaram
    const currentFilters = { ...filters, searchQuery: debouncedSearchQuery };
    const filtersChanged = !cacheRef.current.lastFilters || 
      JSON.stringify(cacheRef.current.lastFilters) !== JSON.stringify(currentFilters);

    if (!filtersChanged) {
      return cacheRef.current.lastFilteredDiets;
    }

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
    if (currentFilters.statusFilter !== 'all') {
      filtered = filtered.filter(diet => diet.status === currentFilters.statusFilter);
    }

    // Goal filter
    if (currentFilters.goalFilter !== 'all') {
      filtered = filtered.filter(diet => diet.goal === currentFilters.goalFilter);
    }

    // Update cache
    cacheRef.current.lastFilters = currentFilters;
    cacheRef.current.lastFilteredDiets = filtered;

    return filtered;
  }, [diets, debouncedSearchQuery, filters.statusFilter, filters.goalFilter]);

  const paginatedDiets = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredDiets.slice(startIndex, endIndex);
  }, [filteredDiets, pagination.page, pagination.limit]);

  const hasActiveFilters = useMemo(() => 
    filters.searchQuery !== '' || filters.statusFilter !== 'all' || filters.goalFilter !== 'all'
  , [filters]);

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

  // Data fetching functions
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

  const fetchStudents = useCallback(async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'student')
        .eq('tenant_id', tenantId)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  }, [supabase]);

  const fetchDiets = useCallback(async (showLoading = true) => {
    try {
      if (showLoading && !initialLoading) {
        setLoading(true);
      }
      
      // Primeira query - buscar dietas
      let dietsQuery = supabase
        .from('diets')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (userProfile?.role === 'student') {
        dietsQuery = dietsQuery.eq('student_id', userProfile.id);
      } else if (userProfile?.role === 'trainer') {
        dietsQuery = dietsQuery.eq('tenant_id', userProfile.tenant_id);
      }

      const { data: dietsData, error: dietsError } = await dietsQuery;

      if (dietsError) throw dietsError;

      // Segunda query - buscar dados dos estudantes separadamente
      if (dietsData && dietsData.length > 0) {
        const studentIds = [...new Set(dietsData.map(diet => diet.student_id).filter(Boolean))];
        
        if (studentIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', studentIds);

          if (studentsError) {
            console.warn('Error fetching students data:', studentsError);
            // Continuar mesmo com erro nos dados dos estudantes
          }

          // Mapear dados dos estudantes para as dietas
          const dietsWithStudents = dietsData.map(diet => ({
            ...diet,
            student: studentsData?.find(student => student.id === diet.student_id) || {
              id: diet.student_id,
              full_name: 'Usuário não encontrado',
              avatar_url: null
            }
          }));

          setDiets(dietsWithStudents);
        } else {
          setDiets(dietsData);
        }
      } else {
        setDiets([]);
      }
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: dietsData?.length || 0,
        totalPages: Math.ceil((dietsData?.length || 0) / prev.limit)
      }));

    } catch (error: any) {
      console.error('Error fetching diets:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dietas",
        description: error.message
      });
      // Set empty state on error
      setDiets([]);
    } finally {
      setLoading(false);
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  }, [supabase, userProfile, toast, initialLoading]);

  // Effects
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchDiets();
      if (userProfile.role === 'trainer') {
        fetchStudents(userProfile.tenant_id);
      }
    }
  }, [userProfile, fetchDiets, fetchStudents]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      page: 1,
      totalPages: Math.ceil(filteredDiets.length / prev.limit)
    }));
  }, [filteredDiets.length]);

  // Actions
  const setFilters = useCallback((newFilters: DietFilters | ((prev: DietFilters) => DietFilters)) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      searchQuery: '',
      statusFilter: 'all',
      goalFilter: 'all'
    });
  }, []);

  const refreshDiets = useCallback(async () => {
    await fetchDiets(false); // Não mostrar loading para refresh
  }, [fetchDiets]);

  const deleteDiet = useCallback(async (dietId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('diets')
        .delete()
        .eq('id', dietId);

      if (error) throw error;

      // Update local state sem fazer nova busca
      setDiets(prev => prev.filter(diet => diet.id !== dietId));

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
  }, [supabase, toast]);

  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: pageSize, 
      page: 1,
      totalPages: Math.ceil(filteredDiets.length / pageSize)
    }));
  }, [filteredDiets.length]);

  return {
    // State
    diets,
    filteredDiets,
    paginatedDiets,
    loading,
    initialLoading,
    userProfile,
    students,
    filters,
    pagination,
    stats,
    hasActiveFilters,

    // Actions
    setFilters,
    clearFilters,
    refreshDiets,
    deleteDiet,
    changePage,
    changePageSize
  };
}