'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Student } from '@/types/student';

// Import dos componentes
import { StudentDetailsHeader } from '@/components/students/components/StudentDetailsHeader';
import { StudentDetailsTabs } from '@/components/students/components/StudentDetailsTabs';
import { StudentDetailsLoading } from '@/components/students/components/StudentDetailsLoading';

export function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResendingInvite, setIsResendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [physicalAssessments, setPhysicalAssessments] = useState([]);
  const [posturalAssessments, setPosturalAssessments] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    physical: false,
    postural: false,
    media: false
  });
  
  const [student, setStudent] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    height: "",
    weight: "",
    goals: [] as string[],
    medicalConditions: "",
    emergencyContact: "",
    preferredTime: "",
    experienceLevel: "",
    notes: "",
    status: ""
  });

  const fetchStudentDetails = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, profile: true }));
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStudent({
        name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthDate: data.birth_date || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        goals: Array.isArray(data.goals) ? data.goals : [],
        medicalConditions: data.medical_conditions || "",
        emergencyContact: data.emergency_contact || "",
        preferredTime: data.preferred_training_time || "",
        experienceLevel: data.experience_level || "",
        notes: data.notes || "",
        status: data.status || "active"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do aluno",
        description: error.message,
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }));
      setIsLoading(false);
    }
  }, [params.id, toast]);

  const fetchPhysicalAssessments = useCallback(async () => {
    if (!params.id) return;

    try {
      setLoadingStates(prev => ({ ...prev, physical: true }));
      const response = await fetch(`/api/students/${params.id}/assessments?type=physical`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPhysicalAssessments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações físicas",
        description: error.message,
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, physical: false }));
    }
  }, [params.id, toast]);

  const fetchPosturalAssessments = useCallback(async () => {
    if (!params.id) return;

    try {
      setLoadingStates(prev => ({ ...prev, postural: true }));
      const response = await fetch(`/api/students/${params.id}/assessments?type=postural`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPosturalAssessments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações posturais",
        description: error.message,
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, postural: false }));
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  useEffect(() => {
    const fetchTabData = async () => {
      switch (activeTab) {
        case 'physical':
          if (physicalAssessments.length === 0) await fetchPhysicalAssessments();
          break;
        case 'postural':
          if (posturalAssessments.length === 0) await fetchPosturalAssessments();
          break;
      }
    };
    fetchTabData();
  }, [activeTab, fetchPhysicalAssessments, fetchPosturalAssessments]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: student.name,
          phone: student.phone || null,
          birthDate: student.birthDate || null,
          gender: student.gender || null,
          height: student.height ? parseFloat(student.height) : null,
          weight: student.weight ? parseFloat(student.weight) : null,
          goals: Array.isArray(student.goals) ? student.goals : [],
          medicalConditions: student.medicalConditions || null,
          emergencyContact: student.emergencyContact || null,
          preferredTime: student.preferredTime || null,
          experienceLevel: student.experienceLevel || null,
          notes: student.notes || null,
          status: student.status || 'active'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Alterações salvas",
        description: "O perfil do aluno foi atualizado.",
      });

      router.push('/dashboard/students')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar aluno",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendInvite = async () => {
    try {
      setIsResendingInvite(true);
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Convite reenviado",
        description: "Um novo email foi enviado para o aluno.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar convite",
        description: error.message,
      });
    } finally {
      setIsResendingInvite(false);
    }
  };

  const updateStudent = (updates: Partial<typeof student>) => {
    setStudent(prev => ({ ...prev, ...updates }));
  };

  if (isLoading) {
    return <StudentDetailsLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header */}
        <StudentDetailsHeader
          student={student}
          isSaving={isSaving}
          isResendingInvite={isResendingInvite}
          onSave={handleSave}
          onResendInvite={handleResendInvite}
          onBack={() => router.back()}
        />

        {/* Tabs Content */}
        <StudentDetailsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          student={student}
          onStudentUpdate={updateStudent}
          physicalAssessments={physicalAssessments}
          posturalAssessments={posturalAssessments}
          mediaFiles={mediaFiles}
          loadingStates={loadingStates}
          studentId={params.id as string}
        />
      </div>
    </div>
  );
}