"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, PlayCircle, Edit, Trash2 } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const MUSCLE_GROUPS = [
  "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Full Body", "Cardio"
];

const MOCK_EXERCISES = [
  {
    id: "1",
    name: "Barbell Bench Press",
    description: "A compound exercise that targets the chest, shoulders, and triceps.",
    muscleGroups: ["Chest", "Shoulders", "Arms"],
    equipment: ["Barbell", "Bench"],
    variations: ["Flat", "Incline", "Decline"],
    videoUrl: "https://example.com/bench-press.mp4",
    tips: [
      "Keep your feet flat on the ground",
      "Maintain a slight arch in your lower back",
      "Lower the bar to mid-chest"
    ],
    commonErrors: [
      "Bouncing the bar off the chest",
      "Lifting hips off the bench",
      "Inconsistent bar path"
    ]
  },
  {
    id: "2",
    name: "Pull-up",
    description: "A bodyweight exercise that targets the back and biceps.",
    muscleGroups: ["Back", "Arms"],
    equipment: ["Pull-up Bar"],
    variations: ["Wide Grip", "Close Grip", "Neutral Grip"],
    videoUrl: "https://example.com/pull-up.mp4",
    tips: [
      "Engage your core throughout the movement",
      "Pull your shoulders down and back",
      "Focus on a controlled descent"
    ],
    commonErrors: [
      "Insufficient range of motion",
      "Swinging the body",
      "Using momentum"
    ]
  },
  {
    id: "3",
    name: "Squat",
    description: "A fundamental compound exercise that targets primarily the legs and glutes.",
    muscleGroups: ["Legs"],
    equipment: ["Bodyweight", "Barbell", "Dumbbell"],
    variations: ["Bodyweight", "Back Squat", "Front Squat"],
    videoUrl: "https://example.com/squat.mp4",
    tips: [
      "Keep your chest up",
      "Push your knees out in the direction of your toes",
      "Aim for proper depth (thighs parallel to ground)"
    ],
    commonErrors: [
      "Knees caving in",
      "Heels coming off the floor",
      "Insufficient depth"
    ]
  },
  {
    id: "4",
    name: "Plank",
    description: "An isometric core exercise that builds stability and endurance.",
    muscleGroups: ["Core"],
    equipment: ["Bodyweight"],
    variations: ["Standard", "Side Plank", "Forearm Plank"],
    videoUrl: "https://example.com/plank.mp4",
    tips: [
      "Keep your body in a straight line",
      "Engage your core and glutes",
      "Maintain normal breathing"
    ],
    commonErrors: [
      "Sagging hips",
      "Elevating the hips too high",
      "Holding breath"
    ]
  }
];

export default function ExercisesPage() {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscleGroups: [] as string[],
    equipment: "",
    variations: "",
    videoUrl: "",
    tips: "",
    commonErrors: "",
  });

  // Filter exercises based on search query and muscle filter
  const filteredExercises = MOCK_EXERCISES.filter((exercise) => {
    const matchesQuery = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === "all" || 
                          exercise.muscleGroups.includes(muscleFilter);
    
    return matchesQuery && matchesMuscle;
  });

  const handleAddExercise = async () => {
    try {
      // In a real implementation, we would add the exercise to the database
      
      toast({
        title: "Exercise added",
        description: `${newExercise.name} has been added to your exercise library`,
      });
      
      setIsAddExerciseOpen(false);
      setNewExercise({
        name: "",
        description: "",
        muscleGroups: [],
        equipment: "",
        variations: "",
        videoUrl: "",
        tips: "",
        commonErrors: "",
      });
      
      // Refresh exercise list (in real implementation)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding exercise",
        description: error.message || "An error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercise Library</h2>
          <p className="text-muted-foreground">
            Manage and organize your exercise catalog for workouts.
          </p>
        </div>
        <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
              <DialogDescription>
                Create a new exercise to add to your library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Barbell Bench Press" 
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the exercise" 
                    value={newExercise.description}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="muscleGroups">Muscle Groups</Label>
                  <Select 
                    value={newExercise.muscleGroups[0] || ""} 
                    onValueChange={(value) => setNewExercise(prev => ({ ...prev, muscleGroups: [value] }))}
                  >
                    <SelectTrigger id="muscleGroups">
                      <SelectValue placeholder="Select primary muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_GROUPS.map((muscle) => (
                        <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Input 
                    id="equipment" 
                    placeholder="e.g. Barbell, Bench" 
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, equipment: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variations">Variations (comma separated)</Label>
                  <Input 
                    id="variations" 
                    placeholder="e.g. Flat, Incline, Decline" 
                    value={newExercise.variations}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, variations: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (optional)</Label>
                  <Input 
                    id="videoUrl" 
                    placeholder="https://example.com/video.mp4" 
                    value={newExercise.videoUrl}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, videoUrl: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tips">Tips (one per line)</Label>
                  <Textarea 
                    id="tips" 
                    placeholder="Enter tips for proper form" 
                    value={newExercise.tips}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, tips: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commonErrors">Common Errors (one per line)</Label>
                  <Textarea 
                    id="commonErrors" 
                    placeholder="List common mistakes to avoid" 
                    value={newExercise.commonErrors}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, commonErrors: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExerciseOpen(false)}>Cancel</Button>
              <Button onClick={handleAddExercise}>Add Exercise</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Exercise Library</CardTitle>
          <CardDescription>
            Browse, filter, and manage your exercise collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
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
                    <SelectValue placeholder="Filter by muscle" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "grid" | "list")}>
                <TabsList className="grid w-[100px] grid-cols-2">
                  <TabsTrigger value="grid">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <TabsContent value="grid" className="m-0">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No exercises found. Try adjusting your filters or add new exercises.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-primary opacity-80" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
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
                        {exercise.muscleGroups.map((group) => (
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
            )}
          </TabsContent>
          
          <TabsContent value="list" className="m-0">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No exercises found. Try adjusting your filters or add new exercises.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Muscle Groups</th>
                      <th className="py-3 px-4 text-left font-medium hidden lg:table-cell">Equipment</th>
                      <th className="py-3 px-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.map((exercise) => (
                      <tr key={exercise.id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 md:hidden">
                            {exercise.muscleGroups.join(", ")}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {exercise.muscleGroups.map((group) => (
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
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}