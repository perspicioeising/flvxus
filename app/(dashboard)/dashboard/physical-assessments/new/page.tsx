'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  
  const [assessment, setAssessment] = useState({
    student_id: "",
    weight: "",
    height: "",
    body_fat: "",
    muscle_mass: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      rightArm: "",
      leftArm: "",
      rightThigh: "",
      leftThigh: "",
      rightCalf: "",
      leftCalf: "",
    },
    notes: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Convert string values to numbers
      const assessmentData = {
        student_id: assessment.student_id,
        weight: parseFloat(assessment.weight),
        height: parseFloat(assessment.height),
        body_fat: parseFloat(assessment.body_fat),
        muscle_mass: parseFloat(assessment.muscle_mass),
        measurements: {
          chest: parseFloat(assessment.measurements.chest),
          waist: parseFloat(assessment.measurements.waist),
          hips: parseFloat(assessment.measurements.hips),
          rightArm: parseFloat(assessment.measurements.rightArm),
          leftArm: parseFloat(assessment.measurements.leftArm),
          rightThigh: parseFloat(assessment.measurements.rightThigh),
          leftThigh: parseFloat(assessment.measurements.leftThigh),
          rightCalf: parseFloat(assessment.measurements.rightCalf),
          leftCalf: parseFloat(assessment.measurements.leftCalf),
        },
        notes: assessment.notes
      };

      const response = await fetch('/api/physical-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Assessment created",
        description: "Physical assessment has been saved successfully",
      });
      
      router.push('/dashboard/physical-assessments');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating assessment",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold tracking-tight">New Physical Assessment</h2>
            <p className="text-muted-foreground">
              Create a new physical assessment for a student
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the student's basic measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={assessment.student_id}
                  onValueChange={(value) => setAssessment(prev => ({ ...prev, student_id: value }))}
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
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={assessment.weight}
                    onChange={(e) => setAssessment(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={assessment.height}
                    onChange={(e) => setAssessment(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyFat">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={assessment.body_fat}
                    onChange={(e) => setAssessment(prev => ({ ...prev, body_fat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="muscleMass">Muscle Mass %</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={assessment.muscle_mass}
                    onChange={(e) => setAssessment(prev => ({ ...prev, muscle_mass: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body Measurements</CardTitle>
            <CardDescription>
              Record detailed body measurements (in cm)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="chest">Chest</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.chest}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, chest: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="waist">Waist</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.waist}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, waist: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="hips">Hips</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.hips}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, hips: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="rightArm">Right Arm</Label>
                <Input
                  id="rightArm"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.rightArm}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, rightArm: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="leftArm">Left Arm</Label>
                <Input
                  id="leftArm"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.leftArm}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, leftArm: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="rightThigh">Right Thigh</Label>
                <Input
                  id="rightThigh"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.rightThigh}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, rightThigh: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="leftThigh">Left Thigh</Label>
                <Input
                  id="leftThigh"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.leftThigh}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, leftThigh: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="rightCalf">Right Calf</Label>
                <Input
                  id="rightCalf"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.rightCalf}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, rightCalf: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="leftCalf">Left Calf</Label>
                <Input
                  id="leftCalf"
                  type="number"
                  step="0.1"
                  value={assessment.measurements.leftCalf}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    measurements: { ...prev.measurements, leftCalf: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any relevant observations or notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={assessment.notes}
              onChange={(e) => setAssessment(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes or observations..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}