"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, MoreHorizontal, Users, ArrowRight, Copy } from "lucide-react";
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

// Mock data for demonstration
const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Upper Body Power",
    description: "Focus on strength and power for the upper body.",
    level: "intermediate",
    goal: "Strength",
    exerciseCount: 6,
    assignedStudents: 4,
    lastUpdated: "2 days ago"
  },
  {
    id: "2",
    name: "Leg Day",
    description: "Comprehensive lower body workout focusing on all major leg muscles.",
    level: "advanced",
    goal: "Hypertrophy",
    exerciseCount: 8,
    assignedStudents: 7,
    lastUpdated: "Yesterday"
  },
  {
    id: "3",
    name: "Core Stability",
    description: "Strengthen the core muscles and improve stability.",
    level: "beginner",
    goal: "Stability",
    exerciseCount: 5,
    assignedStudents: 10,
    lastUpdated: "3 days ago"
  },
  {
    id: "4",
    name: "Full Body Circuit",
    description: "High-intensity circuit training for the entire body.",
    level: "intermediate",
    goal: "Conditioning",
    exerciseCount: 10,
    assignedStudents: 6,
    lastUpdated: "1 week ago"
  },
  {
    id: "5",
    name: "Mobility & Recovery",
    description: "Focus on joint mobility, flexibility, and active recovery.",
    level: "beginner",
    goal: "Mobility",
    exerciseCount: 7,
    assignedStudents: 3,
    lastUpdated: "5 days ago"
  }
];

// Mock data for workout plans
const MOCK_WORKOUT_PLANS = [
  {
    id: "1",
    name: "12-Week Strength Program",
    description: "Progressive strength program for intermediate lifters.",
    student: "Maria Silva",
    startDate: "Jan 15, 2025",
    endDate: "Apr 9, 2025",
    progress: 25,
    workouts: ["Upper Body Power", "Leg Day", "Core Stability", "Recovery"]
  },
  {
    id: "2",
    name: "Weight Loss Challenge",
    description: "High intensity program focused on calorie burn and muscle retention.",
    student: "João Santos",
    startDate: "Feb 1, 2025",
    endDate: "Apr 30, 2025",
    progress: 15,
    workouts: ["Full Body Circuit", "Cardio Blast", "Core Stability"]
  },
  {
    id: "3",
    name: "Posture Improvement",
    description: "Corrective exercise program to improve posture and alleviate pain.",
    student: "Ana Costa",
    startDate: "Dec 10, 2024",
    endDate: "Mar 10, 2025",
    progress: 60,
    workouts: ["Upper Body Strength", "Mobility & Recovery", "Core Stability"]
  }
];

export default function WorkoutsPage() {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workouts");
  
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    level: "beginner",
    goal: "",
  });

  // Filter workouts based on search query and level filter
  const filteredWorkouts = MOCK_WORKOUTS.filter((workout) => {
    const matchesQuery = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || workout.level === levelFilter;
    
    return matchesQuery && matchesLevel;
  });

  const handleAddWorkout = async () => {
    try {
      // In a real implementation, we would add the workout to the database
      
      toast({
        title: "Workout created",
        description: `${newWorkout.name} has been added to your workout library`,
      });
      
      setIsAddWorkoutOpen(false);
      setNewWorkout({
        name: "",
        description: "",
        level: "beginner",
        goal: "",
      });
      
      // Refresh workout list (in real implementation)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating workout",
        description: error.message || "An error occurred",
      });
    }
  };

  const getLevelBadge = (level: string) => {
    switch(level) {
      case "beginner":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">Beginner</Badge>;
      case "intermediate":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">Intermediate</Badge>;
      case "advanced":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800">Advanced</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workouts</h2>
          <p className="text-muted-foreground">
            Create and manage workout programs for your students.
          </p>
        </div>
        <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Workout</DialogTitle>
              <DialogDescription>
                Design a new workout program for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Upper Body Strength" 
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the workout purpose and focus" 
                  value={newWorkout.description}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select 
                    value={newWorkout.level} 
                    onValueChange={(value) => setNewWorkout(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Input 
                    id="goal" 
                    placeholder="e.g. Strength, Hypertrophy" 
                    value={newWorkout.goal}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, goal: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAddWorkoutOpen(false)} className="sm:order-1">
                Cancel
              </Button>
              <Button onClick={handleAddWorkout} className="sm:order-2">
                Create Workout
              </Button>
              <Button 
                variant="outline"
                className="sm:order-3 w-full sm:w-auto"
                onClick={() => {
                  setIsAddWorkoutOpen(false);
                  // This would navigate to the workout builder page in a real implementation
                  toast({
                    title: "Advanced Mode",
                    description: "Opening the workout builder...",
                  });
                }}
              >
                Advanced Builder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="workouts" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <CardTitle>Workout Management</CardTitle>
                <CardDescription>
                  Create, edit and assign workout programs to your students.
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="workouts">Workouts</TabsTrigger>
                <TabsTrigger value="plans">Training Plans</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="workouts" className="mt-0">
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Difficulty" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No workouts found. Try adjusting your filters or create new workouts.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-card border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{workout.name}</h3>
                          {getLevelBadge(workout.level)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <div>Goal: <span className="font-medium">{workout.goal}</span></div>
                          <div>•</div>
                          <div>{workout.exerciseCount} exercises</div>
                          <div className="hidden md:block">•</div>
                          <div className="hidden md:flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {workout.assignedStudents} students
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <span className="text-xs text-muted-foreground mr-2">
                          Updated {workout.lastUpdated}
                        </span>
                        <div className="flex md:hidden items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {workout.assignedStudents}
                        </div>
                        <Link href={`/dashboard/workouts/${workout.id}`}>
                          <Button size="sm">
                            View
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Workout</DropdownMenuItem>
                            <DropdownMenuItem>Assign to Students</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete Workout
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plans" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search training plans..."
                  className="pl-8"
                />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Plan
              </Button>
            </div>
            
            <div className="grid gap-4">
              {MOCK_WORKOUT_PLANS.map((plan) => (
                <div key={plan.id} className="bg-card border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground mt-1">
                        <div>Student: <span className="font-medium">{plan.student}</span></div>
                        <div>Start: {plan.startDate}</div>
                        <div>End: {plan.endDate}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Progress: {plan.progress}%</div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Link href={`/dashboard/workout-plans/${plan.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                          <DropdownMenuItem>Reassign Student</DropdownMenuItem>
                          <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}