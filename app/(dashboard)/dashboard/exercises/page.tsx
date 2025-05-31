'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2 } from "lucide-react";
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

type Exercise = {
  id: string;
  name: string;
  description: string;
  video_url: string | null;
  muscle_group: string[];
  equipment: string[];
  variations: string[];
  tips: string[];
  common_errors: string[];
};

export default function ExercisesPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscleGroups: [] as string[],
    equipment: [] as string[],
    variations: "",
    videoUrl: "",
    tips: "",
    commonErrors: "",
  });

  const handleAddExercise = async () => {
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

      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Exercício adicionado",
        description: `${newExercise.name} foi adicionado à sua biblioteca`,
      });
      
      setExercises([...exercises, data]);
      handleCloseDialog();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExercise = async () => {
    if (!currentExercise) return;

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

      const { data, error } = await supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', currentExercise.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Exercício atualizado",
        description: `${newExercise.name} foi atualizado com sucesso`,
      });
      
      setExercises(exercises.map(ex => ex.id === currentExercise.id ? data : ex));
      handleCloseDialog();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneExercise = async (exercise: Exercise) => {
    try {
      setIsLoading(true);
      
      const cloneData = {
        ...exercise,
        name: `${exercise.name} (Cópia)`,
        id: undefined
      };

      const { data, error } = await supabase
        .from('exercises')
        .insert([cloneData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Exercício clonado",
        description: `Uma cópia de ${exercise.name} foi criada`,
      });
      
      setExercises([...exercises, data]);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao clonar exercício",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exercise.id);

      if (error) throw error;

      toast({
        title: "Exercício excluído",
        description: `${exercise.name} foi removido da sua biblioteca`,
      });
      
      setExercises(exercises.filter(ex => ex.id !== exercise.id));
      
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

  const handleCloseDialog = () => {
    setIsAddExerciseOpen(false);
    setIsEditMode(false);
    setCurrentExercise(null);
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
  };

  const handleEditClick = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setNewExercise({
      name: exercise.name,
      description: exercise.description,
      muscleGroups: exercise.muscle_group,
      equipment: exercise.equipment,
      variations: exercise.variations.join('\n'),
      videoUrl: exercise.video_url || "",
      tips: exercise.tips.join('\n'),
      commonErrors: exercise.common_errors.join('\n'),
    });
    setIsEditMode(true);
    setIsAddExerciseOpen(true);
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesQuery = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || 
                          exercise.muscle_group.includes(muscleFilter);
    
    return matchesQuery && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercícios</h2>
          <p className="text-muted-foreground">
            Gerencie sua biblioteca de exercícios.
          </p>
        </div>
        <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Exercício
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar Exercício" : "Adicionar Novo Exercício"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Atualize as informações do exercício" : "Crie um novo exercício para sua biblioteca"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Exercício</Label>
                  <Input 
                    id="name" 
                    placeholder="ex: Supino Reto com Barra" 
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva o exercício" 
                    value={newExercise.description}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Grupos Musculares</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                        />
                        <label htmlFor={muscle}>{muscle}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipamentos</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                        />
                        <label htmlFor={equipment}>{equipment}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variations">Variações (uma por linha)</Label>
                  <Textarea 
                    id="variations" 
                    placeholder="ex: Com Halter&#10;Com Barra&#10;Na Polia" 
                    value={newExercise.variations}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, variations: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL do Vídeo (opcional)</Label>
                  <Input 
                    id="videoUrl" 
                    placeholder="https://exemplo.com/video.mp4" 
                    value={newExercise.videoUrl}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, videoUrl: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tips">Dicas de Execução (uma por linha)</Label>
                  <Textarea 
                    id="tips" 
                    placeholder="Digite as dicas para execução correta" 
                    value={newExercise.tips}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, tips: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commonErrors">Erros Comuns (um por linha)</Label>
                  <Textarea 
                    id="commonErrors" 
                    placeholder="Liste os erros comuns a evitar" 
                    value={newExercise.commonErrors}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, commonErrors: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button 
                onClick={isEditMode ? handleEditExercise : handleAddExercise}
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Adicionar Exercício"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Biblioteca de Exercícios</CardTitle>
          <CardDescription>
            Navegue, filtre e gerencie sua coleção de exercícios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por músculo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Grupos</SelectItem>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-1 rounded-md bg-muted p-1">
                <Button
                  variant={currentView === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('grid')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </Button>
                <Button
                  variant={currentView === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </Button>
              </div>
            </div>
          </div>
          
          {currentView === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Nenhum exercício encontrado. Ajuste os filtros ou adicione novos exercícios.
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="overflow-hidden">
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
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                          onClick={() => handleEditClick(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                          onClick={() => handleCloneExercise(exercise)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-background/80 backdrop-blur-sm"
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
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Equipamentos: {exercise.equipment.join(", ")}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
          
          {currentView === 'list' && (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Nome</th>
                    <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Grupos Musculares</th>
                    <th className="py-3 px-4 text-left font-medium hidden lg:table-cell">Equipamentos</th>
                    <th className="py-3 px-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExercises.map((exercise) => (
                    <tr key={exercise.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 md:hidden">
                          {exercise.muscle_group.join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscle_group.map((group) => (
                            <Badge key={group} variant="outline" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {exercise.equipment.join(", ")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {exercise.video_url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(exercise)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCloneExercise(exercise)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteExercise(exercise)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}