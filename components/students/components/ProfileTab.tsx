import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Calendar, Users, Target, Heart, Clock, FileText } from "lucide-react";

const EXPERIENCE_LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const TRAINING_TIMES = ["Madrugada", "Manhã", "Tarde", "Noite"];
const GOALS = [
  "Perda de Peso",
  "Ganho de Massa",
  "Força",
  "Resistência",
  "Flexibilidade",
  "Condicionamento Geral",
  "Performance Esportiva",
  "Reabilitação"
];

interface ProfileTabProps {
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
  onStudentUpdate: (updates: any) => void;
}

export function ProfileTab({ student, onStudentUpdate }: ProfileTabProps) {
  const updateField = (field: string, value: any) => {
    onStudentUpdate({ [field]: value });
  };

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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Nome Completo
                </Label>
                <Input
                  value={student.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  E-mail
                </Label>
                <Input
                  value={student.email}
                  disabled
                  className="h-12 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Telefone
                </Label>
                <Input
                  value={student.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Data de Nascimento
                </Label>
                <Input
                  type="date"
                  value={student.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Gênero
                </Label>
                <Select
                  value={student.gender}
                  onValueChange={(value) => updateField('gender', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Status
                </Label>
                <Select
                  value={student.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Altura (cm)
                </Label>
                <Input
                  type="number"
                  value={student.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Peso (kg)
                </Label>
                <Input
                  type="number"
                  value={student.weight}
                  onChange={(e) => updateField('weight', e.target.value)}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Objetivos de Fitness
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOALS.map((goal) => (
                  <div key={goal} className="relative">
                    <input
                      type="checkbox"
                      id={goal}
                      checked={student.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('goals', [...student.goals, goal]);
                        } else {
                          updateField('goals', student.goals.filter(g => g !== goal));
                        }
                      }}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={goal}
                      className="flex items-center justify-center p-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 dark:peer-checked:border-blue-400 peer-checked:text-blue-700 dark:peer-checked:text-blue-300"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nível de Experiência
                </Label>
                <Select
                  value={student.experienceLevel}
                  onValueChange={(value) => updateField('experienceLevel', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Horário Preferido
                </Label>
                <Select
                  value={student.preferredTime}
                  onValueChange={(value) => updateField('preferredTime', value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                    {TRAINING_TIMES.map((time) => (
                      <SelectItem key={time} value={time.toLowerCase()}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
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
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Condições Médicas
              </Label>
              <Textarea
                placeholder="Liste quaisquer condições médicas, lesões ou limitações importantes..."
                value={student.medicalConditions}
                onChange={(e) => updateField('medicalConditions', e.target.value)}
                className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Contato de Emergência
              </Label>
              <Input
                placeholder="Nome e telefone do contato de emergência"
                value={student.emergencyContact}
                onChange={(e) => updateField('emergencyContact', e.target.value)}
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
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
            <Textarea
              placeholder="Adicione observações importantes sobre o aluno..."
              value={student.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}