'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Video, X, Sparkles, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";

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

interface NewExercise {
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  variations: string;
  videoUrl: string;
  audioUrl?: string;
  tips: string;
  commonErrors: string;
}

export default function NewExercisePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const { 
    addExercise,
    uploadVideo,
    uploadAudio,
    generateWithAI,
    generateAudioWithAI,
  } = useExercises();

  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    description: "",
    muscleGroups: [],
    equipment: [],
    variations: "",
    videoUrl: "",
    audioUrl: "",
    tips: "",
    commonErrors: "",
  });

  const handleGenerateWithAI = async () => {
    if (!newExercise.name) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do exercício para gerar com IA.",
      });
      return;
    }

    try {
      setIsGeneratingAI(true);
      const data = await generateWithAI(newExercise.name);
      
      setNewExercise(prev => ({
        ...prev,
        description: data.description,
        muscleGroups: data.muscle_group,
        equipment: data.equipment,
        variations: data.variations.join('\n'),
        tips: data.tips.join('\n'),
        commonErrors: data.common_errors.join('\n')
      }));

      toast({
        title: "Conteúdo gerado com sucesso",
        description: "As informações foram preenchidas automaticamente pela IA.",
      });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!newExercise.description || !newExercise.tips) {
      toast({
        variant: "destructive",
        title: "Informações necessárias",
        description: "Descrição e dicas são necessárias para gerar o áudio.",
      });
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const audioUrl = await generateAudioWithAI(
        newExercise.description,
        newExercise.tips.split('\n').filter(t => t.trim())
      );
      
      setNewExercise(prev => ({
        ...prev,
        audioUrl
      }));

      toast({
        title: "Áudio gerado com sucesso",
        description: "O áudio foi gerado e vinculado ao exercício.",
      });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setVideoFile(file);
      const url = await uploadVideo(file);
      setNewExercise(prev => ({
        ...prev,
        videoUrl: url
      }));

      toast({
        title: "Vídeo enviado com sucesso",
        description: "Seu vídeo foi enviado e vinculado ao exercício.",
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      setAudioFile(file);
      const url = await uploadAudio(file);
      setNewExercise(prev => ({
        ...prev,
        audioUrl: url
      }));

      toast({
        title: "Áudio enviado com sucesso",
        description: "Seu áudio foi enviado e vinculado ao exercício.",
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const exerciseData = {
        name: newExercise.name,
        description: newExercise.description,
        muscle_group: newExercise.muscleGroups,
        equipment: newExercise.equipment,
        variations: newExercise.variations.split('\n').filter(v => v.trim()),
        video_url: newExercise.videoUrl || null,
        audio_url: newExercise.audioUrl || null,
        tips: newExercise.tips.split('\n').filter(t => t.trim()),
        common_errors: newExercise.commonErrors.split('\n').filter(e => e.trim()),
      };

      await addExercise(exerciseData);

      toast({
        title: "Exercício adicionado",
        description: "O novo exercício foi adicionado à sua biblioteca.",
      });

      router.push('/dashboard/exercises');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Novo Exercício</h2>
            <p className="text-muted-foreground">
              Adicione um novo exercício à sua biblioteca
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleGenerateWithAI}
          disabled={isGeneratingAI || !newExercise.name}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGeneratingAI ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Preencha as informações básicas do exercício
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Exercício *</Label>
                  <Input
                    id="name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex.: Supino com Barra"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newExercise.description}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o exercício..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Grupos Musculares *</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 mt-2">
                    {MUSCLE_GROUPS.map((muscle) => (
                      <div key={muscle} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={muscle}
                          checked={newExercise.muscleGroups.includes(muscle)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExercise(prev => ({
                                ...prev,
                                muscleGroups: [...prev.muscleGroups, muscle]
                              }));
                            } else {
                              setNewExercise(prev => ({
                                ...prev,
                                muscleGroups: prev.muscleGroups.filter(g => g !== muscle)
                              }));
                            }
                          }}
                          className="rounded border-input"
                        />
                        <label htmlFor={muscle}>{muscle}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Equipamento *</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 mt-2">
                    {EQUIPMENT_TYPES.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={equipment}
                          checked={newExercise.equipment.includes(equipment)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExercise(prev => ({
                                ...prev,
                                equipment: [...prev.equipment, equipment]
                              }));
                            } else {
                              setNewExercise(prev => ({
                                ...prev,
                                equipment: prev.equipment.filter(eq => eq !== equipment)
                              }));
                            }
                          }}
                          className="rounded border-input"
                        />
                        <label htmlFor={equipment}>{equipment}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Vídeo Demonstrativo</Label>
                  {!videoFile && !newExercise.videoUrl ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center mt-2">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="video-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                        }}
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Video className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Clique para fazer upload ou cole uma URL
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MP4, WebM ou OGG (máx. 100MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-4">
                        <Video className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {videoFile?.name || "Vídeo carregado"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setVideoFile(null);
                            setNewExercise(prev => ({ ...prev, videoUrl: "" }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label htmlFor="videoUrl">Ou cole uma URL de vídeo</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://example.com/video.mp4"
                      value={newExercise.videoUrl}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, videoUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Áudio de Instruções</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio || !newExercise.description || !newExercise.tips}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGeneratingAudio ? "Gerando..." : "Gerar Áudio com IA"}
                    </Button>
                  </div>

                  {!audioFile && !newExercise.audioUrl ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center mt-2">
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        id="audio-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(file);
                        }}
                      />
                      <label
                        htmlFor="audio-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Mic className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Clique para fazer upload de áudio
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MP3, WAV ou OGG (máx. 10MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 mt-2">
                      <Mic className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {audioFile?.name || "Áudio carregado"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAudioFile(null);
                          setNewExercise(prev => ({ ...prev, audioUrl: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="variations">Variações (uma por linha)</Label>
                  <Textarea
                    id="variations"
                    value={newExercise.variations}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, variations: e.target.value }))}
                    placeholder="ex.: Supino com Barra, Supino com Halteres..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="tips">Dicas de Execução (uma por linha)</Label>
                  <Textarea
                    id="tips"
                    value={newExercise.tips}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, tips: e.target.value }))}
                    placeholder="Adicione dicas para realizar este exercício..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="commonErrors">Erros Comuns a Evitar (uma por linha)</Label>
                  <Textarea
                    id="commonErrors"
                    value={newExercise.commonErrors}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, commonErrors: e.target.value }))}
                    placeholder="Liste erros comuns a evitar..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Exercício"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}