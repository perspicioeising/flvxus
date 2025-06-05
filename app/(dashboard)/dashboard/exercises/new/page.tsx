// app/(dashboard)/dashboard/exercises/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Upload, Loader2, Sparkles, Volume2, Play, Dumbbell, Zap, Video, Target, Brain, Mic, FileText, Settings, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MUSCLE_GROUPS = [
  "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Inteiro", "Cardio"
];

const EQUIPMENT_TYPES = [
  "Peso Livre",
  "Máquina",
  "Cabo",
  "Peso Corporal",
  "Elástico",
  "Kettlebell",
  "TRX",
  "Outros"
];

export default function NewExercisePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    muscle_group: [] as string[],
    equipment: [] as string[],
    variations: "",
    video_url: "",
    audio_url: "",
    tips: "",
    common_errors: "",
  });

  // Function to fetch AI suggestions
  const generateWithAI = async () => {
    if (!exercise.name || exercise.name.trim() === "") {
      toast({
        variant: "destructive",
        title: "Nome do exercício necessário",
        description: "Por favor, informe o nome do exercício para gerar sugestões",
      });
      return;
    }

    try {
      setIsGeneratingAI(true);
      const response = await fetch('/api/ai/exercise-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseName: exercise.name }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update form with AI suggestions
      setExercise(prev => ({
        ...prev,
        description: data.description,
        muscle_group: data.muscle_group,
        equipment: data.equipment,
        variations: data.variations.join('\n'),
        tips: data.tips.join('\n'),
        common_errors: data.common_errors.join('\n')
      }));

      toast({
        title: "Sugestões geradas",
        description: "Os campos foram preenchidos com sugestões da IA",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar sugestões",
        description: error.message,
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateAudioWithAI = async () => {
    if (!exercise.description || exercise.description.trim() === "") {
      toast({
        variant: "destructive",
        title: "Descrição necessária",
        description: "Por favor, informe a descrição do exercício para gerar o áudio",
      });
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const response = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: exercise.description }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setAudioUrl(data.url);
      setExercise(prev => ({
        ...prev,
        audio_url: data.url
      }));

      toast({
        title: "Áudio gerado",
        description: "O áudio foi gerado com sucesso",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar áudio",
        description: error.message,
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const exerciseData = {
        name: exercise.name,
        description: exercise.description,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment,
        variations: exercise.variations.split('\n').filter(v => v.trim()),
        video_url: videoUrl || exercise.video_url,
        audio_url: audioUrl || exercise.audio_url,
        tips: exercise.tips.split('\n').filter(t => t.trim()),
        common_errors: exercise.common_errors.split('\n').filter(e => e.trim()),
      };

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Exercício criado",
        description: "O exercício foi adicionado com sucesso",
      });

      router.push('/dashboard/exercises');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setVideoFile(file);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/exercises/upload-video', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setVideoUrl(data.url);
      setUploadProgress(100);

      toast({
        title: "Vídeo enviado",
        description: "O vídeo foi enviado com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar vídeo",
        description: error.message,
      });
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      setAudioFile(file);
      setAudioUploadProgress(10);
      
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/exercises/upload-audio', {
        method: 'POST',
        body: formData,
      });

      setAudioUploadProgress(90);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setAudioUrl(data.url);
      setAudioUploadProgress(100);

      toast({
        title: "Áudio enviado",
        description: "O áudio foi enviado com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar áudio",
        description: error.message,
      });
    } finally {
      setTimeout(() => setAudioUploadProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Novo Exercício
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">Criação Inteligente</span> • Biblioteca Avançada
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-14 px-8 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0 h-14"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-3 h-5 w-5" />
                      Salvar Exercício
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
            <TabsList className="relative grid w-full grid-cols-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Mídia
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Avançado
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">

                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Informações Básicas
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Preencha as informações básicas do exercício
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={generateWithAI} 
                      disabled={isGeneratingAI || !exercise.name}
                      className="group bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 rounded-2xl h-14 px-6 font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-800 dark:text-purple-300">Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="mr-3 h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" />
                          <span className="text-purple-800 dark:text-purple-300">Gerar com IA</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Nome do Exercício *
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                        <Input
                          id="name"
                          value={exercise.name}
                          onChange={(e) => setExercise(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ex.: Supino Reto"
                          className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Descrição *
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50"></div>
                        <Textarea
                          id="description"
                          value={exercise.description}
                          onChange={(e) => setExercise(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o exercício em detalhes..."
                          className="relative min-h-[120px] text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Muscle Groups */}
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Grupos Musculares *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {MUSCLE_GROUPS.map((group) => (
                          <div key={group} className="relative group/checkbox">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-300"></div>
                            <label className="relative flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm">
                              <input
                                type="checkbox"
                                checked={exercise.muscle_group.includes(group)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setExercise(prev => ({
                                      ...prev,
                                      muscle_group: [...prev.muscle_group, group]
                                    }));
                                  } else {
                                    setExercise(prev => ({
                                      ...prev,
                                      muscle_group: prev.muscle_group.filter(g => g !== group)
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{group}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Equipamentos *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {EQUIPMENT_TYPES.map((type) => (
                          <div key={type} className="relative group/checkbox">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-300"></div>
                            <label className="relative flex items-center space-x-3 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm">
                              <input
                                type="checkbox"
                                checked={exercise.equipment.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setExercise(prev => ({
                                      ...prev,
                                      equipment: [...prev.equipment, type]
                                    }));
                                  } else {
                                    setExercise(prev => ({
                                      ...prev,
                                      equipment: prev.equipment.filter(eq => eq !== type)
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {/* Video Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Vídeo Demonstrativo
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Faça upload de um vídeo ou informe a URL do vídeo demonstrativo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="video_url" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      URL do Vídeo
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-50"></div>
                      <Input
                        id="video_url"
                        placeholder="ex.: https://example.com/video.mp4"
                        value={exercise.video_url}
                        onChange={(e) => setExercise(prev => ({ ...prev, video_url: e.target.value }))}
                        className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Informe a URL de um vídeo existente ou faça upload abaixo
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ou faça upload de um vídeo
                    </Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                        }}
                        className="hidden"
                        id="video-upload"
                      />
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl h-14 px-6 font-bold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                        <label htmlFor="video-upload" className="cursor-pointer flex items-center">
                          <Upload className="h-5 w-5 mr-3" />
                          Upload Vídeo
                        </label>
                      </Button>
                      {videoFile && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-600 rounded-full font-semibold">
                          {videoFile.name}
                        </Badge>
                      )}
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    {videoUrl && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-green-800 dark:text-green-300 font-semibold">
                            Vídeo enviado com sucesso!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audio Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Áudio de Instruções
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Faça upload de um áudio ou gere automaticamente com IA
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={generateAudioWithAI} 
                      disabled={isGeneratingAudio || !exercise.description}
                      className="group bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-600 hover:from-orange-200 hover:to-red-200 dark:hover:from-orange-800/50 dark:hover:to-red-800/50 rounded-2xl h-14 px-6 font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-600 dark:text-orange-400" />
                          <span className="text-orange-800 dark:text-orange-300">Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-3 h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />
                          <span className="text-orange-800 dark:text-orange-300">Gerar Áudio com IA</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Faça upload de um arquivo de áudio
                    </Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(file);
                        }}
                        className="hidden"
                        id="audio-upload"
                      />
                      <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl h-14 px-6 font-bold shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                        <label htmlFor="audio-upload" className="cursor-pointer flex items-center">
                          <Upload className="h-5 w-5 mr-3" />
                          Upload Áudio
                        </label>
                      </Button>
                      {audioFile && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 dark:border-purple-600 rounded-full font-semibold">
                          {audioFile.name}
                        </Badge>
                      )}
                    </div>
                    {audioUploadProgress > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${audioUploadProgress}%` }}
                        />
                      </div>
                    )}
                    {audioUrl && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-800 dark:text-purple-300 font-semibold">
                            Áudio disponível:
                          </span>
                        </div>
                        <audio controls className="w-full h-12 rounded-xl">
                          <source src={audioUrl} type="audio/mpeg" />
                          Seu navegador não suporta o elemento de áudio.
                        </audio>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Detalhes Adicionais
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Forneça informações detalhadas sobre o exercício
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="variations" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Variações
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-50"></div>
                      <Textarea
                        id="variations"
                        value={exercise.variations}
                        onChange={(e) => setExercise(prev => ({ ...prev, variations: e.target.value }))}
                        placeholder="Liste as variações do exercício (uma por linha)"
                        className="relative min-h-[120px] text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adicione cada variação em uma nova linha
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tips" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Dicas de Execução
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-50"></div>
                      <Textarea
                        id="tips"
                        value={exercise.tips}
                        onChange={(e) => setExercise(prev => ({ ...prev, tips: e.target.value }))}
                        placeholder="Liste as dicas importantes (uma por linha)"
                        className="relative min-h-[120px] text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adicione cada dica em uma nova linha
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="common_errors" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Erros Comuns
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-50"></div>
                      <Textarea
                        id="common_errors"
                        value={exercise.common_errors}
                        onChange={(e) => setExercise(prev => ({ ...prev, common_errors: e.target.value }))}
                        placeholder="Liste os erros comuns a serem evitados (um por linha)"
                        className="relative min-h-[120px] text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adicione cada erro em uma nova linha
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}