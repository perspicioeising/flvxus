import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Ruler, 
  Weight, 
  Target, 
  Heart, 
  AlertTriangle,
  Clock,
  Star,
  Plus,
  X,
  Sparkles,
  Crown,
  Activity,
  Shield,
  Zap,
  Award,
  Users
} from "lucide-react";
import { useState } from "react";

interface ProfileTabProps {
  student: {
    name: string;
    email: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    height?: string;
    weight?: string;
    goals?: string[];
    medicalConditions?: string;
    emergencyContact?: string;
    preferredTime?: string;
    experienceLevel?: string;
    notes?: string;
    status?: string;
  };
  onStudentUpdate: (updates: any) => void;
}

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Perda de Peso', icon: Target, color: 'from-red-500 to-pink-600' },
  { value: 'muscle_gain', label: 'Ganho de Massa', icon: Activity, color: 'from-green-500 to-emerald-600' },
  { value: 'endurance', label: 'Resistência', icon: Heart, color: 'from-blue-500 to-indigo-600' },
  { value: 'strength', label: 'Força', icon: Crown, color: 'from-purple-500 to-indigo-600' },
  { value: 'flexibility', label: 'Flexibilidade', icon: Star, color: 'from-yellow-500 to-orange-600' },
  { value: 'health', label: 'Saúde Geral', icon: Shield, color: 'from-teal-500 to-cyan-600' }
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Iniciante', color: 'from-green-500 to-emerald-600' },
  { value: 'intermediate', label: 'Intermediário', color: 'from-blue-500 to-indigo-600' },
  { value: 'advanced', label: 'Avançado', color: 'from-purple-500 to-indigo-600' }
];

export function ProfileTab({ student, onStudentUpdate }: ProfileTabProps) {
  const [newGoal, setNewGoal] = useState('');

  const handleInputChange = (field: string, value: any) => {
    onStudentUpdate({ [field]: value });
  };

  const addGoal = (goalValue: string) => {
    if (!student.goals?.includes(goalValue)) {
      const updatedGoals = [...(student.goals || []), goalValue];
      handleInputChange('goals', updatedGoals);
    }
    setNewGoal('');
  };

  const removeGoal = (goalToRemove: string) => {
    const updatedGoals = student.goals?.filter(goal => goal !== goalToRemove) || [];
    handleInputChange('goals', updatedGoals);
  };

  const getGoalConfig = (goalValue: string) => {
    return GOAL_OPTIONS.find(option => option.value === goalValue) || {
      value: goalValue,
      label: goalValue,
      icon: Target,
      color: 'from-gray-500 to-gray-600'
    };
  };

  const getExperienceConfig = (level: string) => {
    return EXPERIENCE_LEVELS.find(exp => exp.value === level) || EXPERIENCE_LEVELS[0];
  };

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-blue-900/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informações Pessoais
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Dados básicos e informações de contato
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Nome Completo
                </Label>
                <Input
                  value={student.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="Nome do aluno"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={student.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Telefone
                </Label>
                <Input
                  value={student.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Data de Nascimento
                </Label>
                <Input
                  type="date"
                  value={student.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                />
              </div>

              {/* Gênero */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Gênero
                </Label>
                <Select value={student.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nível de Experiência */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Nível de Experiência
                </Label>
                <Select value={student.experienceLevel || ''} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                  <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Physical Information Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-emerald-500/10 to-emerald-600/10 rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-emerald-50/50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-emerald-900/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informações Físicas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Medidas corporais e características físicas
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Altura */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Altura (cm)
                </Label>
                <Input
                  type="number"
                  value={student.height || ''}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="175"
                />
              </div>

              {/* Peso */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Weight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Peso (kg)
                </Label>
                <Input
                  type="number"
                  value={student.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="70"
                />
              </div>

              {/* Horário Preferido */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Horário Preferido para Treino
                </Label>
                <Select value={student.preferredTime || ''} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 rounded-xl shadow-2xl">
                    <SelectItem value="morning">Manhã (06:00 - 12:00)</SelectItem>
                    <SelectItem value="afternoon">Tarde (12:00 - 18:00)</SelectItem>
                    <SelectItem value="evening">Noite (18:00 - 22:00)</SelectItem>
                    <SelectItem value="flexible">Flexível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contato de Emergência */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Contato de Emergência
                </Label>
                <Input
                  value={student.emergencyContact || ''}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                  placeholder="Nome e telefone"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-purple-900/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Objetivos do Treino
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Metas e objetivos específicos do aluno
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Goal Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Adicionar Objetivo
              </Label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {GOAL_OPTIONS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = student.goals?.includes(goal.value);
                  
                  return (
                    <button
                      key={goal.value}
                      onClick={() => isSelected ? removeGoal(goal.value) : addGoal(goal.value)}
                      disabled={isSelected}
                      className={`relative group p-4 rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105 cursor-pointer'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${goal.color} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div className="flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-lg ${
                            isSelected 
                              ? 'bg-gray-300 dark:bg-gray-700' 
                              : `bg-gradient-to-r ${goal.color} shadow-md`
                          }`}>
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-gray-600 dark:text-gray-400' : 'text-white'}`} />
                          </div>
                          <span className={`text-sm font-semibold text-center ${
                            isSelected ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {goal.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Goals */}
            {student.goals && student.goals.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Objetivos Selecionados</Label>
                <div className="flex flex-wrap gap-3">
                  {student.goals.map((goalValue, index) => {
                    const goalConfig = getGoalConfig(goalValue);
                    const Icon = goalConfig.icon;
                    
                    return (
                      <div key={index} className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r ${goalConfig.color} rounded-xl blur-lg opacity-100`}></div>
                        <Badge className={`relative px-4 py-2 bg-gradient-to-r ${goalConfig.color} text-white rounded-xl text-sm font-semibold border-0 shadow-lg transition-all duration-300 hover:scale-105`}>
                          <Icon className="h-4 w-4 mr-2" />
                          {goalConfig.label}
                          <button
                            onClick={() => removeGoal(goalValue)}
                            className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Information Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-red-600/10 rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="p-8 bg-gradient-to-r from-red-50/50 via-orange-50/50 to-red-50/50 dark:from-red-900/10 dark:via-orange-900/10 dark:to-red-900/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Informações Médicas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Condições de saúde e observações importantes
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Condições Médicas */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                Condições Médicas
              </Label>
              <Textarea
                value={student.medicalConditions || ''}
                onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                className="min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                placeholder="Descreva quaisquer condições médicas relevantes, lesões anteriores, cirurgias, medicamentos em uso, etc."
              />
            </div>

            {/* Observações Gerais */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-red-600 dark:text-red-400" />
                Observações Gerais
              </Label>
              <Textarea
                value={student.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
                placeholder="Observações adicionais sobre o aluno, preferências, limitações, etc."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}