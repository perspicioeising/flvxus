'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Dumbbell, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function WorkoutPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  type WorkoutExercise = {
    id: number;
    exercise: {
      name: string;
    };
    sets: number;
    reps: number;
    notes?: string;
  };
  
  type Workout = {
    id: number;
    name: string;
    description?: string;
    level: string;
    goal: string;
    workout_exercises?: WorkoutExercise[];
  };
  
  type WorkoutPlanItem = {
    day_of_week: number;
    workout: Workout;
  };
  
  type Student = {
    full_name: string;
    email: string;
  };
  
  type Plan = {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    student?: Student;
    workout_plan_items: WorkoutPlanItem[];
  };
  
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`/api/workout-plans/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setPlan(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching plan details",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workout-plans/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Plan deleted",
        description: "The training plan has been removed",
      });
      
      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting plan",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
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

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Plan not found</h2>
          <p className="text-muted-foreground">The requested training plan could not be found.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/workout-plans')}>
            Go Back
          </Button>
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
            <h2 className="text-3xl font-bold tracking-tight">{plan.name}</h2>
            <p className="text-muted-foreground">
              Training Plan Details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/workout-plans/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Overview</CardTitle>
          <CardDescription>
            General information about the training plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Student</h3>
                <p className="text-lg font-medium">{plan.student?.full_name}</p>
                <p className="text-sm text-muted-foreground">{plan.student?.email}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="text-base">{plan.description || "No description provided"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Duration</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(plan.start_date), 'MMM d, yyyy')}</span>
                  <span>to</span>
                  <span>{format(new Date(plan.end_date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={new Date(plan.end_date) >= new Date() ? 'default' : 'secondary'}>
                  {new Date(plan.end_date) >= new Date() ? 'Active' : 'Completed'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayWorkouts = plan.workout_plan_items
            .filter(item => item.day_of_week === index + 1)
            .map(item => item.workout)
            .filter(Boolean);

          if (dayWorkouts.length === 0) return null;

          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{day}</CardTitle>
                <CardDescription>
                  Workouts scheduled for {day}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayWorkouts.map((workout) => (
                    <Card key={workout.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{workout.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {workout.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="capitalize">
                            {workout.level}
                          </Badge>
                          <Badge variant="outline">
                            {workout.goal}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {workout.workout_exercises?.map((we) => (
                            <div key={we.id} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                              <Dumbbell className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <p className="font-medium">{we.exercise.name}</p>
                                <div className="text-sm text-muted-foreground">
                                  {we.sets} sets × {we.reps} reps
                                  {we.notes && ` • ${we.notes}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}