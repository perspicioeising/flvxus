// components/exercises/steps/StepReview.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2, FileText, Video, Mic, Target, AlertTriangle, Lightbulb, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { getMuscleGroupIcon } from '@/components/exercices/components/constants/exercise';

interface ReviewItem {
  label: string;
  value: string | number;
  type?: 'count';
  required?: boolean;
  status?: boolean;
}

interface ReviewSection {
  title: string;
  icon: any;
  color: string;
  complete: boolean;
  optional?: boolean;
  items: ReviewItem[];
}

interface StepReviewProps {
  formData: {
    name: string;
    description: string;
    muscle_group: string[];
    equipment: string[];
    variations: string;
    video_url: string;
    audio_url: string;
    tips: string;
    common_errors: string;
  };
  videoUrl: string;
  audioUrl: string;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function StepReview({ formData, videoUrl, audioUrl, onSave, isSaving }: StepReviewProps) {
  const hasVideo = Boolean(videoUrl || formData.video_url);
  const hasAudio = Boolean(audioUrl || formData.audio_url);
  const variationsCount = formData.variations.split('\n').filter(v => v.trim()).length;
  const tipsCount = formData.tips.split('\n').filter(t => t.trim()).length;
  const errorsCount = formData.common_errors.split('\n').filter(e => e.trim()).length;

  const sections: ReviewSection[] = [
    {
      title: "Informações Básicas",
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      complete: Boolean(formData.name && formData.description && formData.muscle_group.length > 0 && formData.equipment.length > 0),
      items: [
        { label: "Nome", value: formData.name || "Não informado", required: true },
        { label: "Descrição", value: formData.description || "Não informada", required: true },
        { label: "Grupos Musculares", value: formData.muscle_group.length || 0, type: "count", required: true },
        { label: "Equipamentos", value: formData.equipment.length || 0, type: "count", required: true }
      ]
    },
    {
      title: "Mídia",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
      complete: hasVideo || hasAudio,
      optional: true,
      items: [
        { label: "Vídeo", value: hasVideo ? "Adicionado" : "Não adicionado", status: hasVideo },
        { label: "Áudio", value: hasAudio ? "Adicionado" : "Não adicionado", status: hasAudio }
      ]
    },
    {
      title: "Detalhes Avançados",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      complete: variationsCount > 0 || tipsCount > 0 || errorsCount > 0,
      optional: true,
      items: [
        { label: "Variações", value: variationsCount || 0, type: "count" },
        { label: "Dicas", value: tipsCount || 0, type: "count" },
        { label: "Erros Comuns", value: errorsCount || 0, type: "count" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Revisão Final
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Revise todas as informações antes de salvar
          </p>
        </div>
      </div>

      {/* Success Card */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">
              Exercício Pronto para Salvar!
            </h3>
            <p className="text-green-700 dark:text-green-400">
              Revise os detalhes abaixo e clique em salvar para adicionar à biblioteca.
            </p>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${section.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${section.color} rounded-xl shadow-md`}>
                      <section.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </CardTitle>
                      {section.optional && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Opcional
                        </Badge>
                      )}
                    </div>
                  </div>
                  {section.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : section.optional ? (
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                      Não preenchido
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Incompleto
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {item.label}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.type === 'count' ? (
                          <Badge className={`px-3 py-1 ${
                            Number(item.value) > 0 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.value} {Number(item.value) === 1 ? 'item' : 'itens'}
                          </Badge>
                        ) : 'status' in item && item.status !== undefined ? (
                          item.status ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                                {item.value}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {item.value}
                            </span>
                          )
                        ) : (
                          <span className={`text-sm font-semibold ${
                            item.value && item.value !== "Não informado" && item.value !== "Não informada"
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special display for muscle groups and equipment */}
                {section.title === "Informações Básicas" && (
                  <div className="mt-4 space-y-3">
                    {formData.muscle_group.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Grupos Musculares:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.muscle_group.map((group) => {
                            const groupInfo = getMuscleGroupIcon(group);
                            return (
                              <Badge
                                key={group}
                                className={`px-3 py-1 bg-gradient-to-r ${groupInfo.color} text-white rounded-full text-xs font-semibold border-0`}
                              >
                                {groupInfo.icon} {group}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {formData.equipment.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Equipamentos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.equipment.map((equip) => (
                            <Badge
                              key={equip}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {equip}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl"></div>
        <Button
          onClick={onSave}
          disabled={isSaving || !formData.name || !formData.description || formData.muscle_group.length === 0 || formData.equipment.length === 0}
          className="relative w-full h-14 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 border-0 text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Salvando Exercício...
            </>
          ) : (
            <>
              <Save className="mr-3 h-6 w-6" />
              Salvar Exercício
            </>
          )}
        </Button>
      </div>
    </div>
  );
}