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
import { ArrowLeft, Camera, Eye, FileText, Send, Upload, User, Mail, Phone, Calendar, Users, Target, Heart, Clock, Activity, Image, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

const EXPERIENCE_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const TRAINING_TIMES = ["Madrugada", "Manhã", "Tarde", "Noite"];
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
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    physical: false,
    postural: false,
    media: false
  });
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

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

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

  const TabLoading = () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400 mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500 mx-auto"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
              Carregando detalhes do aluno...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Por favor, aguarde enquanto buscamos as informações.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  {student.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                    {student.name || "Detalhes do Aluno"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Perfil Completo • {student.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleResendInvite}
                disabled={isResendingInvite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                {isResendingInvite ? "Reenviando..." : "Reenviar Convite"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-2 shadow-lg">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="physical"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Avaliações Físicas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="postural"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Avaliações Posturais</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Mídia</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {loadingStates.profile ? (
              <TabLoading />
            ) : (
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Informações Básicas</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Dados pessoais e informações de contato
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Nome Completo
                          </Label>
                          <Input
                            value={student.name}
                            onChange={(e) => setStudent(prev => ({ ...prev, name: e.target.value }))}
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                            E-mail
                          </Label>
                          <Input
                            value={student.email}
                            disabled
                            className="h-12 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Telefone
                          </Label>
                          <Input
                            value={student.phone}
                            onChange={(e) => setStudent(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Data de Nascimento
                          </Label>
                          <Input
                            type="date"
                            value={student.birthDate}
                            onChange={(e) => setStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Gênero
                          </Label>
                          <Select
                            value={student.gender}
                            onValueChange={(value) => setStudent(prev => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                              <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                              <SelectItem value="male">Masculino</SelectItem>
                              <SelectItem value="female">Feminino</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Status</Label>
                          <Select
                            value={student.status}
                            onValueChange={(value) => setStudent(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Physical Information */}
                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Informações Físicas</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Medidas físicas e objetivos de fitness
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Altura (cm)</Label>
                        <Input
                          type="number"
                          value={student.height}
                          onChange={(e) => setStudent(prev => ({ ...prev, height: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Peso (kg)</Label>
                        <Input
                          type="number"
                          value={student.weight}
                          onChange={(e) => setStudent(prev => ({ ...prev, weight: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Objetivos de Fitness
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {GOALS.map((goal) => (
                          <div key={goal} className="relative">
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
                              className="peer sr-only"
                            />
                            <label 
                              htmlFor={goal}
                              className="flex items-center justify-center p-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:border-green-500 dark:peer-checked:border-green-400 peer-checked:text-green-700 dark:peer-checked:text-green-300"
                            >
                              {goal}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nível de Experiência</Label>
                        <Select
                          value={student.experienceLevel}
                          onValueChange={(value) => setStudent(prev => ({ ...prev, experienceLevel: value }))}
                        >
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                            {EXPERIENCE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Horário Preferido
                        </Label>
                        <Select
                          value={student.preferredTime}
                          onValueChange={(value) => setStudent(prev => ({ ...prev, preferredTime: value }))}
                        >
                          <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                            {TRAINING_TIMES.map((time) => (
                              <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Informações Médicas</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Condições médicas e contato de emergência
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                        Condições Médicas
                      </Label>
                      <Textarea
                        placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
                        value={student.medicalConditions}
                        onChange={(e) => setStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
                        className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Contato de Emergência
                      </Label>
                      <Input
                        placeholder="Nome e telefone do contato de emergência"
                        value={student.emergencyContact}
                        onChange={(e) => setStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Notas Adicionais</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Observações e informações complementares
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Adicione observações importantes sobre o aluno..."
                      value={student.notes}
                      onChange={(e) => setStudent(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Physical Assessments Tab */}
          <TabsContent value="physical">
            {loadingStates.physical ? (
              <TabLoading />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações Físicas</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Histórico de avaliações físicas do aluno
                          </CardDescription>
                        </div>
                      </div>
                      <Button 
                        onClick={() => router.push(`/dashboard/physical-assessments/new?student=${params.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Avaliação
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {physicalAssessments.length > 0 ? (
                        physicalAssessments.map((assessment: any) => (
                          <Card key={assessment.id} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-sm hover:shadow-md rounded-2xl">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="font-medium text-gray-700 dark:text-gray-200">
                                        Peso: {assessment.weight}kg
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-medium text-gray-700 dark:text-gray-200">
                                        Gordura: {assessment.fat_percentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-100 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center shadow-2xl">
                              <Activity className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Nenhuma avaliação física encontrada
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Comece criando a primeira avaliação física do aluno
                          </p>
                          <Button
                            onClick={() => router.push(`/dashboard/physical-assessments/new?student=${params.id}`)}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Criar Primeira Avaliação
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Postural Assessments Tab */}
          <TabsContent value="postural">
            {loadingStates.postural ? (
              <TabLoading />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Camera className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Avaliações Posturais</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Histórico de avaliações posturais do aluno
                          </CardDescription>
                        </div>
                      </div>
                      <Button 
                        onClick={() => router.push(`/dashboard/posture-assessments/new?student=${params.id}`)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-semibold"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Avaliação
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posturalAssessments.length > 0 ? (
                        posturalAssessments.map((assessment: any) => (
                          <Card key={assessment.id} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-4 border-l-purple-500 dark:border-l-purple-400 shadow-sm hover:shadow-md rounded-2xl">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {assessment.front_image_url && (
                                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                                        Frontal
                                      </Badge>
                                    )}
                                    {assessment.side_image_url && (
                                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                        Lateral
                                      </Badge>
                                    )}
                                    {assessment.back_image_url && (
                                      <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        Posterior
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}
                                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
                              <Camera className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Nenhuma avaliação postural encontrada
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Comece criando a primeira avaliação postural do aluno
                          </p>
                          <Button
                            onClick={() => router.push(`/dashboard/posture-assessments/new?student=${params.id}`)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-semibold"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Criar Primeira Avaliação
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Media Files Tab */}
          <TabsContent value="media">
            {loadingStates.media ? (
              <TabLoading />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <Image className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Arquivos de Mídia</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Fotos e vídeos compartilhados pelo aluno
                          </CardDescription>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 font-semibold">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-20">
                      <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-100 via-yellow-100 to-red-100 dark:from-orange-900/30 dark:via-yellow-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl">
                          <Image className="h-16 w-16 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Nenhum arquivo de mídia encontrado
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Os arquivos compartilhados pelo aluno aparecerão aqui
                      </p>
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 font-semibold">
                        <Upload className="mr-2 h-5 w-5" />
                        Fazer Upload
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}