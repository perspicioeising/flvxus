'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import {
  Activity,
  Scale,
  Ruler,
  Heart,
  Camera,
  ChevronRight,
  CalendarDays,
  BarChart as BarChartIcon
} from "lucide-react";

export default function ProgressPage() {
  const router = useRouter();
  const { toast } = useToast();
  type PhysicalAssessment = {
    id: string | number;
    date: string;
    weight: number;
    fat_percentage: string;
    lean_mass: string;
    fat_mass: string;
    chest?: number;
    waist?: number;
    hips?: number;
    left_arm?: number;
    right_arm?: number;
    left_thigh?: number;
    right_thigh?: number;
    height?: number;
    protocol?: string;
  };

  type PostureAssessment = {
    id: string | number;
    created_at: string;
    front_image_url?: string;
    side_image_url?: string;
    back_image_url?: string;
  };

  const [physicalAssessments, setPhysicalAssessments] = useState<PhysicalAssessment[]>([]);
  const [postureAssessments, setPostureAssessments] = useState<PostureAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // Fetch physical assessments
      const physicalResponse = await fetch('/api/physical-assessments');
      const physicalData = await physicalResponse.json();
      
      if (!physicalResponse.ok) {
        throw new Error(physicalData.error);
      }
      
      setPhysicalAssessments(physicalData);

      // Fetch posture assessments
      const postureResponse = await fetch('/api/posture-assessments');
      const postureData = await postureResponse.json();
      
      if (!postureResponse.ok) {
        throw new Error(postureData.error);
      }
      
      setPostureAssessments(postureData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar avaliações",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressData = () => {
    return physicalAssessments.map(assessment => ({
      date: format(new Date(assessment.date), 'MMM d'),
      weight: assessment.weight,
      bodyFat: parseFloat(assessment.fat_percentage),
      leanMass: parseFloat(assessment.lean_mass),
      fatMass: parseFloat(assessment.fat_mass)
    }));
  };

  const getMeasurementsData = () => {
    if (physicalAssessments.length === 0) return [];
    
    const latest = physicalAssessments[0];
    return [
      { name: 'Peito', value: latest.chest },
      { name: 'Cintura', value: latest.waist },
      { name: 'Quadril', value: latest.hips },
      { name: 'Braço Esquerdo', value: latest.left_arm },
      { name: 'Braço Direito', value: latest.right_arm },
      { name: 'Coxa Esquerda', value: latest.left_thigh },
      { name: 'Coxa Direita', value: latest.right_thigh }
    ].filter(item => item.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando seu progresso...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos seus dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Progresso</h2>
        <p className="text-muted-foreground">
          Acompanhe sua jornada fitness e mudanças na composição corporal
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.weight || '-'} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Gordura Corporal</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.fat_percentage || '-'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Massa Magra</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.lean_mass || '-'} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Altura</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.height || '-'} cm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="physical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="physical">Avaliações Físicas</TabsTrigger>
            <TabsTrigger value="posture">Avaliações Posturais</TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="space-y-4">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Composição Corporal</CardTitle>
                <CardDescription>
                  Acompanhe as mudanças no seu peso e composição corporal ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name="Peso (kg)"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat"
                        name="Gordura Corporal (%)" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leanMass"
                        name="Massa Magra (kg)" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Measurements Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Medidas Recentes</CardTitle>
                <CardDescription>
                  Suas medidas corporais mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMeasurementsData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Avaliações</CardTitle>
                <CardDescription>
                  Visualize todos os seus registros de avaliação física
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {physicalAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(assessment.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Peso: {assessment.weight}kg</span>
                          <span>Gordura: {assessment.fat_percentage}%</span>
                          <span>Protocolo: {assessment.protocol}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações Posturais</CardTitle>
                <CardDescription>
                  Visualize seu histórico de avaliações posturais e análises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postureAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(assessment.created_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          <span>
                            {assessment.front_image_url && assessment.side_image_url && assessment.back_image_url
                              ? "Todas as fotos enviadas"
                              : "Avaliação parcial"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {postureAssessments.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      Nenhuma avaliação postural encontrada.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}