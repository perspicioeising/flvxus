'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart, Phone, FileText, Shield, AlertTriangle, Check, Mail, Loader2 } from 'lucide-react';
import { StudentFormData } from '@/types/student';

interface MedicalInfoStepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
  onSave?: () => void;
  isSaving?: boolean;
  mode?: 'create' | 'edit';
}

export function MedicalInfoStep({ 
  data, 
  onChange, 
  errors, 
  onSave, 
  isSaving = false,
  mode = 'create' 
}: MedicalInfoStepProps) {
  return (
    <div className="space-y-6">
      
      {/* Condições Médicas */}
      <div className="space-y-3">
        <Label htmlFor="medicalConditions" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Heart className="h-4 w-4 text-app-text-accent" />
          Condições Médicas
        </Label>
        <Textarea
          id="medicalConditions"
          placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
          value={data.medicalConditions}
          onChange={(e) => onChange({ medicalConditions: e.target.value })}
          className="min-h-[120px] bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all resize-none text-base"
        />
        <div className="flex items-center gap-2 text-xs text-app-text-secondary">
          <Shield className="h-3 w-3" />
          <span>Informações confidenciais e protegidas</span>
        </div>
      </div>

      {/* Contato de Emergência */}
      <div className="space-y-3">
        <Label htmlFor="emergencyContact" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <Phone className="h-4 w-4 text-app-text-accent" />
          Contato de Emergência
        </Label>
        <Input
          id="emergencyContact"
          placeholder="Nome e telefone do contato de emergência"
          value={data.emergencyContact}
          onChange={(e) => onChange({ emergencyContact: e.target.value })}
          className="h-12 bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all text-base"
        />
        <p className="text-xs text-app-text-secondary">
          Ex: Maria Silva - (11) 99999-9999 (mãe)
        </p>
      </div>

      {/* Notas Adicionais */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
          <FileText className="h-4 w-4 text-app-text-accent" />
          Notas Adicionais
        </Label>
        <Textarea
          id="notes"
          placeholder="Qualquer informação adicional relevante sobre o aluno..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="min-h-[100px] bg-app-card border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent transition-all resize-none text-base"
        />
      </div>

      {/* Checklist de Segurança */}
      <div className="bg-app-text-accent/10 rounded-xl p-5 border border-app-border-accent">
        <div className="flex items-start gap-3 mb-4">
          <Heart className="h-5 w-5 text-app-text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-app-text-primary">
              Informações de Saúde e Segurança
            </h4>
            <p className="text-sm text-app-text-secondary mt-1">
              É fundamental conhecer limitações e condições do aluno para um treino seguro.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-app-text-accent/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-app-text-accent"></div>
            </div>
            <span className="text-app-text-primary">
              Lesões anteriores ou atuais
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-app-text-accent/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-app-text-accent"></div>
            </div>
            <span className="text-app-text-primary">
              Medicamentos em uso
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-app-text-accent/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-app-text-accent"></div>
            </div>
            <span className="text-app-text-primary">
              Limitações físicas
            </span>
          </div>
          
          <div className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-app-text-accent/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-app-text-accent"></div>
            </div>
            <span className="text-app-text-primary">
              Histórico de cirurgias
            </span>
          </div>
        </div>
      </div>

      {/* Aviso de Privacidade */}
      <div className="bg-app-achievement-exercise/10 rounded-xl p-4 border border-app-border-accent">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-app-achievement-exercise mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-app-text-primary mb-1">
              Privacidade e Segurança
            </h4>
            <p className="text-sm text-app-text-secondary">
              Todas as informações médicas são confidenciais e protegidas de acordo com a LGPD. 
              Apenas profissionais autorizados terão acesso a esses dados.
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Emergência Visual */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30">
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

      {/* Botão de Finalização - Apenas no último step */}
      {onSave && (
        <div className="pt-6 border-t border-app-border-muted">
          <div className="text-center space-y-4">
            <div className="bg-app-achievement-workout/10 rounded-xl p-4 border border-app-border-accent">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-achievement-workout rounded-full flex items-center justify-center">
                  {mode === 'edit' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Mail className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-app-text-primary">
                    {mode === 'edit' ? 'Pronto para salvar!' : 'Pronto para enviar o convite!'}
                  </h4>
                  <p className="text-sm text-app-text-secondary">
                    {mode === 'edit' 
                      ? 'As alterações serão salvas no perfil do aluno'
                      : 'Um email será enviado para o aluno definir sua senha'
                    }
                  </p>
                </div>
              </div>
              
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="w-full h-12 btn-gradient-primary rounded-xl font-bold text-lg shadow-app-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === 'edit' ? 'Salvando...' : 'Enviando convite...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Enviar Convite
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-app-text-secondary">
              {mode === 'edit' 
                ? 'As informações serão atualizadas no sistema'
                : 'O aluno receberá um email com instruções para acessar o sistema'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}