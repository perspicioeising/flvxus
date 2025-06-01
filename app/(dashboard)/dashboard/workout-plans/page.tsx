'use client';

import { useState, useEffect } from "react";
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
import { Plus, Search, Filter, Calendar, ArrowRight, Copy, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export default function WorkoutPlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  type Workout = {
    id: string;
    name: string;
    description?: string;
    level?: string;
    goal?: string;
    // Add other fields as needed
    day_of_week?: number;
  };

  type Student = {
    id: string;
    full_name: string;
    // Add other fields as needed
  };

  type Plan = {
    id: string;
    name: string;
    description?: string;
    student_id: string;
    start_date: string;
    end_date: string;
    workouts: any[];
    student?: Student;
    // Add other fields as needed
  };

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    student_id: "",
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    workouts: []
  });

  useEffect(() => {
    fetchWorkoutPlans();
    fetchWorkouts();
    fetchStudents();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch('/api/workout-plans');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlans(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching workout plans",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setWorkouts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching workouts",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching students",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    }
  };

  const handleAddPlan = async () => {
    try {
      setIsLoading(true);
      
      const planData = {
        ...newPlan,
        workouts: selectedWorkouts.map(workout => ({
          workout_id: workout.id,
          day_of_week: workout.day_of_week
        }))
      };

      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Workout plan created",
        description: `${newPlan.name} has been created successfully`,
      });
      
      await fetchWorkoutPlans();
      handleCancel();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating workout plan",
        description: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingPlan(false);
    setNewPlan({
      name: "",
      description: "",
      student_id: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      workouts: []
    });
    setSelectedWorkouts([]);
  };


  const handleWorkoutSelect = (workout: Workout) => {
    if (!selectedWorkouts.find(w => w.id === workout.id)) {
      setSelectedWorkouts([...selectedWorkouts, {
        ...workout,
        day_of_week: 1
      }]);
    }
  };

  interface HandleWorkoutUpdateField {
    day_of_week: number;
    // Add other fields as needed
  }

  const handleWorkoutUpdate = (
    index: number,
    field: keyof HandleWorkoutUpdateField,
    value: number
  ) => {
    const updatedWorkouts = [...selectedWorkouts];
    updatedWorkouts[index] = {
      ...updatedWorkouts[index],
      [field]: value
    };
    setSelectedWorkouts(updatedWorkouts);
  };

  interface HandleRemoveWorkout {
    (index: number): void;
  }

  const handleRemoveWorkout: HandleRemoveWorkout = (index) => {
    setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
  };

  interface DeletePlan {
    id: string;
    name: string;
    // Add other fields as needed
  }

  const handleDeletePlan = async (plan: DeletePlan): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Workout plan deleted",
        description: `${plan.name} has been removed`,
      });
      
      await fetchWorkoutPlans();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting workout plan",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && new Date(plan.end_date) >= new Date()) ||
      (statusFilter === "completed" && new Date(plan.end_date) < new Date());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Plans</h2>
          <p className="text-muted-foreground">
            Create and manage workout plans for your students
          </p>
        </div>
        <Button onClick={() => setIsAddingPlan(true)} disabled={isAddingPlan}>
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>

      {isAddingPlan && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Training Plan</CardTitle>
              <CardDescription>
                Design a new training plan for your student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., 12-Week Strength Program"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the plan's goals and focus..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="student">Student *</Label>
                    <Select
                      value={newPlan.student_id}
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, student_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newPlan.start_date}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newPlan.end_date}
                        onChange={(e) => setNewPlan(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Workouts</CardTitle>
              <CardDescription>
                Choose and schedule workouts for this plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.map((workout) => (
                  <Card 
                    key={workout.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedWorkouts.find(w => w.id === workout.id) 
                        ? 'border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleWorkoutSelect(workout)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{workout.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {workout.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="capitalize">
                          {workout.level}
                        </Badge>
                        <Badge variant="outline">
                          {workout.goal}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedWorkouts.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-semibold">Schedule Workouts</h3>
                  {selectedWorkouts.map((workout, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">{workout.name}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveWorkout(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Day of Week</Label>
                          <Select
                            value={(workout.day_of_week !== undefined ? workout.day_of_week.toString() : "")}
                            onValueChange={(value) => handleWorkoutUpdate(index, 'day_of_week', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddPlan} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Training Plans</CardTitle>
              <CardDescription>
                Browse and manage your training plans
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <Badge variant="outline">
                        {new Date(plan.end_date) >= new Date() ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground mt-1">
                      <div>Student: <span className="font-medium">{plan.student?.full_name}</span></div>
                      <div>Start: {format(new Date(plan.start_date), 'MMM d, yyyy')}</div>
                      <div>End: {format(new Date(plan.end_date), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/workout-plans/${plan.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => router.push(`/dashboard/workout-plans/${plan.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeletePlan(plan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPlans.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No training plans found. Try adjusting your filters or create new plans.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}