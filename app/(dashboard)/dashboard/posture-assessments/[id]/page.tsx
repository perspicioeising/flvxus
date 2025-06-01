'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/app/providers";
import { ArrowLeft, Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

export default function PostureAssessmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [images, setImages] = useState({
    front: null,
    side: null,
    back: null
  });
  const [imageUrls, setImageUrls] = useState({
    front: null,
    side: null,
    back: null
  });
  const [notes, setNotes] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState("");

  useEffect(() => {
    fetchAssessmentDetails();
  }, []);

  const fetchAssessmentDetails = async () => {
    try {
      const response = await fetch(`/api/posture-assessments/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessment(data);
      setImageUrls({
        front: data.front_image_url,
        side: data.side_image_url,
        back: data.back_image_url
      });
      setNotes(data.notes || "");
      setAiAnalysis(data.ai_analysis);
      setRecommendations(data.recommendations || "");
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

  const handleImageUpload = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posture/${fileName}`;

      const { data, error } = await supabase.storage
        .from('posture-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('posture-images')
        .getPublicUrl(filePath);

      setImageUrls(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      // Trigger AI analysis when all images are uploaded
      if (Object.values({ ...imageUrls, [type]: publicUrl }).every(url => url)) {
        await analyzePosture({ ...imageUrls, [type]: publicUrl });
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message,
      });
    }
  };

  const analyzePosture = async (images) => {
    try {
      const response = await fetch('/api/ai/analyze-posture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setAiAnalysis(data.analysis);
      setRecommendations(data.recommendations);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error analyzing posture",
        description: error.message,
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/posture-assessments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front_image_url: imageUrls.front,
          side_image_url: imageUrls.side,
          back_image_url: imageUrls.back,
          ai_analysis: aiAnalysis,
          recommendations,
          notes
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Assessment saved",
        description: "Posture assessment has been saved successfully",
      });
      
      router.push('/dashboard/posture-assessments');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving assessment",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
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
            <h2 className="text-3xl font-bold tracking-tight">Posture Assessment Details</h2>
            <p className="text-muted-foreground">
              View and update posture assessment
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>
              View or update posture photos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['front', 'side', 'back'].map((view) => (
                <div key={view} className="space-y-4">
                  <h3 className="font-medium capitalize">{view} View</h3>
                  {imageUrls[view] ? (
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border">
                      <img 
                        src={imageUrls[view]} 
                        alt={`${view} view`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={() => setImageUrls(prev => ({ ...prev, [view]: null }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        id={`${view}-upload`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, view);
                        }}
                      />
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <label
                          htmlFor={`${view}-upload`}
                          className="text-sm font-medium text-primary hover:underline cursor-pointer"
                        >
                          Upload Photo
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          or drag and drop
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {aiAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                Automated analysis of posture and alignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(aiAnalysis).map(([category, details]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-medium capitalize">{category.replace('_', ' ')}</h3>
                    <div className="text-sm text-muted-foreground">
                      {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested exercises and corrections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Enter recommendations for posture improvement..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any other observations or comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional notes..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}