// /hooks/useAssessmentList.tsx

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  AssessmentListItem, 
  AssessmentStats, 
  AssessmentFilters, 
  PaginationData,
  AssessmentListResponse 
} from "@/types/physical-assessment";
import { calculateAssessmentStats } from "@/components/physical-assessments/components/assessmentUtils";

export function useAssessmentList() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState<AssessmentStats>({
    total: 0,
    thisMonth: 0,
    avgFatPercentage: 0,
    avgBMI: 0
  });
  
  const [filters, setFilters] = useState<AssessmentFilters>({
    searchQuery: "",
    protocolFilter: "all",
    dateFilter: "all"
  });

  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false
  });

  // Fetch assessments with pagination
  const fetchAssessments = useCallback(async (page = 1, limit = 10, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      console.log(`🔍 Fazendo requisição para /api/physical-assessments - Página ${page}...`);

      // Construir URL com parâmetros de paginação e filtros
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: filters.searchQuery,
        protocol: filters.protocolFilter,
        dateFilter: filters.dateFilter
      });

      const response = await fetch(`/api/physical-assessments?${params}`);
      const data = await response.json();

      console.log('📦 Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar avaliações');
      }

      // Adaptação para estrutura com paginação
      let assessmentsList: AssessmentListItem[] = [];
      let paginationData: PaginationData = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasMore: false
      };

      if (data.assessments && data.pagination) {
        // Formato novo com paginação: { assessments: [...], pagination: {...} }
        assessmentsList = data.assessments;
        paginationData = data.pagination;
        console.log('✅ Usando formato novo com paginação');
      } else if (Array.isArray(data)) {
        // Formato antigo (array direto) - compatibilidade
        assessmentsList = data;
        paginationData = {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasMore: false
        };
        console.log('⚠️ Usando formato antigo (array direto)');
      } else {
        console.error('❌ Formato de resposta não reconhecido:', data);
        assessmentsList = [];
      }

      console.log(`📊 Total de avaliações encontradas: ${assessmentsList.length}`);
      console.log('🗂️ Paginação:', paginationData);

      if (append) {
        setAssessments(prev => [...prev, ...assessmentsList]);
      } else {
        setAssessments(assessmentsList);
        // Calcular stats apenas com o primeiro carregamento
        calculateStats(assessmentsList, paginationData.total);
      }
      
      setPagination(paginationData);

    } catch (error: any) {
      console.error('❌ Erro ao buscar avaliações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error.message,
      });
      // Em caso de erro, manter o array vazio
      if (!append) {
        setAssessments([]);
        calculateStats([], 0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, toast]);

  const fetchUserRole = useCallback(async () => {
    try {
      console.log('👤 Buscando role do usuário...');
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Role encontrado:', data.role);
        setUserRole(data.role);
      } else {
        console.warn('⚠️ Erro ao buscar role:', data);
        setUserRole(null);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar role do usuário:', error);
      setUserRole(null);
    }
  }, []);

  const calculateStats = (assessmentsList: AssessmentListItem[], total?: number) => {
    console.log('📊 Calculando estatísticas para', assessmentsList.length, 'avaliações');
    const newStats = calculateAssessmentStats(assessmentsList);
    // Use o total da paginação se disponível, senão use o comprimento da lista
    newStats.total = total ?? assessmentsList.length;
    console.log('📊 Stats calculados:', newStats);
    setStats(newStats);
  };

  // Load more assessments
  const loadMore = useCallback(() => {
    if (!isLoadingMore && pagination.hasMore) {
      fetchAssessments(pagination.page + 1, pagination.limit, true);
    }
  }, [fetchAssessments, isLoadingMore, pagination]);

  // Reset and fetch (usado quando filtros mudam)
  const resetAndFetch = useCallback(() => {
    setAssessments([]); // Limpar lista atual
    fetchAssessments(1, pagination.limit, false);
  }, [fetchAssessments, pagination.limit]);

  const updateFilters = useCallback((newFilters: Partial<AssessmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      protocolFilter: "all",
      dateFilter: "all"
    });
  }, []);

  const hasActiveFilters = Boolean(filters.searchQuery || filters.protocolFilter !== 'all' || filters.dateFilter !== 'all');

  // Effect inicial - carregar dados
  useEffect(() => {
    const initializePage = async () => {
      console.log('🚀 Inicializando página...');
      await fetchUserRole();
      await fetchAssessments();
    };
    initializePage();
  }, [fetchUserRole]); // Remover fetchAssessments da dependência para evitar loop

  // Effect para mudanças de filtro - reset e buscar novamente
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      resetAndFetch();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [filters.searchQuery, filters.protocolFilter, filters.dateFilter]); // Dependências específicas

  useEffect(() => {
    console.log('👤 UserRole atual:', userRole);
  }, [userRole]);

  return {
    assessments,
    isLoading,
    isLoadingMore,
    userRole,
    stats,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    loadMore,
    refetch: () => resetAndFetch()
  };
}