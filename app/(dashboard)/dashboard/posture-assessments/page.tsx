'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Camera, ArrowRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PostureAssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/posture-assessments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessments(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching assessments",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/posture-assessments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Assessment deleted",
        description: "The posture assessment has been removed",
      });
      
      fetchAssessments();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting assessment",
        description: error.message,
      });
    }
  };

  const filteredAssessments = assessments.filter((assessment) =>
    assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posture Assessments</h2>
          <p className="text-muted-foreground">
            Manage and track student posture assessments
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/posture-assessments/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                View and manage posture assessments
              </CardDescription>
            </div>
          </div>
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
          </div>

          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{assessment.student?.full_name}</h3>
                    <Badge variant="outline">
                      {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    {assessment.front_image_url && assessment.side_image_url && assessment.back_image_url
                      ? "All photos uploaded"
                      : "Photos pending"}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(assessment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredAssessments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No posture assessments found. Create a new assessment to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}