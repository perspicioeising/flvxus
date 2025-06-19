'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Phone, FileText, Shield, AlertTriangle } from 'lucide-react';
import { StudentFormData } from '@/types/student';

interface MedicalInfoStepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
}

export function MedicalInfoStep({ data, onChange, errors }: MedicalInfoStepProps) {
  return (
    <div className="space-y-6">
      
      {/* Condições Médicas */}
      <div className="space-y-3">
        <Label htmlFor="medicalConditions" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
          Condições Médicas
        </Label>
        <Textarea
          id="medicalConditions"
          placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
          value={data.medicalConditions}
          onChange={(e) => onChange({ medicalConditions: e.target.value })}
          className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none text-base"
        />
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Shield className="h-3 w-3" />
          <span>Informações confidenciais e protegidas</span>
        </div>
      </div>

      {/* Contato de Emergência */}
      <div className="space-y-3">
        <Label htmlFor="emergencyContact" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
          Contato de Emergência
        </Label>
        <Input
          id="emergencyContact"
          placeholder="Nome e telefone do contato de emergência"
          value={data.emergencyContact}
          onChange={(e) => onChange({ emergencyContact: e.target.value })}
          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-base"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ex: Maria Silva - (11) 99999-9999 (mãe)
        </p>
      </div>

      {/* Notas Adicionais */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          Notas Adicionais
        </Label>
        <Textarea
          id="notes"
          placeholder="Qualquer informação adicional relevante sobre o aluno..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none text-base"
        />
      </div>

      {/* Checklist de Segurança */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200/50 dark:border-green-800/30">
        <div className="flex items-start gap-3 mb-4">
          <Heart className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100">
              Informações de Saúde e Segurança
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              É fundamental conhecer limitações e condições do aluno para um treino seguro.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
            </div>
            <span className="text-green-800 dark:text-green-200">
              Lesões anteriores ou atuais
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
            </div>
            <span className="text-green-800 dark:text-green-200">
              Medicamentos em uso
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
            </div>
            <span className="text-green-800 dark:text-green-200">
              Limitações físicas
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
            </div>
            <span className="text-green-800 dark:text-green-200">
              Histórico de cirurgias
            </span>
          </div>
        </div>
      </div>

      {/* Aviso de Privacidade */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Privacidade e Segurança
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Todas as informações médicas são confidenciais e protegidas de acordo com a LGPD. 
              Apenas profissionais autorizados terão acesso a esses dados.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Emergência Visual */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
              Importante
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Em caso de emergência médica durante o treino, o contato informado será acionado imediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
