'use client';

import { useState, useEffect, useCallback } from "react";
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
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2, Upload, Video, X, Grid, LayoutList } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";

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

export default function ExercisesPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    description: "",
    muscleGroups: [],
    equipment: [],
    variations: "",
    videoUrl: "",
    tips: "",
    commonErrors: "",
  });

  const fetchExercises = useCallback(async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setExercises(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar exercícios",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  interface HandleVideoUploadProps {
    file: File;
  }

  interface SupabaseUploadProgressEvent {
    loaded: number;
    total: number;
  }

  const handleVideoUpload = async (file: File): Promise<void> => {
    try {
      setVideoFile(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data, error }: { data: any; error: any } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } }: { data: { publicUrl: string } } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath);

      setNewExercise(prev => ({
        ...prev,
        videoUrl: publicUrl
      }));

      toast({
        title: "Vídeo enviado com sucesso",
        description: "Seu vídeo foi enviado e vinculado ao exercício.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload do vídeo",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setUploadProgress(0);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setNewExercise(prev => ({
      ...prev,
      videoUrl: ""
    }));
  };

  const handleSaveExercise = async () => {
    try {
      setIsLoading(true);
      
      const exerciseData = {
        name: newExercise.name,
        description: newExercise.description,
        muscle_group: newExercise.muscleGroups,
        equipment: newExercise.equipment,
        variations: newExercise.variations.split('\n').filter(v => v.trim()),
        video_url: newExercise.videoUrl || null,
        tips: newExercise.tips.split('\n').filter(t => t.trim()),
        common_errors: newExercise.commonErrors.split('\n').filter(e => e.trim()),
      };

      const url = isEditing ? `/api/exercises/${currentExerciseId}` : '/api/exercises';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        title: isCloning ? "Exercício clonado com sucesso" : (isEditing ? "Exercício atualizado com sucesso" : "Exercício adicionado com sucesso"),
        description: isCloning ? "Uma cópia do exercício foi criada." : (isEditing ? "O exercício foi atualizado." : "O novo exercício foi adicionado à sua biblioteca."),
      });
      
      await fetchExercises();
      handleCancel();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar exercício",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface Exercise {
    id: string;
    name: string;
    description: string;
    muscle_group: string[];
    equipment: string[];
    variations?: string[];
    video_url?: string;
    tips?: string[];
    common_errors?: string[];
  }

  interface NewExercise {
    name: string;
    description: string;
    muscleGroups: string[];
    equipment: string[];
    variations: string;
    videoUrl: string;
    tips: string;
    commonErrors: string;
  }

  const handleEditClick = (exercise: Exercise): void => {
    setIsEditing(true);
    setIsCloning(false);
    setCurrentExerciseId(exercise.id);
    setNewExercise({
      name: exercise.name,
      description: exercise.description,
      muscleGroups: exercise.muscle_group,
      equipment: exercise.equipment,
      variations: exercise.variations?.join('\n') || '',
      videoUrl: exercise.video_url || '',
      tips: exercise.tips?.join('\n') || '',
      commonErrors: exercise.common_errors?.join('\n') || '',
    });
    setIsAddingExercise(true);
  };

  interface CloneExercise {
    name: string;
    description: string;
    muscle_group: string[];
    equipment: string[];
    variations?: string[];
    video_url?: string;
    tips?: string[];
    common_errors?: string[];
  }

  const handleCloneClick = (exercise: CloneExercise): void => {
    setIsEditing(false);
    setIsCloning(true);
    setCurrentExerciseId(null);
    setNewExercise({
      name: `${exercise.name} (Cópia)`,
      description: exercise.description,
      muscleGroups: exercise.muscle_group,
      equipment: exercise.equipment,
      variations: exercise.variations?.join('\n') || '',
      videoUrl: exercise.video_url || '',
      tips: exercise.tips?.join('\n') || '',
      commonErrors: exercise.common_errors?.join('\n') || '',
    });
    setIsAddingExercise(true);
  };

  interface DeleteExercise {
    id: string;
    name: string;
  }

  const handleDeleteExercise = async (exercise: DeleteExercise): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response: Response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'DELETE',
      });

      const data: { error?: string } = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Exercício deletado",
        description: `${exercise.name} foi removido da sua biblioteca.`,
      });
      
      await fetchExercises();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar exercício",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingExercise(false);
    setIsEditing(false);
    setIsCloning(false);
    setCurrentExerciseId(null);
    setNewExercise({
      name: "",
      description: "",
      muscleGroups: [],
      equipment: [],
      variations: "",
      videoUrl: "",
      tips: "",
      commonErrors: "",
    });
    setVideoFile(null);
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMuscle = 
      muscleFilter === "all" || 
      exercise.muscle_group.includes(muscleFilter);
    
    const matchesEquipment = 
      equipmentFilter === "all" || 
      exercise.equipment.includes(equipmentFilter);

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercícios</h2>
          <p className="text-muted-foreground">
            Gerencie sua biblioteca de exercícios
          </p>
        </div>
        <Button onClick={() => setIsAddingExercise(true)} disabled={isAddingExercise}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Exercício
        </Button>
      </div>

      {isAddingExercise && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCloning ? 'Clonar Exercício' : (isEditing ? 'Editar Exercício' : 'Adicionar Novo Exercício')}
            </CardTitle>
            <CardDescription>
              {isCloning ? 'Crie uma cópia de um exercício existente' : (isEditing ? 'Atualize os detalhes do exercício' : 'Crie um novo exercício para sua biblioteca')}
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
                  <Label>Adicionar Vídeo</Label>
                  {!videoFile && !newExercise.videoUrl && (
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
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Clique para fazer upload ou cole uma URL
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MP4, WebM ou OGG (máx. 100MB)
                        </span>
                      </label>
                    </div>
                  )}

                  {(videoFile || newExercise.videoUrl) && (
                    <div className="relative border rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-4">
                        <Video className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {videoFile?.name || "Vídeo carregado"}
                          </p>
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeVideo}
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
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSaveExercise} disabled={isLoading}>
                {isLoading ? 
                  (isCloning ? "Clonando..." : (isEditing ? "Atualizando..." : "Adicionando...")) : 
                  (isCloning ? "Clonar Exercício" : (isEditing ? "Atualizar Exercício" : "Adicionar Exercício"))}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Biblioteca de Exercícios</CardTitle>
                <CardDescription>
                  Navegue e gerencie sua coleção de exercícios
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercícios..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Muscle Group</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Equipment</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-video bg-muted">
                    {exercise.video_url ? (
                      <video
                        src={exercise.video_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-primary opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={() => handleEditClick(exercise)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={() => handleCloneClick(exercise)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={() => handleDeleteExercise(exercise)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {exercise.muscle_group.map((group) => (
                        <Badge 
                          key={group} 
                          variant="outline" 
                          className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Equipment: {exercise.equipment.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-card"
                >
                  <div className="w-40 h-24 relative rounded-md overflow-hidden bg-muted">
                    {exercise.video_url ? (
                      <video
                        src={exercise.video_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-primary opacity-80" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscle_group.map((group) => (
                        <Badge 
                          key={group} 
                          variant="outline" 
                          className="text-xs bg-primary/5"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(exercise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCloneClick(exercise)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExercise(exercise)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}