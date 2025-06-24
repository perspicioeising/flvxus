// /hooks/useStudentsList.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types/student';

interface StudentsFilters {
  searchQuery: string;
  statusFilter: string;
  experienceFilter: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface StudentsStats {
  total: number;
  active: number;
  inactive: number;
  beginners: number;
  intermediate: number;
  advanced: number;
  thisMonth: number;
}

export function useStudentsList() {
  const { toast } = useToast();
  
  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filters, setFilters] = useState<StudentsFilters>({
    searchQuery: '',
    statusFilter: 'all',
    experienceFilter: 'all'
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  const [stats, setStats] = useState<StudentsStats>({
    total: 0,
    active: 0,
    inactive: 0,
    beginners: 0,
    intermediate: 0,
    advanced: 0,
    thisMonth: 0
  });

  // Check if has active filters
  const hasActiveFilters = Boolean(filters.searchQuery) || 
                          filters.statusFilter !== 'all' || 
                          filters.experienceFilter !== 'all';

  // Fetch students with pagination
  const fetchStudents = useCallback(async (page = 1, limit = 10, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: filters.searchQuery,
        status: filters.statusFilter,
        experience: filters.experienceFilter
      });

      const response = await fetch(`/api/students?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar alunos');
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

      // Update stats if provided
      if (data.stats) {
        setStats(data.stats);
      }

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
  }, [filters.searchQuery, filters.statusFilter, filters.experienceFilter, toast]);

  // Load more students
  const loadMore = useCallback(() => {
    if (!isLoadingMore && pagination.hasMore) {
      fetchStudents(pagination.page + 1, pagination.limit, true);
    }
  }, [isLoadingMore, pagination.hasMore, pagination.page, pagination.limit, fetchStudents]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<StudentsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      statusFilter: 'all',
      experienceFilter: 'all'
    });
  }, []);

  // Reset and fetch (used when filters change)
  const resetAndFetch = useCallback(() => {
    fetchStudents(1, pagination.limit, false);
  }, [fetchStudents, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      resetAndFetch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [filters.searchQuery, filters.statusFilter, filters.experienceFilter, resetAndFetch]);

  // Filtered students (for additional client-side filtering if needed)
  const filteredStudents = students.filter((student) => {
    const matchesSearch = !filters.searchQuery || 
      student.full_name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesStatus = filters.statusFilter === 'all' || 
                         student.status === filters.statusFilter;

    const matchesExperience = filters.experienceFilter === 'all' || 
                             student.experience_level === filters.experienceFilter;

    return matchesSearch && matchesStatus && matchesExperience;
  });

  return {
    students: filteredStudents,
    isLoading,
    isLoadingMore,
    filters,
    pagination,
    stats,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    loadMore,
    refetch: resetAndFetch
  };
}