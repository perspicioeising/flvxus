'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send } from "lucide-react";

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TRAINING_TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Night"];
const GOALS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength",
  "Endurance",
  "Flexibility",
  "General Fitness",
  "Sports Performance",
  "Rehabilitation"
];

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResendingInvite, setIsResendingInvite] = useState(false);
  
  const [student, setStudent] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    height: "",
    weight: "",
    goals: [] as string[],
    medicalConditions: "",
    emergencyContact: "",
    preferredTime: "",
    experienceLevel: "",
    notes: "",
    status: ""
  });

  const fetchStudentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setStudent({
        name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        birthDate: data.birth_date || "",
        gender: data.gender || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        goals: data.goals || [],
        medicalConditions: data.medical_conditions || "",
        emergencyContact: data.emergency_contact || "",
        preferredTime: data.preferred_training_time || "",
        experienceLevel: data.experience_level || "",
        notes: data.notes || "",
        status: data.status || "active"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching student details",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Changes saved successfully",
        description: "Student profile has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendInvite = async () => {
    try {
      setIsResendingInvite(true);
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Invite resent successfully",
        description: "A new invitation email has been sent to the student.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resending invite",
        description: error.message,
      });
    } finally {
      setIsResendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading student details...</h2>
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
            <h2 className="text-3xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-muted-foreground">
              Student Profile
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResendInvite}
            disabled={isResendingInvite}
          >
            <Send className="h-4 w-4 mr-2" />
            {isResendingInvite ? "Resending..." : "Resend Invite"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the student&apos;s basic details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={student.name}
                  onChange={(e) => setStudent(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={student.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={student.phone}
                  onChange={(e) => setStudent(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={student.birthDate}
                  onChange={(e) => setStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={student.gender}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={student.status}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical Information</CardTitle>
            <CardDescription>
              Update the student&apos;s physical measurements and fitness goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={student.height}
                  onChange={(e) => setStudent(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={student.weight}
                  onChange={(e) => setStudent(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fitness Goals</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={goal}
                      checked={student.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStudent(prev => ({
                            ...prev,
                            goals: [...prev.goals, goal]
                          }));
                        } else {
                          setStudent(prev => ({
                            ...prev,
                            goals: prev.goals.filter(g => g !== goal)
                          }));
                        }
                      }}
                    />
                    <label htmlFor={goal}>{goal}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={student.experienceLevel}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Training Time</Label>
                <Select
                  value={student.preferredTime}
                  onValueChange={(value) => setStudent(prev => ({ ...prev, preferredTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_TIMES.map((time) => (
                      <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical & Emergency Information</CardTitle>
            <CardDescription>
              Update the student&apos;s medical conditions and emergency contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                placeholder="List any medical conditions, injuries, or limitations"
                value={student.medicalConditions}
                onChange={(e) => setStudent(prev => ({ ...prev, medicalConditions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                placeholder="Name and phone number"
                value={student.emergencyContact}
                onChange={(e) => setStudent(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any additional notes or observations about the student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes here..."
              value={student.notes}
              onChange={(e) => setStudent(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}