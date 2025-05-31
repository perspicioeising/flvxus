'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Dumbbell, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DAYS_OF_WEEK = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday"
};

export default function WorkoutPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        description: error.message,
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
        description: error.message,
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
            Edit Plan
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Overview</CardTitle>
            <CardDescription>
              Basic information about the training plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Student</h4>
                <p className="text-lg font-medium">{plan.student?.full_name}</p>
                <p className="text-sm text-muted-foreground">{plan.student?.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                <p className="text-lg font-medium">
                  {format(new Date(plan.start_date), 'MMM d, yyyy')} - {format(new Date(plan.end_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(plan.end_date) >= new Date() ? 'Active' : 'Completed'}
                </p>
              </div>
            </div>

            {plan.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              Workouts assigned for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(DAYS_OF_WEEK).map(([day, dayName]) => {
                const dayWorkouts = plan.workout_plan_items?.filter(item => 
                  item.day_of_week === parseInt(day)
                );

                return (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">{dayName}</h3>
                    
                    {dayWorkouts?.length > 0 ? (
                      <div className="space-y-4">
                        {dayWorkouts.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <h4 className="font-medium">{item.workout.name}</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className="capitalize">
                                  {item.workout.level}
                                </Badge>
                                <Badge variant="outline">
                                  {item.workout.goal}
                                </Badge>
                              </div>

                              {item.workout.workout_exercises?.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium text-muted-foreground">Exercises:</h5>
                                  <div className="grid gap-2">
                                    {item.workout.workout_exercises.map((we) => (
                                      <div key={we.id} className="flex items-center gap-2 text-sm">
                                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                        <span>{we.exercise.name}</span>
                                        <span className="text-muted-foreground">
                                          ({we.sets} sets × {we.reps || '—'} reps)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No workouts scheduled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}