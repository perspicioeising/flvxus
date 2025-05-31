'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export default function EditWorkoutPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  
  const [plan, setPlan] = useState({
    name: "",
    description: "",
    student_id: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchPlanDetails();
    fetchWorkouts();
    fetchStudents();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`/api/workout-plans/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlan({
        name: data.name,
        description: data.description || "",
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date,
      });

      setSelectedWorkouts(
        data.workout_plan_items.map(item => ({
          id: item.workout.id,
          name: item.workout.name,
          level: item.workout.level,
          goal: item.workout.goal,
          day_of_week: item.day_of_week
        }))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching plan details",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
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
        description: error.message,
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
        description: error.message,
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const planData = {
        ...plan,
        workouts: selectedWorkouts.map(workout => ({
          workout_id: workout.id,
          day_of_week: workout.day_of_week
        }))
      };

      const response = await fetch(`/api/workout-plans/${params.id}`, {
        method: 'PUT',
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
        title: "Plan updated",
        description: "Changes have been saved successfully",
      });
      
      router.push(`/dashboard/workout-plans/${params.id}`);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating plan",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutSelect = (workout) => {
    if (!selectedWorkouts.find(w => w.id === workout.id)) {
      setSelectedWorkouts([...selectedWorkouts, {
        ...workout,
        day_of_week: 1
      }]);
    }
  };

  const handleWorkoutUpdate = (index, field, value) => {
    const updatedWorkouts = [...selectedWorkouts];
    updatedWorkouts[index] = {
      ...updatedWorkouts[index],
      [field]: value
    };
    setSelectedWorkouts(updatedWorkouts);
  };

  const handleRemoveWorkout = (index) => {
    setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading plan details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Training Plan</h2>
            <p className="text-muted-foreground">
              Modify the training plan details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
            <CardDescription>
              Update the basic details of your training plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={plan.name}
                    onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 12-Week Strength Program"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={plan.description}
                    onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the plan's goals and focus..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student *</Label>
                  <Select
                    value={plan.student_id}
                    onValueChange={(value) => setPlan(prev => ({ ...prev, student_id: value }))}
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
                      value={plan.start_date}
                      onChange={(e) => setPlan(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={plan.end_date}
                      onChange={(e) => setPlan(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Workouts</CardTitle>
            <CardDescription>
              Add or remove workouts from this plan
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
                          value={workout.day_of_week.toString()}
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
      </div>
    </div>
  );
}