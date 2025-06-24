import { Button } from "@/components/ui/button";
import { User, Sparkles, Plus, Users } from "lucide-react";

interface StudentsHeaderProps {
  studentsCount: number;
  onNewStudent: () => void;
}

export function StudentsHeader({ studentsCount, onNewStudent }: StudentsHeaderProps) {
  return (
    <div className="relative mb-8">
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-3xl blur-2xl"></div>
      
      <div className="relative card-app border border-app-border-muted rounded-3xl overflow-hidden shadow-app-xl">
        
        {/* Elementos decorativos sutis */}
        <div className="absolute inset-0 opacity-5">
          {/* Círculo superior direito */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-app-text-accent to-app-achievement-workout rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {/* Círculo inferior esquerdo menor */}
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-app-achievement-workout to-app-achievement-consecutive rounded-full transform -translate-x-8 translate-y-8"></div>
          
          {/* Linha de destaque sutil */}
          <div className="absolute top-1/2 right-12 w-20 h-px bg-gradient-to-r from-transparent via-app-text-accent/40 to-transparent transform -translate-y-1/2"></div>
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Lado esquerdo - Ícone e conteúdo */}
            <div className="flex items-center gap-5 min-w-0 flex-1">
              
              {/* Container de ícone limpo */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-medium">
                  <Users className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                
                {/* Badge de destaque pequeno */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-achievement-consecutive rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-app-heading mb-1">
                  Atletas
                </h1>
                
                <p className="text-app-text-secondary text-sm sm:text-base">
                  <span className="font-semibold text-app-text-accent">{studentsCount}</span> alunos registrados
                </p>
              </div>
            </div>

            {/* Lado direito - Botão de ação */}
            <Button
              onClick={onNewStudent}
              className="h-12 w-12 sm:h-14 sm:w-14 bg-achievement-workout hover:bg-achievement-workout/90 border-0 rounded-xl shadow-app-medium hover:shadow-app-large transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Linha de destaque inferior sutil */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-app-text-accent/30 to-transparent"></div>
      </div>
    </div>
  );
}