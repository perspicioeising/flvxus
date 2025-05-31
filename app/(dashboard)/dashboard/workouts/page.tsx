'use client';

import { useState, useEffect } from "react";
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
import { useExercises } from "@/hooks/use-exercises";

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const GOALS = ["Strength", "Hypertrophy", "Endurance", "Power", "Weight Loss", "Rehabilitation"];

export default function WorkoutsPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { exercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState("all");
  
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
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: exercise.sets || 3,
          reps: exercise.reps || 12,
          rest: exercise.rest || 60,
          notes: exercise.notes || "",
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
      
      handleCancel();
      
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

  const handleCancel = () => {
    setIsAddingWorkout(false);
    setNewWorkout({
      name: "",
      description: "",
      level: "",
      goal: "",
      exercises: []
    });
    setSelectedExercises([]);
  };

  const handleExerciseSelect = (exercise) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, {
        ...exercise,
        sets: 3,
        reps: 12,
        rest: 60,
        notes: ""
      }]);
    }
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

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    
    const matchesMuscle = 
      exerciseMuscleFilter === "all" || 
      exercise.muscle_group.includes(exerciseMuscleFilter);

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workouts</h2>
          <p className="text-muted-foreground">
            Create and manage workout programs
          </p>
        </div>
        <Button onClick={() => setIsAddingWorkout(true)} disabled={isAddingWorkout}>
          <Plus className="mr-2 h-4 w-4" /> Create Workout
        </Button>
      </div>

      {isAddingWorkout && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Workout</CardTitle>
              <CardDescription>
                Enter the basic information for your workout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Workout Name *</Label>
                    <Input
                      id="name"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Upper Body Strength"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newWorkout.description}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the workout's focus and objectives..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
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

                  <div>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Exercises</CardTitle>
              <CardDescription>
                Choose exercises to include in your workout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-8"
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={exerciseMuscleFilter} onValueChange={setExerciseMuscleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Muscle Group</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"].map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card 
                    key={exercise.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedExercises.find(e => e.id === exercise.id) 
                        ? 'border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{exercise.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscle_group.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedExercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Configure Exercises</CardTitle>
                <CardDescription>
                  Set the details for each exercise in your workout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkout} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Workout"}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Workout Management</CardTitle>
              <CardDescription>
                Browse and manage your workout programs
              </CardDescription>
            </div>
          </div>
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