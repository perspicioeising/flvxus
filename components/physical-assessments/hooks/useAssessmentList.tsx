// /hooks/useAssessmentList.tsx

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  AssessmentListItem, 
  AssessmentStats, 
  AssessmentFilters, 
  PaginationData
} from "@/components/physical-assessments/types/physical-assessment";
import { calculateAssessmentStats, filterAssessments } from "@/components/physical-assessments/components/assessmentUtils";

export function useAssessmentList() {
  const { toast } = useToast();
  const [allAssessments, setAllAssessments] = useState<AssessmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const ITEMS_PER_PAGE = 10;
  
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

  // Fetch inicial - carrega todas as avaliações
  const fetchInitialAssessments = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Carregando todas as avaliações...');

      const response = await fetch('/api/physical-assessments?all=true');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Resposta da API:', data);

      let assessmentsList: AssessmentListItem[] = [];
      
      // A API agora retorna array direto quando all=true
      if (Array.isArray(data)) {
        assessmentsList = data;
        console.log('✅ Dados recebidos como array');
      } else if (data.assessments && Array.isArray(data.assessments)) {
        assessmentsList = data.assessments;
        console.log('✅ Dados recebidos como objeto com assessments');
      } else {
        console.warn('⚠️ Formato inesperado:', data);
        assessmentsList = [];
      }

      console.log(`📊 Total de avaliações carregadas: ${assessmentsList.length}`);
      setAllAssessments(assessmentsList);
      
      // Calcular stats
      const newStats = calculateAssessmentStats(assessmentsList);
      setStats(newStats);

    } catch (error: any) {
      console.error('❌ Erro ao buscar avaliações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error.message,
      });
      
      // Em caso de erro, deixar array vazio
      setAllAssessments([]);
      setStats({
        total: 0,
        thisMonth: 0,
        avgFatPercentage: 0,
        avgBMI: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

  // Aplicar filtros localmente
  const filteredAssessments = filterAssessments(allAssessments, filters);
  
  // Avaliações para exibir (com paginação)
  const displayedAssessments = filteredAssessments.slice(0, currentPage * ITEMS_PER_PAGE);
  
  // Informações de paginação
  const pagination: PaginationData = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    total: filteredAssessments.length,
    totalPages: Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE),
    hasMore: displayedAssessments.length < filteredAssessments.length
  };

  // Load more - aumenta a página atual
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      
      console.log('📄 Carregando mais avaliações...', {
        currentPage,
        totalItems: filteredAssessments.length,
        showing: displayedAssessments.length
      });

      // Simular loading para UX
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [pagination.hasMore, isLoadingMore, currentPage, filteredAssessments.length, displayedAssessments.length]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<AssessmentFilters>) => {
    console.log('🔍 Atualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset para página 1
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    console.log('🧹 Limpando filtros');
    setFilters({
      searchQuery: "",
      protocolFilter: "all",
      dateFilter: "all"
    });
    setCurrentPage(1);
  }, []);

  // Verificar se há filtros ativos
  const hasActiveFilters = Boolean(
    filters.searchQuery || 
    filters.protocolFilter !== 'all' || 
    filters.dateFilter !== 'all'
  );

  // Effect inicial
  useEffect(() => {
    const initializePage = async () => {
      console.log('🚀 Inicializando página...');
      await fetchUserRole();
      await fetchInitialAssessments();
    };
    initializePage();
  }, [fetchUserRole, fetchInitialAssessments]);

  // Debug logs
  useEffect(() => {
    console.log('📊 Estado atual:', {
      allAssessments: allAssessments.length,
      filtered: filteredAssessments.length,
      displayed: displayedAssessments.length,
      currentPage,
      hasMore: pagination.hasMore,
      filters
    });
  }, [allAssessments.length, filteredAssessments.length, displayedAssessments.length, currentPage, pagination.hasMore, filters]);

  return {
    assessments: displayedAssessments,
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
    refetch: () => {
      setCurrentPage(1);
      fetchInitialAssessments();
    }
  };
}