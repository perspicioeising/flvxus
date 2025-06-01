'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import {
  Activity,
  Scale,
  Ruler,
  Heart,
  Camera,
  ChevronRight,
  CalendarDays,
  BarChart as BarChartIcon
} from "lucide-react";

export default function ProgressPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [physicalAssessments, setPhysicalAssessments] = useState([]);
  const [postureAssessments, setPostureAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      // Fetch physical assessments
      const physicalResponse = await fetch('/api/physical-assessments');
      const physicalData = await physicalResponse.json();
      
      if (!physicalResponse.ok) {
        throw new Error(physicalData.error);
      }
      
      setPhysicalAssessments(physicalData);

      // Fetch posture assessments
      const postureResponse = await fetch('/api/posture-assessments');
      const postureData = await postureResponse.json();
      
      if (!postureResponse.ok) {
        throw new Error(postureData.error);
      }
      
      setPostureAssessments(postureData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching assessments",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressData = () => {
    return physicalAssessments.map(assessment => ({
      date: format(new Date(assessment.date), 'MMM d'),
      weight: assessment.weight,
      bodyFat: parseFloat(assessment.fat_percentage),
      leanMass: parseFloat(assessment.lean_mass),
      fatMass: parseFloat(assessment.fat_mass)
    }));
  };

  const getMeasurementsData = () => {
    if (physicalAssessments.length === 0) return [];
    
    const latest = physicalAssessments[0];
    return [
      { name: 'Chest', value: latest.chest },
      { name: 'Waist', value: latest.waist },
      { name: 'Hips', value: latest.hips },
      { name: 'Left Arm', value: latest.left_arm },
      { name: 'Right Arm', value: latest.right_arm },
      { name: 'Left Thigh', value: latest.left_thigh },
      { name: 'Right Thigh', value: latest.right_thigh }
    ].filter(item => item.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading your progress...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your assessment data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Progress</h2>
        <p className="text-muted-foreground">
          Track your fitness journey and body composition changes
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.weight || '-'} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.fat_percentage || '-'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Lean Mass</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.lean_mass || '-'} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-2xl font-bold">
                    {physicalAssessments[0]?.height || '-'} cm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="physical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="physical">Physical Assessments</TabsTrigger>
            <TabsTrigger value="posture">Posture Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="space-y-4">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Body Composition Progress</CardTitle>
                <CardDescription>
                  Track changes in your weight and body composition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name="Weight (kg)"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat"
                        name="Body Fat (%)" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leanMass"
                        name="Lean Mass (kg)" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Measurements Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Measurements</CardTitle>
                <CardDescription>
                  Your most recent body measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMeasurementsData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>
                  View all your physical assessment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {physicalAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(assessment.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Weight: {assessment.weight}kg</span>
                          <span>Body Fat: {assessment.fat_percentage}%</span>
                          <span>Protocol: {assessment.protocol}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posture Assessments</CardTitle>
                <CardDescription>
                  View your posture assessment history and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postureAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(assessment.created_at), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          <span>
                            {assessment.front_image_url && assessment.side_image_url && assessment.back_image_url
                              ? "All photos uploaded"
                              : "Partial assessment"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {postureAssessments.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No posture assessments found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}