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

const PROTOCOLS = [
  "McArdle 1992",
  "Guedes 1994"
];

export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [calculatedResults, setCalculatedResults] = useState(null);
  
  const [assessment, setAssessment] = useState({
    protocol: "",
    student_id: "",
    date: new Date().toISOString().split('T')[0],
    weight: "",
    height: "",
    age: "",
    gender: "",
    // Perimetry
    neck: "",
    shoulders: "",
    chest: "",
    abdomen: "",
    waist: "",
    hips: "",
    leftArm: "",
    rightArm: "",
    leftThigh: "",
    rightThigh: "",
    leftCalf: "",
    rightCalf: "",
    // Skinfolds
    triceps: "",
    abdominal: "",
    suprailiac: "",
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

  const calculateResults = () => {
    const {
      protocol,
      gender,
      age,
      weight,
      triceps,
      abdominal,
      suprailiac,
      leftThigh,
    } = assessment;

    let body_density;
    let fat_percentage;

    // Convert string values to numbers
    const measurements = {
      triceps: parseFloat(triceps),
      abdominal: parseFloat(abdominal),
      suprailiac: parseFloat(suprailiac),
      thigh: parseFloat(leftThigh),
    };

    if (protocol === "McArdle 1992") {
      if (gender === "male") {
        if (age >= 18 && age <= 34) {
          body_density = 1.1610 - 0.0632 * Math.log10(measurements.triceps + measurements.suprailiac + measurements.abdominal);
        } else if (age >= 18 && age <= 27) {
          body_density = 1.0913 - 0.00116 * (measurements.triceps + measurements.suprailiac);
        }
      } else if (gender === "female") {
        if (age >= 18 && age <= 48) {
          body_density = 1.06234 - 0.00068 * measurements.suprailiac - 0.00039 * measurements.triceps - 0.00025 * measurements.suprailiac;
        }
      }
    } else if (protocol === "Guedes 1994") {
      if (gender === "male") {
        body_density = 1.17136 - 0.06706 * Math.log10(measurements.triceps + measurements.suprailiac + measurements.abdominal);
      } else if (gender === "female") {
        body_density = 1.16650 - 0.07063 * Math.log10(measurements.thigh + measurements.suprailiac + measurements.suprailiac);
      }
    }

    if (body_density) {
      fat_percentage = ((4.95 / body_density) - 4.50) * 100;
      const fat_mass = (fat_percentage / 100) * parseFloat(weight);
      const lean_mass = parseFloat(weight) - fat_mass;

      setCalculatedResults({
        body_density: body_density.toFixed(4),
        fat_percentage: fat_percentage.toFixed(2),
        fat_mass: fat_mass.toFixed(2),
        lean_mass: lean_mass.toFixed(2)
      });
    }
  };

  useEffect(() => {
    if (assessment.protocol && assessment.gender && assessment.age && 
        assessment.weight && assessment.triceps && assessment.abdominal && 
        assessment.suprailiac) {
      calculateResults();
    }
  }, [assessment]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!calculatedResults) {
        throw new Error("Please fill in all required fields to calculate results");
      }

      const assessmentData = {
        ...assessment,
        ...calculatedResults,
        // Convert string values to numbers
        weight: parseFloat(assessment.weight),
        height: parseFloat(assessment.height),
        age: parseInt(assessment.age),
        neck: parseFloat(assessment.neck),
        shoulders: parseFloat(assessment.shoulders),
        chest: parseFloat(assessment.chest),
        abdomen: parseFloat(assessment.abdomen),
        waist: parseFloat(assessment.waist),
        hips: parseFloat(assessment.hips),
        leftArm: parseFloat(assessment.leftArm),
        rightArm: parseFloat(assessment.rightArm),
        leftThigh: parseFloat(assessment.leftThigh),
        rightThigh: parseFloat(assessment.rightThigh),
        leftCalf: parseFloat(assessment.leftCalf),
        rightCalf: parseFloat(assessment.rightCalf),
        triceps: parseFloat(assessment.triceps),
        abdominal: parseFloat(assessment.abdominal),
        suprailiac: parseFloat(assessment.suprailiac),
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
              Enter the assessment protocol and student information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="protocol">Protocol *</Label>
                <Select
                  value={assessment.protocol}
                  onValueChange={(value) => setAssessment(prev => ({ ...prev, protocol: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROTOCOLS.map((protocol) => (
                      <SelectItem key={protocol} value={protocol}>
                        {protocol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <div>
                <Label htmlFor="date">Assessment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={assessment.date}
                  onChange={(e) => setAssessment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={assessment.gender}
                  onValueChange={(value) => setAssessment(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={assessment.age}
                    onChange={(e) => setAssessment(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perimetry Measurements</CardTitle>
            <CardDescription>
              Record body circumference measurements (in cm)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="neck">Neck</Label>
                <Input
                  id="neck"
                  type="number"
                  step="0.1"
                  value={assessment.neck}
                  onChange={(e) => setAssessment(prev => ({ ...prev, neck: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="shoulders">Shoulders</Label>
                <Input
                  id="shoulders"
                  type="number"
                  step="0.1"
                  value={assessment.shoulders}
                  onChange={(e) => setAssessment(prev => ({ ...prev, shoulders: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="chest">Chest</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={assessment.chest}
                  onChange={(e) => setAssessment(prev => ({ ...prev, chest: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="abdomen">Abdomen</Label>
                <Input
                  id="abdomen"
                  type="number"
                  step="0.1"
                  value={assessment.abdomen}
                  onChange={(e) => setAssessment(prev => ({ ...prev, abdomen: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="waist">Waist</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={assessment.waist}
                  onChange={(e) => setAssessment(prev => ({ ...prev, waist: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="hips">Hips</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  value={assessment.hips}
                  onChange={(e) => setAssessment(prev => ({ ...prev, hips: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="leftArm">Left Arm</Label>
                <Input
                  id="leftArm"
                  type="number"
                  step="0.1"
                  value={assessment.leftArm}
                  onChange={(e) => setAssessment(prev => ({ ...prev, leftArm: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="rightArm">Right Arm</Label>
                <Input
                  id="rightArm"
                  type="number"
                  step="0.1"
                  value={assessment.rightArm}
                  onChange={(e) => setAssessment(prev => ({ ...prev, rightArm: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="leftThigh">Left Thigh</Label>
                <Input
                  id="leftThigh"
                  type="number"
                  step="0.1"
                  value={assessment.leftThigh}
                  onChange={(e) => setAssessment(prev => ({ ...prev, leftThigh: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="rightThigh">Right Thigh</Label>
                <Input
                  id="rightThigh"
                  type="number"
                  step="0.1"
                  value={assessment.rightThigh}
                  onChange={(e) => setAssessment(prev => ({ ...prev, rightThigh: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="leftCalf">Left Calf</Label>
                <Input
                  id="leftCalf"
                  type="number"
                  step="0.1"
                  value={assessment.leftCalf}
                  onChange={(e) => setAssessment(prev => ({ ...prev, leftCalf: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="rightCalf">Right Calf</Label>
                <Input
                  id="rightCalf"
                  type="number"
                  step="0.1"
                  value={assessment.rightCalf}
                  onChange={(e) => setAssessment(prev => ({ ...prev, rightCalf: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skinfold Measurements</CardTitle>
            <CardDescription>
              Record skinfold measurements (in mm)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="triceps">Triceps *</Label>
                <Input
                  id="triceps"
                  type="number"
                  step="0.1"
                  value={assessment.triceps}
                  onChange={(e) => setAssessment(prev => ({ ...prev, triceps: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="abdominal">Abdominal *</Label>
                <Input
                  id="abdominal"
                  type="number"
                  step="0.1"
                  value={assessment.abdominal}
                  onChange={(e) => setAssessment(prev => ({ ...prev, abdominal: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="suprailiac">Suprailiac *</Label>
                <Input
                  id="suprailiac"
                  type="number"
                  step="0.1"
                  value={assessment.suprailiac}
                  onChange={(e) => setAssessment(prev => ({ ...prev, suprailiac: e.target.value }))}
                />
              </div>
            </div>

            {calculatedResults && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4">Calculated Results:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Body Density</Label>
                    <p className="text-lg font-medium">{calculatedResults.body_density}</p>
                  </div>
                  <div>
                    <Label>Body Fat %</Label>
                    <p className="text-lg font-medium">{calculatedResults.fat_percentage}%</p>
                  </div>
                  <div>
                    <Label>Fat Mass</Label>
                    <p className="text-lg font-medium">{calculatedResults.fat_mass} kg</p>
                  </div>
                  <div>
                    <Label>Lean Mass</Label>
                    <p className="text-lg font-medium">{calculatedResults.lean_mass} kg</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}