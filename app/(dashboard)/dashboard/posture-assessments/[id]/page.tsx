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
  const [imageUrls, setImageUrls] = useState<ImageUrls>({
    front: null,
    side: null,
    back: null
  });
  const [notes, setNotes] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);
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
        title: "Erro ao buscar detalhes da avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface ImageUrls {
    front: string | null;
    side: string | null;
    back: string | null;
  }

  type ImageType = keyof ImageUrls;

  const handleImageUpload = async (file: File, type: ImageType) => {
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

      setImageUrls((prev: ImageUrls) => ({
        ...prev,
        [type]: publicUrl
      }));

      // Trigger AI analysis when all images are uploaded
      if (Object.values({ ...imageUrls, [type]: publicUrl }).every((url) => url)) {
        await analyzePosture({ ...imageUrls, [type]: publicUrl });
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da imagem",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  interface AnalyzePostureImages {
    front: string | null;
    side: string | null;
    back: string | null;
  }

  interface AnalyzePostureResponse {
    analysis: Record<string, unknown>;
    recommendations: string;
    error?: string;
  }

  const analyzePosture = async (images: AnalyzePostureImages): Promise<void> => {
    try {
      const response = await fetch('/api/ai/analyze-posture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      const data: AnalyzePostureResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setAiAnalysis(data.analysis);
      setRecommendations(data.recommendations);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao analisar postura",
        description: error instanceof Error ? error.message : String(error),
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
        title: "Avaliação salva",
        description: "Avaliação postural foi salva com sucesso",
      });
      
      router.push('/dashboard/posture-assessments');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando detalhes da avaliação...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto buscamos as informações.</p>
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
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes da Avaliação Postural</h2>
            <p className="text-muted-foreground">
              Visualize e atualize a avaliação postural
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fotos</CardTitle>
            <CardDescription>
              Visualize ou atualize as fotos da postura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['front', 'side', 'back'] as ImageType[]).map((view) => (
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
                          Fazer Upload da Foto
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          ou arraste e solte
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
              <CardTitle>Resultados da Análise Inteligente</CardTitle>
              <CardDescription>
                Análise automática de postura e alinhamento
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
            <CardTitle>Recomendações</CardTitle>
            <CardDescription>
              Exercícios e correções sugeridos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Digite recomendações para melhoria da postura..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionais</CardTitle>
            <CardDescription>
              Adicione outras observações ou comentários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite notas adicionais..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}