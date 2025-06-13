import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, User, Sparkles } from "lucide-react";

interface StudentDetailsHeaderProps {
  student: {
    name: string;
    status: string;
  };
  isSaving: boolean;
  isResendingInvite: boolean;
  onSave: () => void;
  onResendInvite: () => void;
  onBack: () => void;
}

export function StudentDetailsHeader({
  student,
  isSaving,
  isResendingInvite,
  onSave,
  onResendInvite,
  onBack
}: StudentDetailsHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:via-blue-400/10 dark:to-blue-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
        
        {/* Back Button + Title */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Spacer para manter o botão alinhado à esquerda */}
            <div className="w-12"></div>
          </div>
          
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              {student.status === 'active' && (
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              )}
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                {student.name || "Detalhes do Aluno"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Perfil Completo • {student.status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onResendInvite}
            disabled={isResendingInvite}
            variant="outline"
            className="flex-1 h-12 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold transition-all duration-300"
          >
            <Send className="h-4 w-4 mr-2" />
            {isResendingInvite ? "Reenviando..." : "Reenviar Convite"}
          </Button>
          
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-semibold border-0"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}