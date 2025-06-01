'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Chart } from "@/components/ui/chart";

export default function PhysicalAssessmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  useEffect(() => {
    fetchAssessmentDetails();
  }, []);

  useEffect(() => {
    if (assessment?.student_id) {
      fetchAssessmentHistory();
    }
  }, [assessment]);

  const fetchAssessmentDetails = async () => {
    try {
      const response = await fetch(`/api/physical-assessments/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessment(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching assessment details",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessmentHistory = async () => {
    try {
      const response = await fetch('/api/physical-assessments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      // Sort by date and get only assessments for this student
      const studentAssessments = data
        .filter(a => a.student_id === assessment.student_id)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(a => ({
          date: format(new Date(a.date), 'MMM d'),
          weight: a.weight,
          bodyFat: parseFloat(a.fat_percentage),
          leanMass: parseFloat(a.lean_mass),
          fatMass: parseFloat(a.fat_mass),
        }));
      
      setAssessmentHistory(studentAssessments);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching assessment history",
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/physical-assessments/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Assessment deleted",
        description: "The assessment has been removed",
      });
      
      router.push('/dashboard/physical-assessments');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting assessment",
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
          <h2 className="text-2xl font-semibold mb-2">Loading assessment details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the information.</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Assessment not found</h2>
          <p className="text-muted-foreground">The requested assessment could not be found.</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/physical-assessments')}>
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
            <h2 className="text-3xl font-bold tracking-tight">Assessment Details</h2>
            <p className="text-muted-foreground">
              View physical assessment results
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/physical-assessments/${params.id}/posture`)}
          >
            <Camera className="h-4 w-4 mr-2" />
            Posture Assessment
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/physical-assessments/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Assessment
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Assessment
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Chart</CardTitle>
            <CardDescription>
              Track changes in body composition over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart data={assessmentHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
            <CardDescription>
              Details of the physical assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Student</h3>
                  <p className="text-lg font-medium">{assessment.student?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{assessment.student?.email}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Protocol</h3>
                  <p className="text-base">{assessment.protocol}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
                  <p className="text-base">{format(new Date(assessment.date), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Basic Measurements</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-1 font-medium">{assessment.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Height:</span>
                      <span className="ml-1 font-medium">{assessment.height} cm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-1 font-medium">{assessment.age} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-1 font-medium capitalize">{assessment.gender}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Results</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-muted-foreground">Body Fat:</span>
                      <span className="ml-1 font-medium">{assessment.fat_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Body Density:</span>
                      <span className="ml-1 font-medium">{assessment.body_density}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fat Mass:</span>
                      <span className="ml-1 font-medium">{assessment.fat_mass} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lean Mass:</span>
                      <span className="ml-1 font-medium">{assessment.lean_mass} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Perimetry Measurements</CardTitle>
              <CardDescription>Body circumference measurements in centimeters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Neck:</span>
                  <span className="ml-1 font-medium">{assessment.neck || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Shoulders:</span>
                  <span className="ml-1 font-medium">{assessment.shoulders || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Chest:</span>
                  <span className="ml-1 font-medium">{assessment.chest || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Abdomen:</span>
                  <span className="ml-1 font-medium">{assessment.abdomen || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Waist:</span>
                  <span className="ml-1 font-medium">{assessment.waist || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Hips:</span>
                  <span className="ml-1 font-medium">{assessment.hips || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Left Arm:</span>
                  <span className="ml-1 font-medium">{assessment.left_arm || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Right Arm:</span>
                  <span className="ml-1 font-medium">{assessment.right_arm || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Left Thigh:</span>
                  <span className="ml-1 font-medium">{assessment.left_thigh || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Right Thigh:</span>
                  <span className="ml-1 font-medium">{assessment.right_thigh || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Left Calf:</span>
                  <span className="ml-1 font-medium">{assessment.left_calf || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Right Calf:</span>
                  <span className="ml-1 font-medium">{assessment.right_calf || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skinfold Measurements</CardTitle>
              <CardDescription>Skinfold measurements in millimeters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Triceps:</span>
                  <span className="ml-1 font-medium">{assessment.triceps || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Abdominal:</span>
                  <span className="ml-1 font-medium">{assessment.abdominal || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Suprailiac:</span>
                  <span className="ml-1 font-medium">{assessment.suprailiac || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}