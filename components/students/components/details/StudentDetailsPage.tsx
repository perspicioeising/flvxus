'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { StudentProfile } from '@/components/students/components/types/student';
import { StudentDetailsHeader } from '@/components/students/components/details/StudentDetailsHeader';
import { StudentDetailsContent } from '@/components/students/components/details/StudentDetailsContent';
import { StudentDetailsActions } from '@/components/students/components/details/StudentDetailsActions';
import { StudentDetailsSkeleton } from '@/components/students/components/details/StudentDetailsSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Edit } from 'lucide-react';

export function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResendingInvite, setIsResendingInvite] = useState(false);

  const studentId = params.id as string;

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Buscando aluno:', studentId);
      
      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar aluno');
      }

      console.log('✅ Aluno carregado:', data.full_name);
      setStudent(data);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar aluno:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar aluno",
        description: error.message,
      });
      
      router.push('/dashboard/students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/students/${studentId}/edit`);
  };

  const handleClone = () => {
    const searchParams = new URLSearchParams({
      clone: studentId,
    });
    
    router.push(`/dashboard/students/new?${searchParams.toString()}`);
  };

  const handleResendInvite = async () => {
    if (!student) return;

    try {
      setIsResendingInvite(true);
      console.log('📧 Reenviando convite para:', student.full_name);

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar convite');
      }

      toast({
        title: "Convite reenviado com sucesso",
        description: `Um novo convite foi enviado para ${student.email}`,
      });

    } catch (error: any) {
      console.error('❌ Erro ao reenviar convite:', error);
      toast({
        variant: "destructive",
        title: "Erro ao reenviar convite",
        description: error.message,
      });
    } finally {
      setIsResendingInvite(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja desativar o aluno "${student.full_name}"?\n\nO aluno será desativado mas seus dados serão preservados.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      console.log('🗑️ Desativando aluno:', student.full_name);

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao desativar aluno');
      }

      toast({
        title: "Aluno desativado com sucesso",
        description: `"${student.full_name}" foi desativado`,
      });

      router.push('/dashboard/students');

    } catch (error: any) {
      console.error('❌ Erro ao desativar aluno:', error);
      toast({
        variant: "destructive",
        title: "Erro ao desativar aluno",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/students');
  };

  if (isLoading) {
    return <StudentDetailsSkeleton />;
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
              <Users className="h-12 w-12 text-app-text-muted" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-app-heading mb-2">
              Aluno não encontrado
            </h2>
            <p className="text-app-text-secondary leading-relaxed">
              O aluno que você procura não existe ou foi removido.
            </p>
          </div>
          
          <Button
            onClick={handleBack}
            className="btn-gradient-primary px-6 py-3 rounded-xl font-semibold shadow-app-large hover:shadow-app-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar à Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-6xl">
        
        {/* Header com título e ações principais */}
        <StudentDetailsHeader
          student={student}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResendInvite={handleResendInvite}
          isDeleting={isDeleting}
          isResendingInvite={isResendingInvite}
        />

        {/* Conteúdo principal */}
        <StudentDetailsContent student={student} />

        {/* Ações secundárias (mobile) */}
        <StudentDetailsActions
          student={student}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          onResendInvite={handleResendInvite}
          isDeleting={isDeleting}
          isResendingInvite={isResendingInvite}
        />

        {/* Floating Action Button - Mobile Only */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-achievement-workout/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleEdit}
              className="relative w-14 h-14 bg-achievement-workout hover:bg-achievement-workout/90 rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <Edit className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}