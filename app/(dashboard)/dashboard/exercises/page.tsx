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
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2, Upload, Video, X, Grid, LayoutList, Dumbbell, Eye, List, Library, Zap, TrendingUp, Target } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Exercícios
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">{filteredExercises.length}</span> exercício{filteredExercises.length !== 1 ? 's' : ''} • Biblioteca Avançada
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddExerciseClick}
                variant="outline"
                className="min-h-[44px]  bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Novo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {filteredExercises.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">Total</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{exercises.length}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Com Vídeo</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {exercises.filter(e => e.video_url).length}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(exercises.filter(e => e.video_url).length / Math.max(exercises.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Grupos Musculares</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {new Set(exercises.flatMap(e => e.muscle_group)).size}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((new Set(exercises.flatMap(e => e.muscle_group)).size / MUSCLE_GROUPS.length) * 100, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Glassmorphism Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
                    <Input
                      placeholder="Buscar exercícios por nome ou descrição..."
                      className="pl-12 h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                    <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Grupo Muscular</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                      <SelectItem value="all">Todos os grupos</SelectItem>
                      {MUSCLE_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger className="w-[220px] h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Equipamento</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                      <SelectItem value="all">Todos os equipamentos</SelectItem>
                      {EQUIPMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 shadow-lg backdrop-blur-sm">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-10 w-10 rounded-lg"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {filteredExercises.length === 0 ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="text-center py-24">
                  <div className="relative mb-8">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
                      <Dumbbell className="h-20 w-20 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                  </div>

                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
                    {searchQuery || muscleFilter !== 'all' || equipmentFilter !== 'all' ? 'Nenhum exercício encontrado' : 'Construa sua Biblioteca!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    {searchQuery || muscleFilter !== 'all' || equipmentFilter !== 'all'
                      ? "Ajuste os filtros de busca para encontrar o exercício que você procura"
                      : "Comece a criar sua biblioteca personalizada de exercícios para oferecer treinos ainda mais eficazes aos seus alunos"}
                  </p>

                  <Button
                    onClick={handleAddExerciseClick}
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-110 border-0"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    {searchQuery || muscleFilter !== 'all' || equipmentFilter !== 'all' ? 'Adicionar Exercício' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExercises.map((exercise, index) => (
                <div key={exercise.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleViewExerciseDetails(exercise.id)}>

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
                      {exercise.video_url ? (
                        <video
                          src={exercise.video_url}
                          className="w-full h-full object-cover"
                          controls
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full backdrop-blur-sm">
                            <PlayCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      )}

                      {/* Action buttons overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 shadow-lg"
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
                              className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 shadow-lg"
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
                              className="h-9 w-9 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg"
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

                    <CardContent className="relative p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent line-clamp-1 mb-2">
                          {exercise.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {exercise.description}
                        </p>
                      </div>

                      {/* Muscle Groups */}
                      <div className="flex flex-wrap gap-2">
                        {exercise.muscle_group.slice(0, 3).map((group) => (
                          <Badge
                            key={group}
                            className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600 rounded-full text-xs font-semibold"
                          >
                            {group}
                          </Badge>
                        ))}
                        {exercise.muscle_group.length > 3 && (
                          <Badge className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs">
                            +{exercise.muscle_group.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Equipment */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                          Equipamentos
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                          {exercise.equipment.join(", ")}
                        </div>
                      </div>

                      {/* Video indicator */}
                      {exercise.video_url && (
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <Video className="h-4 w-4" />
                          <span className="text-xs font-semibold">Com vídeo demonstrativo</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
                    onClick={() => handleViewExerciseDetails(exercise.id)}>

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                    <CardContent className="relative p-6">
                      <div className="flex items-center gap-6">
                        {/* Video thumbnail */}
                        <div className="w-40 h-24 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
                          {exercise.video_url ? (
                            <video
                              src={exercise.video_url}
                              className="w-full h-full object-cover"
                              controls
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full backdrop-blur-sm">
                                <PlayCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent line-clamp-1 mb-2">
                              {exercise.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {exercise.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Muscle Groups */}
                            <div className="space-y-2">
                              <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                                Grupos Musculares
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {exercise.muscle_group.map((group) => (
                                  <Badge
                                    key={group}
                                    className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-600 rounded-full text-xs font-semibold"
                                  >
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Equipment */}
                            <div className="space-y-2">
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                                Equipamentos
                              </div>
                              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                {exercise.equipment.join(", ")}
                              </div>
                            </div>
                          </div>

                          {/* Additional info */}
                          <div className="flex items-center gap-4 text-sm">
                            {exercise.video_url && (
                              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <Video className="h-4 w-4" />
                                <span className="font-semibold">Com vídeo</span>
                              </div>
                            )}
                            {exercise.variations && exercise.variations.length > 0 && (
                              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <Target className="h-4 w-4" />
                                <span className="font-semibold">{exercise.variations.length} variações</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-xl"
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
                                className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-xl"
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
                                className="h-10 w-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 shadow-lg rounded-xl"
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
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredExercises.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <DataPagination
                  page={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  totalPages={pagination.totalPages}
                  onPageChange={changePage}
                  onPageSizeChange={changePageSize}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}