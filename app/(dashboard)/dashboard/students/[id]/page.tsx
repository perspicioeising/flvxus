'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Camera, Eye, FileText, Send, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

const EXPERIENCE_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const TRAINING_TIMES = ["Madrugada", "Morning", "Tarde", "Noite", "Madrugada"];
const GOALS = [
  "Perda de Peso",
  "Ganho de Massa",
  "Força",
  "Resistência",
  "Flexibilidade",
  "Condicionamento Geral",
  "Performance Esportiva",
  "Reabilitação"
];

export default function StudentDetailsPage() {
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
    console.log('fetchStudentDetails called with id:', params.id); // Log function call
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    console.log('useEffect running'); // Log effect execution
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const fetchPhysicalAssessments = useCallback(async () => {
    try {
      const response = await fetch(`/api/physical-assessments?student_id=${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPhysicalAssessments(data.assessments || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações físicas",
        description: error.message,
      });
    }
  }, [params.id, toast]);

  const fetchPosturalAssessments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posture-assessments?student_id=${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPosturalAssessments(data.assessments || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações posturais",
        description: error.message,
      });
    }
  }, [params.id, toast]);

  // Modify useEffect to fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      await fetchStudentDetails();
      if (activeTab === "physical") await fetchPhysicalAssessments();
      if (activeTab === "postural") await fetchPosturalAssessments();
    };
    fetchAllData();
  }, [fetchStudentDetails, fetchPhysicalAssessments, fetchPosturalAssessments, activeTab]);


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
      router.push('/dashboard/students');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando detalhes do aluno...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos as informações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-muted-foreground">Perfil do Aluno</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="physical">Avaliações Físicas</TabsTrigger>
          <TabsTrigger value="postural">Avaliações Posturais</TabsTrigger>
          <TabsTrigger value="media">Arquivos de Mídia</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResendInvite}
              disabled={isResendingInvite}
            >
              <Send className="h-4 w-4 mr-2" />
              {isResendingInvite ? "Reenviando..." : "Reenviar Convite"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>



            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Atualize os dados básicos e informações de contato do aluno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={student.name}
                      onChange={(e) => setStudent(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={student.email}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Telefone</Label>
                    <Input
                      id="phone"
                      value={student.phone}
                      onChange={(e) => setStudent(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={student.birthDate}
                      onChange={(e) => setStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select
                      value={student.gender}
                      onValueChange={(value) => setStudent(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={student.status}
                      onValueChange={(value) => setStudent(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Físicas</CardTitle>
                <CardDescription>
                  Atualize as medidas físicas e objetivos de fitness do aluno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={student.height}
                      onChange={(e) => setStudent(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={student.weight}
                      onChange={(e) => setStudent(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objetivos de Fitness</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {GOALS.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={goal}
                          checked={student.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudent(prev => ({
                                ...prev,
                                goals: [...prev.goals, goal]
                              }));
                            } else {
                              setStudent(prev => ({
                                ...prev,
                                goals: prev.goals.filter(g => g !== goal)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={goal}>{goal}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                    <Select
                      value={student.experienceLevel}
                      onValueChange={(value) => setStudent(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de experiência" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Horário Preferido</Label>
                    <Select
                      value={student.preferredTime}
                      onValueChange={(value) => setStudent(prev => ({ ...prev, preferredTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário preferido" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_TIMES.map((time) => (
                          <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Médicas e de Emergência</CardTitle>
                <CardDescription>
                  Atualize as condições médicas e informações de contato de emergência do aluno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Condições Médicas</Label>
                  <Textarea
                    id="medicalConditions"
                    placeholder="Liste quaisquer condições médicas, lesões ou limitações"
                    value={student.medicalConditions}
                    onChange={(e) => setStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Nome e número de telefone"
                    value={student.emergencyContact}
                    onChange={(e) => setStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Add any additional notes or observations about the student.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional notes here..."
                  value={student.notes}
                  onChange={(e) => setStudent(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="physical">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Avaliações Físicas</CardTitle>
                  <CardDescription>Histórico de avaliações físicas do aluno</CardDescription>
                </div>
                <Button onClick={() => router.push(`/dashboard/physical-assessments/new?student=${params.id}`)}>
                  Nova Avaliação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {physicalAssessments.map((assessment: any) => (
                  <Card key={assessment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{format(new Date(assessment.date), 'PPP', { locale: ptBR })}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Peso: {assessment.weight}kg</div>
                          <div>Gordura Corporal: {assessment.fat_percentage}%</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {physicalAssessments.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma avaliação física encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Postural Assessments Tab */}
        <TabsContent value="postural">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Avaliações Posturais</CardTitle>
                  <CardDescription>Histórico de avaliações posturais do aluno</CardDescription>
                </div>
                <Button onClick={() => router.push(`/dashboard/posture-assessments/new?student=${params.id}`)}>
                  Nova Avaliação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posturalAssessments.map((assessment: any) => (
                  <Card key={assessment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}</h3>
                        <div className="flex gap-2 mt-2">
                          {assessment.front_image_url && <Badge variant="outline">Frontal</Badge>}
                          {assessment.side_image_url && <Badge variant="outline">Lateral</Badge>}
                          {assessment.back_image_url && <Badge variant="outline">Posterior</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {posturalAssessments.length === 0 && (
                  <div className="text-center py-12">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma avaliação postural encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Files Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Arquivos de Mídia</CardTitle>
                  <CardDescription>Fotos e vídeos compartilhados pelo aluno</CardDescription>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum arquivo de mídia encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Os arquivos compartilhados pelo aluno aparecerão aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
   
  );
}