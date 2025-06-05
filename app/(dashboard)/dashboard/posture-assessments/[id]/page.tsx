'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/app/providers";
import { ArrowLeft, Upload, Camera, X, Image as ImageIcon, Save, Loader2, Brain, Target, FileText, Sparkles, Zap, CheckCircle, Eye, Settings, User, Send, Activity, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function PostureAssessmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  interface Assessment {
    id: string;
    created_at: string;
    student?: {
      full_name?: string;
    };
    front_image_url?: string | null;
    side_image_url?: string | null;
    back_image_url?: string | null;
    notes?: string;
    ai_analysis?: Record<string, unknown> | null;
    recommendations?: string;
    // add other fields as needed
  }

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState("photos");
  const [loadingStates, setLoadingStates] = useState({
    photos: true,
    analysis: false,
    notes: false
  });
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
      setLoadingStates(prev => ({ ...prev, photos: true }));
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
      setLoadingStates(prev => ({ ...prev, photos: false }));
      setIsLoading(false);
    }
  };

  interface ImageUrls {
    front: string | null;
    side: string | null;
    back: string | null;
  }

  type ImageType = keyof ImageUrls;

  const TabLoading = () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );

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

      toast({
        title: "Imagem enviada",
        description: `Foto ${type === 'front' ? 'frontal' : type === 'side' ? 'lateral' : 'posterior'} foi carregada com sucesso`,
      });

      // Trigger AI analysis when all images are uploaded
      const updatedUrls = { ...imageUrls, [type]: publicUrl };
      if (Object.values(updatedUrls).every((url) => url)) {
        await analyzePosture(updatedUrls);
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
      setIsAnalyzing(true);
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

      toast({
        title: "Análise concluída",
        description: "A análise postural foi realizada com sucesso",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao analisar postura",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsAnalyzing(false);
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

  const triggerManualAnalysis = async () => {
    if (!imageUrls.front || !imageUrls.side || !imageUrls.back) {
      toast({
        variant: "destructive",
        title: "Fotos necessárias",
        description: "Carregue todas as fotos (frontal, lateral e posterior) para realizar a análise",
      });
      return;
    }
    await analyzePosture(imageUrls);
  };

  // Calcular estatísticas
  const uploadedImages = Object.values(imageUrls).filter(Boolean).length;
  const completionPercentage = (uploadedImages / 3) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                    Avaliação Postural
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {assessment?.student?.full_name || 'Carregando...'}
                      </span>
                    </p>
                    {assessment?.created_at && (
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600 rounded-full">
                        {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-gray-500/25 transition-all duration-300 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="photos" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-2 shadow-lg">
              <TabsTrigger 
                value="photos" 
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Fotos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analysis"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Análise</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Anotações</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Photos Tab */}
          <TabsContent value="photos">
            {loadingStates.photos ? (
              <TabLoading />
            ) : (
              <div className="space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Fotos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{uploadedImages}/3</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-teal-600/10 rounded-2xl blur-xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Análise IA</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{aiAnalysis ? '✓' : '—'}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 ${aiAnalysis ? 'w-full' : 'w-0'}`}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Recomendações</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendations ? '✓' : '—'}</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ${recommendations ? 'w-full' : 'w-0'}`}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">Progresso</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(completionPercentage)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Photos Upload */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Fotos da Avaliação</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Capture ou visualize as fotos posturais (frontal, lateral e posterior)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {(['front', 'side', 'back'] as ImageType[]).map((view, index) => (
                          <div key={view} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                view === 'front' ? 'bg-blue-500/20' : 
                                view === 'side' ? 'bg-purple-500/20' : 'bg-pink-500/20'
                              }`}>
                                <Camera className={`h-5 w-5 ${
                                  view === 'front' ? 'text-blue-600' : 
                                  view === 'side' ? 'text-purple-600' : 'text-pink-600'
                                }`} />
                              </div>
                              <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 capitalize">
                                {view === 'front' ? 'Vista Frontal' : view === 'side' ? 'Vista Lateral' : 'Vista Posterior'}
                              </h3>
                            </div>
                            
                            {imageUrls[view] ? (
                              <div className="relative group/image">
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/50 shadow-2xl group-hover/image:scale-[1.02] transition-all duration-300">
                                  <img 
                                    src={imageUrls[view]} 
                                    alt={`${view} view`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-xl opacity-0 group-hover/image:opacity-100 transition-all duration-300"
                                    onClick={() => setImageUrls(prev => ({ ...prev, [view]: null }))}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-green-800 dark:text-green-300 font-medium text-sm">
                                      Foto carregada com sucesso
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="relative group/upload">
                                <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-4 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 group-hover/upload:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
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
                                  <div className={`p-6 rounded-full ${
                                    view === 'front' ? 'bg-blue-500/20' : 
                                    view === 'side' ? 'bg-purple-500/20' : 'bg-pink-500/20'
                                  }`}>
                                    <ImageIcon className={`h-12 w-12 ${
                                      view === 'front' ? 'text-blue-600' : 
                                      view === 'side' ? 'text-purple-600' : 'text-pink-600'
                                    }`} />
                                  </div>
                                  <div className="text-center space-y-2">
                                    <label
                                      htmlFor={`${view}-upload`}
                                      className={`text-lg font-bold ${
                                        view === 'front' ? 'text-blue-600' : 
                                        view === 'side' ? 'text-purple-600' : 'text-pink-600'
                                      } hover:underline cursor-pointer transition-all duration-300`}
                                    >
                                      Fazer Upload da Foto
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Clique aqui ou arraste e solte
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      JPG, PNG até 10MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {uploadedImages === 3 && !aiAnalysis && (
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                                <Brain className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300">
                                  Pronto para Análise
                                </h3>
                                <p className="text-blue-600 dark:text-blue-400">
                                  Todas as fotos foram carregadas. Execute a análise inteligente da postura.
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={triggerManualAnalysis}
                              disabled={isAnalyzing}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Analisando...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-5 w-5" />
                                  Analisar Postura
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            {loadingStates.analysis ? (
              <TabLoading />
            ) : aiAnalysis ? (
              <div className="space-y-8">
                {/* AI Analysis Results */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-teal-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente da Postura</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Resultados da análise automática de alinhamento e postura
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        {Object.entries(aiAnalysis).map(([category, details], index) => (
                          <div key={category} className="group bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-l-4 border-l-green-500 dark:border-l-green-400 shadow-sm hover:shadow-md rounded-2xl">
                            <div className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                                  <Target className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 space-y-3">
                                  <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 capitalize">
                                    {category.replace('_', ' ')}
                                  </h3>
                                  <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800/50 dark:to-green-900/20 rounded-xl border border-gray-200/50 dark:border-green-700/30">
                                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                                      {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Recomendações Personalizadas</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Exercícios e correções sugeridos para melhoria da postura
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="recommendations" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Plano de Correção Postural
                        </Label>
                        <Textarea
                          id="recommendations"
                          value={recommendations}
                          onChange={(e) => setRecommendations(e.target.value)}
                          placeholder="Digite as recomendações específicas para correção da postura..."
                          className="min-h-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inclua exercícios específicos, frequência recomendada e pontos de atenção
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <CardContent className="text-center py-20">
                    <div className="relative mb-8">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 dark:from-gray-900/30 dark:via-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
                        <Brain className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-400/30 via-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Análise Não Realizada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      Carregue todas as fotos (frontal, lateral e posterior) e execute a análise inteligente para obter insights detalhados sobre a postura
                    </p>
                    <Button
                      onClick={() => setActiveTab('photos')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Ir para Fotos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {loadingStates.notes ? (
              <TabLoading />
            ) : (
              <div className="space-y-8">
                {/* Notes */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Anotações Profissionais</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Registre observações, histórico e informações complementares
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Observações do Profissional
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Registre suas observações sobre a postura, histórico de dores, limitações de movimento, progressos observados..."
                          className="min-h-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inclua informações relevantes sobre o histórico postural, dores relatadas e observações importantes
                        </p>
                      </div>

                      {/* Quick Notes Suggestions */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Sugestões Rápidas
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            'Anteriorização da cabeça observada',
                            'Ombros elevados e tensionados',
                            'Hipercifose torácica presente',
                            'Anteversão pélvica identificada',
                            'Desequilíbrio entre membros',
                            'Melhora significativa observada'
                          ].map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setNotes(prev => prev ? `${prev}\n• ${suggestion}` : `• ${suggestion}`)}
                              className="group p-4 text-left bg-white dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                  <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span>{suggestion}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}