'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Chart } from "@/components/ui/chart";

export default function PhysicalAssessmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  type Assessment = {
    id: string;
    student_id: string;
    student?: {
      full_name?: string;
      email?: string;
    };
    protocol?: string;
    date: string;
    weight?: number;
    height?: number;
    age?: number;
    gender?: string;
    fat_percentage?: number | string;
    body_density?: number | string;
    fat_mass?: number | string;
    lean_mass?: number | string;
    neck?: number | string;
    shoulders?: number | string;
    chest?: number | string;
    abdomen?: number | string;
    waist?: number | string;
    hips?: number | string;
    left_arm?: number | string;
    right_arm?: number | string;
    left_thigh?: number | string;
    right_thigh?: number | string;
    left_calf?: number | string;
    right_calf?: number | string;
    triceps?: number | string;
    abdominal?: number | string;
    suprailiac?: number | string;
  };

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  const fetchAssessmentDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/physical-assessments/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessment(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes da avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast]);

  const fetchAssessmentHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/physical-assessments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      interface AssessmentHistoryItem {
        date: string;
        weight?: number;
        bodyFat?: number;
        leanMass?: number;
        fatMass?: number;
      }

      interface AssessmentApi {
        id: string;
        student_id: string;
        date: string;
        weight?: number;
        fat_percentage?: number | string;
        lean_mass?: number | string;
        fat_mass?: number | string;
      }

      const studentAssessments: AssessmentHistoryItem[] = (data as AssessmentApi[])
        .filter((a: AssessmentApi) => assessment && a.student_id === assessment.student_id)
        .sort((a: AssessmentApi, b: AssessmentApi) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((a: AssessmentApi): AssessmentHistoryItem => ({
          date: format(new Date(a.date), 'MMM d'),
          weight: a.weight,
          bodyFat: a.fat_percentage !== undefined ? parseFloat(a.fat_percentage as string) : undefined,
          leanMass: a.lean_mass !== undefined ? parseFloat(a.lean_mass as string) : undefined,
          fatMass: a.fat_mass !== undefined ? parseFloat(a.fat_mass as string) : undefined,
        }));
      
      setAssessmentHistory(studentAssessments);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar histórico de avaliações",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [assessment, toast]);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [fetchAssessmentDetails]);

  useEffect(() => {
    if (assessment?.student_id) {
      fetchAssessmentHistory();
    }
  }, [assessment?.student_id, fetchAssessmentHistory]);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/physical-assessments/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação foi removida",
      });
      
      router.push('/dashboard/physical-assessments');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Avaliação não encontrada</h2>
          <p className="text-muted-foreground">A avaliação solicitada não foi encontrada.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/physical-assessments')}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes da Avaliação</h2>
            <p className="text-muted-foreground">
              Visualize os resultados da avaliação física
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/physical-assessments/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Avaliação
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Avaliação
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Progresso</CardTitle>
            <CardDescription>
              Acompanhe as mudanças na composição corporal ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart data={assessmentHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Avaliação</CardTitle>
            <CardDescription>
              Detalhes da avaliação física
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Aluno</h3>
                  <p className="text-lg font-medium">{assessment.student?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{assessment.student?.email}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Protocolo</h3>
                  <p className="text-base">{assessment.protocol}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
                  <p className="text-base">{format(new Date(assessment.date), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Medidas Básicas</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="ml-1 font-medium">{assessment.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Altura:</span>
                      <span className="ml-1 font-medium">{assessment.height} cm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Idade:</span>
                      <span className="ml-1 font-medium">{assessment.age} anos</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gênero:</span>
                      <span className="ml-1 font-medium capitalize">{assessment.gender}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Resultados</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-muted-foreground">Gordura Corporal:</span>
                      <span className="ml-1 font-medium">{assessment.fat_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Densidade Corporal:</span>
                      <span className="ml-1 font-medium">{assessment.body_density}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Massa Gorda:</span>
                      <span className="ml-1 font-medium">{assessment.fat_mass} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Massa Magra:</span>
                      <span className="ml-1 font-medium">{assessment.lean_mass} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Medidas de Perimetria</CardTitle>
              <CardDescription>Medidas de circunferência corporal em centímetros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Pescoço:</span>
                  <span className="ml-1 font-medium">{assessment.neck || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ombros:</span>
                  <span className="ml-1 font-medium">{assessment.shoulders || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tórax:</span>
                  <span className="ml-1 font-medium">{assessment.chest || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Abdômen:</span>
                  <span className="ml-1 font-medium">{assessment.abdomen || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cintura:</span>
                  <span className="ml-1 font-medium">{assessment.waist || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quadril:</span>
                  <span className="ml-1 font-medium">{assessment.hips || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Braço Esquerdo:</span>
                  <span className="ml-1 font-medium">{assessment.left_arm || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Braço Direito:</span>
                  <span className="ml-1 font-medium">{assessment.right_arm || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coxa Esquerda:</span>
                  <span className="ml-1 font-medium">{assessment.left_thigh || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coxa Direita:</span>
                  <span className="ml-1 font-medium">{assessment.right_thigh || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Panturrilha Esquerda:</span>
                  <span className="ml-1 font-medium">{assessment.left_calf || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Panturrilha Direita:</span>
                  <span className="ml-1 font-medium">{assessment.right_calf || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medidas de Dobras Cutâneas</CardTitle>
              <CardDescription>Medidas de dobras cutâneas em milímetros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Tríceps:</span>
                  <span className="ml-1 font-medium">{assessment.triceps || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Abdominal:</span>
                  <span className="ml-1 font-medium">{assessment.abdominal || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Suprailíaca:</span>
                  <span className="ml-1 font-medium">{assessment.suprailiac || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}