// components/exercises/steps/StepMedia.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Video, Upload, Loader2, Volume2, Play, Mic, CheckCircle, Info, Link, Brain } from 'lucide-react';

interface StepMediaProps {
  formData: {
    name?: string;
    video_url: string;
    audio_url: string;
    description: string;
    tips: string;
    common_errors: string;
  };
  onUpdateField: (field: string, value: any) => void;
  videoFile: File | null;
  audioFile: File | null;
  videoUrl: string;
  audioUrl: string;
  onVideoFileChange: (file: File | null) => void;
  onAudioFileChange: (file: File | null) => void;
  onVideoUrlChange: (url: string) => void;
  onAudioUrlChange: (url: string) => void;
}

export function StepMedia({ 
  formData, 
  onUpdateField,
  videoFile,
  audioFile,
  videoUrl,
  audioUrl,
  onVideoFileChange,
  onAudioFileChange,
  onVideoUrlChange,
  onAudioUrlChange
}: StepMediaProps) {
  const { toast } = useToast();
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);

  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploadingVideo(true);
      onVideoFileChange(file);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/exercises/upload-video', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      onVideoUrlChange(data.url);
      onUpdateField('video_url', data.url);
      setUploadProgress(100);

      toast({
        title: "Vídeo enviado com sucesso! 🎉",
        description: "O vídeo foi processado e está pronto para uso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar vídeo",
        description: error.message,
      });
      onVideoFileChange(null);
    } finally {
      setIsUploadingVideo(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      setIsUploadingAudio(true);
      onAudioFileChange(file);
      setAudioUploadProgress(10);
      
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/exercises/upload-audio', {
        method: 'POST',
        body: formData,
      });

      setAudioUploadProgress(90);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      onAudioUrlChange(data.url);
      onUpdateField('audio_url', data.url);
      setAudioUploadProgress(100);

      toast({
        title: "Áudio enviado com sucesso! 🎉",
        description: "O áudio foi processado e está pronto para uso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar áudio",
        description: error.message,
      });
      onAudioFileChange(null);
    } finally {
      setIsUploadingAudio(false);
      setTimeout(() => setAudioUploadProgress(0), 1000);
    }
  };

  const generateAudioWithAI = async () => {
    if (!hasInstructionsForAudio()) {
      toast({
        variant: "destructive",
        title: "Informações insuficientes",
        description: "É necessário ter dicas de execução preenchidas para gerar o áudio",
      });
      return;
    }

    try {
      setIsGeneratingAudio(true);
      
      const response = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: formData.name || "Exercício",
          tips: formData.tips,
          common_errors: formData.common_errors
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      onAudioUrlChange(data.url);
      onUpdateField('audio_url', data.url);

      toast({
        title: "Áudio gerado com sucesso! 🎉",
        description: "O áudio foi criado com IA e está pronto para uso",
      });

    } catch (error: any) {
      console.error('Erro na geração de áudio:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar áudio",
        description: error.message,
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const hasInstructionsForAudio = () => {
    return Boolean(formData.tips && formData.tips.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 achievement-exercise rounded-2xl shadow-app-large">
          <Video className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-app-heading">
            Mídia Demonstrativa
          </h2>
          <p className="text-app-text-secondary">
            Adicione vídeo e áudio para melhor demonstração
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Mídia é opcional mas recomendada!</p>
            <p>Vídeos e áudios ajudam os alunos a executar os exercícios corretamente. Você pode fazer upload ou usar links externos.</p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-xl hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 achievement-exercise rounded-xl shadow-app-medium">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-text-primary">
                  Vídeo Demonstrativo
                </CardTitle>
                <CardDescription className="text-app-text-secondary">
                  Upload de arquivo ou URL externa
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <Label htmlFor="video_url" className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
                <Link className="h-4 w-4 text-app-text-accent" />
                URL do Vídeo
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                <Input
                  id="video_url"
                  placeholder="ex.: https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => onUpdateField('video_url', e.target.value)}
                  className="relative h-12 bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 h-px bg-app-border-muted"></div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-app-text-muted bg-app-card">
                  ou
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploadingVideo}
                />
                <Button 
                  asChild 
                  disabled={isUploadingVideo}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl h-12 px-6 font-bold shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <label htmlFor="video-upload" className="cursor-pointer flex items-center">
                    {isUploadingVideo ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 mr-3" />
                    )}
                    {isUploadingVideo ? 'Enviando...' : 'Upload Vídeo'}
                  </label>
                </Button>
                {videoFile && (
                  <Badge className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-600 rounded-full font-semibold">
                    {videoFile.name}
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && (
                <div className="w-full bg-app-bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Success Message */}
              {videoUrl && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-300 font-semibold">
                      Vídeo adicionado com sucesso!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-app-card backdrop-blur-xl shadow-app-xl hover:shadow-app-xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="relative pb-4">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 achievement-exercise rounded-xl shadow-app-medium">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-text-primary">
                    Áudio de Instruções
                  </CardTitle>
                  <CardDescription className="text-app-text-secondary">
                    Upload, URL ou gere com IA
                  </CardDescription>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={generateAudioWithAI} 
                disabled={isGeneratingAudio || !hasInstructionsForAudio()}
                className="group bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-600 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/50 dark:hover:to-red-800/50 rounded-xl h-12 px-6 font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-800 dark:text-orange-300">Gerando...</span>
                  </>
                ) : (
                  <>
                    <Brain className="mr-3 h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />
                    <span className="text-orange-800 dark:text-orange-300">Gerar Áudio com IA</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Info sobre geração de áudio */}
            {!hasInstructionsForAudio() && (
              <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Para gerar áudio com IA, preencha as <strong>dicas de execução</strong> na etapa anterior. 
                    O áudio será criado baseado nas instruções e erros comuns.
                  </p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <Label htmlFor="audio_url" className="text-sm font-bold text-app-text-primary uppercase tracking-wider flex items-center gap-2">
                <Link className="h-4 w-4 text-app-text-accent" />
                URL do Áudio
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/20 to-app-btn-primary/20 rounded-xl blur opacity-50"></div>
                <Input
                  id="audio_url"
                  placeholder="ex.: https://example.com/audio.mp3"
                  value={formData.audio_url}
                  onChange={(e) => onUpdateField('audio_url', e.target.value)}
                  className="relative h-12 bg-app-card border-0 rounded-xl shadow-app-large backdrop-blur-sm focus:shadow-app-xl transition-all duration-300"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 h-px bg-app-border-muted"></div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-app-text-muted bg-app-card">
                  ou
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAudioUpload(file);
                  }}
                  className="hidden"
                  id="audio-upload"
                  disabled={isUploadingAudio}
                />
                <Button 
                  asChild 
                  disabled={isUploadingAudio}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl h-12 px-6 font-bold shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <label htmlFor="audio-upload" className="cursor-pointer flex items-center">
                    {isUploadingAudio ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 mr-3" />
                    )}
                    {isUploadingAudio ? 'Enviando...' : 'Upload Áudio'}
                  </label>
                </Button>
                {audioFile && (
                  <Badge className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 dark:border-purple-600 rounded-full font-semibold">
                    {audioFile.name}
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              {audioUploadProgress > 0 && (
                <div className="w-full bg-app-bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${audioUploadProgress}%` }}
                  />
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-purple-800 dark:text-purple-300 font-semibold">
                      Áudio disponível:
                    </span>
                  </div>
                  <audio controls className="w-full h-12 rounded-xl">
                    <source src={audioUrl} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}