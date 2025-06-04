'use client';

import { useState, useEffect } from "react";
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
import { ArrowLeft, Trash2, Upload, Loader2, Play } from "lucide-react";
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

export default function ExerciseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    muscle_group: [] as string[],
    equipment: [] as string[],
    variations: "",
    video_url: "",
    tips: "",
    common_errors: "",
  });

  useEffect(() => {
    fetchExerciseDetails();
  }, []);

  const fetchExerciseDetails = async () => {
    try {
      const response = await fetch(`/api/exercises/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setExercise({
        name: data.name,
        description: data.description,
        muscle_group: data.muscle_group || [],
        equipment: data.equipment || [],
        variations: (data.variations || []).join('\n'),
        video_url: data.video_url || '',
        tips: (data.tips || []).join('\n'),
        common_errors: (data.common_errors || []).join('\n'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes do exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const exerciseData = {
        name: exercise.name,
        description: exercise.description,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment,
        variations: exercise.variations.split('\n').filter(v => v.trim()),
        video_url: exercise.video_url || null,
        tips: exercise.tips.split('\n').filter(t => t.trim()),
        common_errors: exercise.common_errors.split('\n').filter(e => e.trim()),
      };

      const response = await fetch(`/api/exercises/${params.id}`, {
        method: 'PUT',
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
        title: "Exercício atualizado",
        description: "As alterações foram salvas com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar exercício",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este exercício?")) {
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/exercises/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Exercício excluído",
        description: "O exercício foi removido com sucesso",
      });
      
      router.push('/dashboard/exercises');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir exercício",
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

      setExercise(prev => ({
        ...prev,
        video_url: data.url
      }));

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando detalhes do exercício...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos as informações.</p>
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
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{exercise.name}</h2>
            <p className="text-muted-foreground">
              Detalhes do Exercício
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="video">Vídeo</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Edite as informações básicas do exercício
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Exercício *</Label>
                  <Input
                    id="name"
                    value={exercise.name}
                    onChange={(e) => setExercise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex.: Supino Reto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={exercise.description}
                    onChange={(e) => setExercise(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o exercício..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grupos Musculares *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MUSCLE_GROUPS.map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={group}
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
                        />
                        <label htmlFor={group}>{group}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipamentos *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {EQUIPMENT_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type}
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
                        />
                        <label htmlFor={type}>{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vídeo Demonstrativo</CardTitle>
              <CardDescription>
                Faça upload de um vídeo demonstrando a execução correta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {exercise.video_url ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <video
                        src={exercise.video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Vídeo atual
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExercise(prev => ({ ...prev, video_url: '' }))}
                      >
                        Remover Vídeo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                    <Play className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum vídeo enviado</p>
                  </div>
                )}

                <div className="space-y-4">
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
                    <Button asChild>
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {exercise.video_url ? 'Substituir Vídeo' : 'Upload Vídeo'}
                      </label>
                    </Button>
                    {videoFile && (
                      <span className="text-sm text-muted-foreground">
                        {videoFile.name}
                      </span>
                    )}
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Adicionais</CardTitle>
              <CardDescription>
                Forneça informações detalhadas sobre o exercício
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="variations">Variações</Label>
                <Textarea
                  id="variations"
                  value={exercise.variations}
                  onChange={(e) => setExercise(prev => ({ ...prev, variations: e.target.value }))}
                  placeholder="Liste as variações do exercício (uma por linha)"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Adicione cada variação em uma nova linha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">Dicas de Execução</Label>
                <Textarea
                  id="tips"
                  value={exercise.tips}
                  onChange={(e) => setExercise(prev => ({ ...prev, tips: e.target.value }))}
                  placeholder="Liste as dicas importantes (uma por linha)"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Adicione cada dica em uma nova linha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="common_errors">Erros Comuns</Label>
                <Textarea
                  id="common_errors"
                  value={exercise.common_errors}
                  onChange={(e) => setExercise(prev => ({ ...prev, common_errors: e.target.value }))}
                  placeholder="Liste os erros comuns a serem evitados (um por linha)"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Adicione cada erro em uma nova linha
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
