'use client';

import { useState } from "react";
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
import { Plus, Search, Filter, MoreHorizontal, Users, ArrowRight, Copy, Dumbbell, Clock, Trash2, Edit } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const GOALS = ["Strength", "Hypertrophy", "Endurance", "Power", "Weight Loss", "Rehabilitation"];

export default function WorkoutsPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    level: "",
    goal: "",
    exercises: []
  });

  const handleAddWorkout = async () => {
    try {
      setIsLoading(true);
      
      const workoutData = {
        name: newWorkout.name,
        description: newWorkout.description,
        level: newWorkout.level.toLowerCase(),
        goal: newWorkout.goal,
        exercises: newWorkout.exercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes,
          order: index + 1
        }))
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Workout created",
        description: `${newWorkout.name} has been added to your workout library`,
      });
      
      handleCloseDialog();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating workout",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsAddWorkoutOpen(false);
    setCurrentStep(1);
    setNewWorkout({
      name: "",
      description: "",
      level: "",
      goal: "",
      exercises: []
    });
    setSelectedExercises([]);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercises([...selectedExercises, {
      ...exercise,
      sets: 3,
      reps: 12,
      rest: 60,
      notes: ""
    }]);
  };

  const handleExerciseUpdate = (index, field, value) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };

  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name *</Label>
                <Input
                  id="name"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Upper Body Strength"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal *</Label>
                <Select
                  value={newWorkout.goal}
                  onValueChange={(value) => setNewWorkout(prev => ({ ...prev, goal: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newWorkout.description}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the workout's focus and objectives..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level *</Label>
              <Select
                value={newWorkout.level}
                onValueChange={(value) => setNewWorkout(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-8"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Muscle Group</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {/* Add muscle groups */}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Exercise cards for selection */}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            {selectedExercises.map((exercise, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{exercise.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseUpdate(index, 'sets', parseInt(e.target.value))}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseUpdate(index, 'reps', parseInt(e.target.value))}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rest (seconds)</Label>
                      <Input
                        type="number"
                        value={exercise.rest}
                        onChange={(e) => handleExerciseUpdate(index, 'rest', parseInt(e.target.value))}
                        min={0}
                        step={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={exercise.notes}
                        onChange={(e) => handleExerciseUpdate(index, 'notes', e.target.value)}
                        placeholder="Additional instructions..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedExercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No exercises selected. Go back to add exercises to your workout.
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workouts</h2>
          <p className="text-muted-foreground">
            Create and manage workout programs
          </p>
        </div>
        <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Workout</DialogTitle>
              <DialogDescription>
                Design a new workout program step by step
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <div className="absolute top-0 left-0 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        1
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">Basic Information</p>
                        <p className="text-sm text-muted-foreground">Workout details and goals</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-10 bg-border mx-4" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        2
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">Select Exercises</p>
                        <p className="text-sm text-muted-foreground">Choose exercises to include</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-10 bg-border mx-4" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        3
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">Configure Sets</p>
                        <p className="text-sm text-muted-foreground">Set repetitions and rest periods</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16">
              {renderStepContent()}
            </div>

            <DialogFooter className="flex justify-between mt-6">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline\" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                {currentStep < 3 ? (
                  <Button onClick={nextStep}>Next</Button>
                ) : (
                  <Button onClick={handleAddWorkout} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Workout"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="workouts">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Workout Management</CardTitle>
                <CardDescription>
                  Create, edit and assign workout programs
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="workouts">Workouts</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Difficulty</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {/* Workout cards will be rendered here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}