// components/exercises/steps/StepDetails.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, AlertTriangle, Lightbulb, RefreshCw, Info } from 'lucide-react';

interface StepDetailsProps {
  formData: {
    variations: string;
    tips: string;
    common_errors: string;
  };
  onUpdateField: (field: string, value: any) => void;
}

export function StepDetails({ formData, onUpdateField }: StepDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
          <Target className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Detalhes Avançados
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Adicione informações complementares para enriquecer o exercício
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="text-sm text-purple-800 dark:text-purple-300">
            <p className="font-semibold mb-1">Detalhes fazem a diferença!</p>
            <p>Quanto mais informações você fornecer, melhor será a execução do exercício pelos alunos. Todos os campos são opcionais.</p>
          </div>
        </div>
      </div>

      {/* Variations Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-md">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Variações do Exercício
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Diferentes formas de executar o exercício
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="variations" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Liste as variações (uma por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="variations"
                  value={formData.variations}
                  onChange={(e) => onUpdateField('variations', e.target.value)}
                  placeholder="Ex:\nSupino com halteres\nSupino inclinado\nSupino declinado\nSupino na máquina"
                  className="relative min-h-[140px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicione cada variação em uma nova linha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Dicas de Execução
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Conselhos para melhor aproveitamento
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="tips" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Dicas importantes (uma por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="tips"
                  value={formData.tips}
                  onChange={(e) => onUpdateField('tips', e.target.value)}
                  placeholder="Ex:\nMantenha o core contraído durante todo o movimento\nRespire ao descer e expire ao subir\nMantenha os cotovelos alinhados com os ombros\nUse a pegada na largura dos ombros"
                  className="relative min-h-[140px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicione cada dica em uma nova linha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Errors Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-yellow-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-md">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Erros Comuns
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Erros frequentes a serem evitados
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-3">
              <Label htmlFor="common_errors" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Erros a evitar (um por linha)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-50"></div>
                <Textarea
                  id="common_errors"
                  value={formData.common_errors}
                  onChange={(e) => onUpdateField('common_errors', e.target.value)}
                  placeholder="Ex:\nArquear demais as costas\nDescer a barra muito rápido\nNão tocar o peito com a barra\nEmpurrar com os ombros ao invés do peitoral"
                  className="relative min-h-[140px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicione cada erro em uma nova linha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}