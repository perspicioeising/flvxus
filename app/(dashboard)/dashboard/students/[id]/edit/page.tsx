'use client';

import { useState, useEffect, use } from 'react';
import { StudentFormCarousel } from '@/components/students/components/create/StudentFormCarousel';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';
import {StudentFormData} from '@/types/student'

interface EditStudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = use(params);
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<Partial<StudentFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/students/${id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do aluno');
        }
        
        const data = await response.json();
        
        // Mapear os dados da API para o formato do formulário
        const mappedData: Partial<StudentFormData> = {
          name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          birthDate: data.birth_date || '',
          gender: data.gender || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          goals: data.goals || [],
          medicalConditions: data.medical_conditions || '',
          emergencyContact: data.emergency_contact || '',
          preferredTime: data.preferred_training_time || '',
          experienceLevel: data.experience_level || '',
          notes: data.notes || ''
        };
        
        setStudentData(mappedData);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Erro ao carregar aluno
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'Não foi possível encontrar os dados do aluno'}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Success state - render the form
  return (
    <StudentFormCarousel
      mode="edit"
      studentId={id}
    />
  );
}