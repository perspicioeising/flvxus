import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Users, Target, Heart, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EXPERIENCE_LEVELS: { [key: string]: string } = {
  "iniciante": "Iniciante",
  "intermediario": "Intermediário", 
  "avancado": "Avançado"
};

const TRAINING_TIMES: { [key: string]: string } = {
  "madrugada": "Madrugada",
  "manha": "Manhã",
  "tarde": "Tarde", 
  "noite": "Noite"
};

const GENDERS: { [key: string]: string } = {
  "male": "Masculino",
  "female": "Feminino",
  "other": "Outro"
};

interface ProfileViewTabProps {
  student: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    gender: string;
    height: string;
    weight: string;
    goals: string[];
    medicalConditions: string;
    emergencyContact: string;
    preferredTime: string;
    experienceLevel: string;
    notes: string;
    status: string;
  };
}

export function ProfileViewTab({ student }: ProfileViewTabProps) {
  const formatBirthDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const InfoField = ({ icon: Icon, label, value, iconColor = "text-blue-600 dark:text-blue-400" }: {
    icon: any;
    label: string;
    value: string | number | null;
    iconColor?: string;
  }) => (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
      <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
          {value || "Não informado"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Informações Básicas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Dados pessoais e informações de contato
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField icon={User} label="Nome Completo" value={student.name} />
              <InfoField icon={Mail} label="E-mail" value={student.email} />
              <InfoField icon={Phone} label="Telefone" value={student.phone} />
              <InfoField icon={Calendar} label="Data de Nascimento" value={formatBirthDate(student.birthDate)} />
              <InfoField icon={Users} label="Gênero" value={GENDERS[student.gender] || student.gender} />
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                    Status
                  </p>
                  <Badge className={`${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600'
                  }`}>
                    {student.status === 'active' ? '● Ativo' : '○ Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Physical Information */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Informações Físicas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Medidas físicas e objetivos de fitness
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField icon={Target} label="Altura" value={student.height ? `${student.height} cm` : null} />
              <InfoField icon={Target} label="Peso" value={student.weight ? `${student.weight} kg` : null} />
              <InfoField 
                icon={Target} 
                label="Nível de Experiência" 
                value={EXPERIENCE_LEVELS[student.experienceLevel] || student.experienceLevel} 
              />
              <InfoField 
                icon={Clock} 
                label="Horário Preferido" 
                value={TRAINING_TIMES[student.preferredTime] || student.preferredTime} 
              />
            </div>

            {/* Goals */}
            {student.goals && student.goals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Objetivos de Fitness:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.map((goal, index) => (
                    <Badge
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full text-xs font-medium"
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      {(student.medicalConditions || student.emergencyContact) && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Informações Médicas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Condições médicas e contato de emergência
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.medicalConditions && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg mt-1">
                      <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase tracking-wider mb-2">
                        Condições Médicas
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {student.medicalConditions}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {student.emergencyContact && (
                <InfoField icon={Phone} label="Contato de Emergência" value={student.emergencyContact} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Notes */}
      {student.notes && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Notas Adicionais
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Observações e informações complementares
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg mt-1">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider mb-2">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {student.notes}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}