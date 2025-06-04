'use client';

import { useState } from "react";
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
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2, Upload, Video, X, Grid, LayoutList, Dumbbell, Eye, List, Library } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DataPagination } from "@/components/ui/data-pagination";

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
  tips: string;
  commonErrors: string;
}

export default function ExercisesPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { 
    exercises, 
    loading, 
    pagination,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadVideo,
    changePage,
    changePageSize
  } = useExercises();

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

  // Filter exercises based on search query and filters
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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload do vídeo",
        description: error.message,
      });
    } finally {
      setUploadProgress(0);
    }
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

      if (isEditing) {
        await updateExercise(currentExerciseId!, exerciseData);
      } else {
        await addExercise(exerciseData);
      }

      toast({
        title: isCloning ? "Exercício clonado" : (isEditing ? "Exercício atualizado" : "Exercício adicionado"),
        description: isCloning ? "Uma cópia do exercício foi criada." : (isEditing ? "O exercício foi atualizado." : "O novo exercício foi adicionado à sua biblioteca."),
      });

      handleCancel();

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

  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteExercise(id);
    } catch (error: any) {
      // Error handling is done in the hook
    }
  };

  const handleAddExerciseClick = () => {
    router.push('/dashboard/exercises/new');
  };

  const handleViewExerciseDetails = (id: string) => {
    router.push(`/dashboard/exercises/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando exercícios...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos os dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Exercícios</h2>
                  <p className="text-muted-foreground">
                    Gerencie sua biblioteca de exercícios
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddExerciseClick}
              className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs">Adicionar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="bg-background/60 backdrop-blur-xl border border-primary/20 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm text-muted-foreground">Biblioteca de Exercícios</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Navegue e gerencie sua coleção de exercícios
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-12 w-12 rounded-xl"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-12 w-12 rounded-xl"
                >
                  <LayoutList className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercícios por nome..."
                  className="pl-10 bg-background/70 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5" />
                    <span>Grupo Muscular</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5" />
                    <span>Equipamento</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                  <SelectItem value="all">Todos os equipamentos</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
              <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Nenhum exercício encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || muscleFilter !== 'all' || equipmentFilter !== 'all'
                  ? "Tente ajustar os filtros de busca"
                  : "Adicione novos exercícios para começar"}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30 group overflow-hidden cursor-pointer"
                  onClick={() => handleViewExerciseDetails(exercise.id)}
                >
                  <div className="relative aspect-video bg-muted/50">
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/exercises/${exercise.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar exercício</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCloning(true);
                              setNewExercise({
                                name: `${exercise.name} (Cópia)`,
                                description: exercise.description,
                                muscleGroups: exercise.muscle_group,
                                equipment: exercise.equipment,
                                variations: (exercise.variations || []).join('\n'),
                                videoUrl: exercise.video_url || '',
                                tips: (exercise.tips || []).join('\n'),
                                commonErrors: (exercise.common_errors || []).join('\n'),
                              });
                              setIsAddingExercise(true);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clonar exercício</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExercise(exercise.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir exercício</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{exercise.name}</h3>
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
                      Equipamento: <span className="text-foreground">{exercise.equipment.join(", ")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-background/50 backdrop-blur-sm cursor-pointer"
                  onClick={() => handleViewExerciseDetails(exercise.id)}
                >
                  <div className="w-40 h-24 relative rounded-md overflow-hidden bg-muted/50">
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
                    <h3 className="font-semibold text-lg line-clamp-1">{exercise.name}</h3>
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

                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 bg-background/70 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/exercises/${exercise.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar exercício</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 bg-background/70 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCloning(true);
                            setNewExercise({
                              name: `${exercise.name} (Cópia)`,
                              description: exercise.description,
                              muscleGroups: exercise.muscle_group,
                              equipment: exercise.equipment,
                              variations: (exercise.variations || []).join('\n'),
                              videoUrl: exercise.video_url || '',
                              tips: (exercise.tips || []).join('\n'),
                              commonErrors: (exercise.common_errors || []).join('\n'),
                            });
                            setIsAddingExercise(true);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clonar exercício</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 bg-background/70 backdrop-blur-sm hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExercise(exercise.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir exercício</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredExercises.length > 0 && (
            <DataPagination
              page={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}