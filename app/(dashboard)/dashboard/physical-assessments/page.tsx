'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Search, Filter, ArrowRight, Edit, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PhysicalAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
    fetchStudents();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/physical-assessments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching assessments",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
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

  const handleDeleteAssessment = async (assessment) => {
    try {
      const response = await fetch(`/api/physical-assessments/${assessment.id}`, {
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
      
      await fetchAssessments();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting assessment",
        description: error.message,
      });
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = 
      assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStudent = 
      studentFilter === "all" || 
      assessment.student_id === studentFilter;

    return matchesSearch && matchesStudent;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Physical Assessments</h2>
          <p className="text-muted-foreground">
            Track and manage student physical assessments
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/physical-assessments/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
          <CardDescription>
            View and manage physical assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {assessment.student?.full_name}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-1 font-medium">{assessment.weight} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Height:</span>
                          <span className="ml-1 font-medium">{assessment.height} cm</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BMI:</span>
                          <span className="ml-1 font-medium">{assessment.bmi}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Body Fat:</span>
                          <span className="ml-1 font-medium">{assessment.body_fat}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteAssessment(assessment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAssessments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No assessments found. Try adjusting your filters or create a new assessment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}