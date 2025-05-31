'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2, Upload, Video, X } from "lucide-react";
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
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState(null);
  
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscleGroups: [],
    equipment: [],
    variations: "",
    videoUrl: "",
    tips: "",
    commonErrors: "",
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
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
        title: "Error fetching exercises",
        description: error.message,
      });
    }
  };

  const handleVideoUpload = async (file) => {
    try {
      setVideoFile(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath);

      setNewExercise(prev => ({
        ...prev,
        videoUrl: publicUrl
      }));

      toast({
        title: "Video uploaded successfully",
        description: "Your video has been uploaded and linked to the exercise.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading video",
        description: error.message,
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
        title: isEditing ? "Exercise updated successfully" : "Exercise added successfully",
        description: isEditing ? "The exercise has been updated." : "The new exercise has been added to your library.",
      });
      
      await fetchExercises();
      handleCancel();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: isEditing ? "Error updating exercise" : "Error adding exercise",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (exercise) => {
    setIsEditing(true);
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

  const handleCloneExercise = async (exercise) => {
    try {
      setIsLoading(true);
      
      const cloneData = {
        name: `${exercise.name} (Copy)`,
        description: exercise.description,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment,
        variations: exercise.variations,
        video_url: exercise.video_url,
        tips: exercise.tips,
        common_errors: exercise.common_errors,
      };

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Exercise cloned successfully",
        description: `A copy of ${exercise.name} has been created.`,
      });
      
      await fetchExercises();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error cloning exercise",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (exercise) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Exercise deleted",
        description: `${exercise.name} has been removed from your library.`,
      });
      
      await fetchExercises();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting exercise",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingExercise(false);
    setIsEditing(false);
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

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscle_group.some(group => group.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercises</h2>
          <p className="text-muted-foreground">
            Manage your exercise library.
          </p>
        </div>
        <Button onClick={() => setIsAddingExercise(true)} disabled={isAddingExercise}>
          <Plus className="mr-2 h-4 w-4" /> Add Exercise
        </Button>
      </div>

      {isAddingExercise && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Exercise' : 'Add New Exercise'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update exercise details' : 'Create a new exercise for your library'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Exercise Name *</Label>
                  <Input
                    id="name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Barbell Bench Press"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newExercise.description}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the exercise..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Muscle Groups *</Label>
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
                  <Label>Equipment *</Label>
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
                  <Label>Demonstration Video</Label>
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
                          Click to upload or paste a URL
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MP4, WebM or OGG (max. 100MB)
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
                            {videoFile?.name || "Video loaded"}
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
                    <Label htmlFor="videoUrl">Or paste a video URL</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://example.com/video.mp4"
                      value={newExercise.videoUrl}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, videoUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="variations">Variations (one per line)</Label>
                  <Textarea
                    id="variations"
                    value={newExercise.variations}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, variations: e.target.value }))}
                    placeholder="e.g., Dumbbell Press&#10;Smith Machine Press&#10;Incline Press"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="tips">Execution Tips (one per line)</Label>
                  <Textarea
                    id="tips"
                    value={newExercise.tips}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, tips: e.target.value }))}
                    placeholder="Enter tips for proper execution..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="commonErrors">Common Errors to Avoid (one per line)</Label>
                  <Textarea
                    id="commonErrors"
                    value={newExercise.commonErrors}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, commonErrors: e.target.value }))}
                    placeholder="List common mistakes to avoid..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveExercise} disabled={isLoading}>
                {isLoading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Exercise" : "Add Exercise")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Exercise Library</CardTitle>
              <CardDescription>
                Browse and manage your collection of exercises
              </CardDescription>
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      onClick={() => handleEditClick(exercise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      onClick={() => handleCloneExercise(exercise)}
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
                      <Badge key={group} variant="outline" className="text-xs">
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
        </CardContent>
      </Card>
    </div>
  );
}