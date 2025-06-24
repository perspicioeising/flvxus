'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentProfile, PhysicalAssessment } from '@/components/students/components/types/student';
import { 
  FileText, 
  User,
  Heart, 
  Target,
  Phone,
  Clock,
  Calendar,
  Ruler,
  Weight,
  Activity,
  AlertTriangle,
  Expand,
  Sparkles,
  ListCollapse,
  TrendingUp,
  Shield,
  Mail,
  BarChart3,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface StudentDetailsContentProps {
  student: StudentProfile;
}

export function StudentDetailsContent({ student }: StudentDetailsContentProps) {
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    physical: false,
    health: false,
    preferences: false,
    assessments: false
  });

  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch assessments when section is expanded
  useEffect(() => {
    if (expandedSections.assessments && assessments.length === 0) {
      fetchAssessments();
    }
  }, [expandedSections.assessments]);

  const fetchAssessments = async () => {
    try {
      setIsLoadingAssessments(true);
      const response = await fetch(`/api/students/${student.id}/assessments?type=physical`);
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAge = () => {
    if (!student.birth_date) return null;
    const birthDate = new Date(student.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getBMI = () => {
    if (!student.height || !student.weight) return null;
    const heightInMeters = student.height / 100;
    const bmi = student.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-achievement-consecutive' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
    return { label: 'Obesidade', color: 'text-red-600' };
  };

  const getGoalLabel = (goal: string) => {
    const goals: Record<string, string> = {
      'weight_loss': 'Perda de Peso',
      'muscle_gain': 'Ganho de Massa',
      'strength': 'Força',
      'endurance': 'Resistência',
      'flexibility': 'Flexibilidade',
      'general_fitness': 'Condicionamento Geral',
      'sports_performance': 'Performance Esportiva',
      'rehabilitation': 'Reabilitação'
    };
    return goals[goal] || goal;
  };

  const getExperienceLabel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
    return levels[level] || level;
  };

  const getTrainingTimeLabel = (time: string) => {
    const times: Record<string, string> = {
      'dawn': 'Madrugada (05:00 - 07:00)',
      'morning': 'Manhã (07:00 - 12:00)',
      'afternoon': 'Tarde (12:00 - 18:00)',
      'evening': 'Noite (18:00 - 22:00)'
    };
    return times[time] || time;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Personal Information */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-workout rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Informações Pessoais
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('personal')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.personal ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.personal || window.innerWidth >= 640) && (
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                    <div className="w-8 h-8 bg-achievement-workout/20 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-achievement-workout" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Nome Completo</div>
                      <div className="font-medium text-app-text-primary">{student.full_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                    <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-achievement-consecutive" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Email</div>
                      <div className="font-medium text-app-text-primary">
                        {student.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                    <div className="w-8 h-8 bg-achievement-weight/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-4 w-4 text-achievement-weight" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Telefone</div>
                      <div className="font-medium text-app-text-primary">
                        {student.phone || 'Não informado'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birth and Personal Details */}
                <div className="space-y-3">
                  {student.birth_date && (
                    <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                      <div className="w-8 h-8 bg-achievement-exercise/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-achievement-exercise" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-app-text-secondary">Data de Nascimento</div>
                        <div className="font-medium text-app-text-primary">
                          {formatDate(student.birth_date)}
                          {getAge() && (
                            <span className="ml-2 text-sm text-app-text-secondary">
                              ({getAge()} anos)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {student.gender && (
                    <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                      <div className="w-8 h-8 bg-achievement-workout/20 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-achievement-workout" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-app-text-secondary">Sexo</div>
                        <div className="font-medium text-app-text-primary">
                          {student.gender === 'male' ? 'Masculino' : 
                           student.gender === 'female' ? 'Feminino' : student.gender}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                    <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-achievement-consecutive" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Status</div>
                      <div className="font-medium text-app-text-primary">
                        {student.status === 'active' ? 'Ativo' :
                         student.status === 'inactive' ? 'Inativo' :
                         student.status === 'pending' ? 'Pendente' : 'Desconhecido'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Physical Profile */}
      {(student.height || student.weight || student.experience_level) && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-consecutive rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Perfil Físico
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('physical')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.physical ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.physical || window.innerWidth >= 640) && (
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Height */}
                {student.height && (
                  <div className="flex items-center gap-3 p-3 bg-achievement-consecutive/5 border border-app-border-accent rounded-xl">
                    <div className="w-8 h-8 bg-achievement-consecutive/20 rounded-lg flex items-center justify-center">
                      <Ruler className="h-4 w-4 text-achievement-consecutive" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Altura</div>
                      <div className="text-lg font-bold text-achievement-consecutive">
                        {student.height} cm
                      </div>
                    </div>
                  </div>
                )}

                {/* Weight */}
                {student.weight && (
                  <div className="flex items-center gap-3 p-3 bg-achievement-weight/5 border border-app-border-accent rounded-xl">
                    <div className="w-8 h-8 bg-achievement-weight/20 rounded-lg flex items-center justify-center">
                      <Weight className="h-4 w-4 text-achievement-weight" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Peso</div>
                      <div className="text-lg font-bold text-achievement-weight">
                        {student.weight} kg
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience Level */}
                {student.experience_level && (
                  <div className="flex items-center gap-3 p-3 bg-achievement-exercise/5 border border-app-border-accent rounded-xl">
                    <div className="w-8 h-8 bg-achievement-exercise/20 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-achievement-exercise" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Experiência</div>
                      <div className="text-lg font-bold text-achievement-exercise">
                        {getExperienceLabel(student.experience_level)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BMI Calculation */}
              {student.height && student.weight && (
                <div className="mt-4 p-4 bg-app-bg-secondary rounded-xl border border-app-border-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-app-text-accent" />
                    <h5 className="text-sm font-semibold text-app-text-primary">
                      Índice de Massa Corporal (IMC)
                    </h5>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-app-text-primary">
                        {getBMI()}
                      </div>
                      <div className="text-xs text-app-text-secondary">kg/m²</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getBMICategory(parseFloat(getBMI()!)).color}`}>
                        {getBMICategory(parseFloat(getBMI()!)).label}
                      </div>
                      <div className="text-xs text-app-text-secondary">Classificação</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Goals */}
      {student.goals && student.goals.length > 0 && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-weight rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Objetivos de Treino
              </CardTitle>
              <Badge className="px-2 py-1 bg-achievement-weight/10 text-achievement-weight border border-app-border-accent rounded-full text-xs">
                {student.goals.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.goals.map((goal, index) => (
                <div key={index} className="p-3 bg-achievement-weight/5 border border-app-border-accent rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-achievement-weight rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-app-text-primary leading-relaxed">
                      {getGoalLabel(goal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Preferences */}
      {student.preferred_training_time && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-exercise rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Preferências de Treino
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('preferences')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.preferences ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.preferences || window.innerWidth >= 640) && (
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-achievement-exercise/5 border border-app-border-accent rounded-xl">
                <div className="w-8 h-8 bg-achievement-exercise/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-achievement-exercise" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-app-text-secondary">Horário Preferido</div>
                  <div className="font-medium text-app-text-primary">
                    {getTrainingTimeLabel(student.preferred_training_time)}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Health Information */}
      {(student.medical_conditions || student.emergency_contact) && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Informações de Saúde
                </CardTitle>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('health')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.health ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.health || window.innerWidth >= 640) && (
            <CardContent>
              <div className="space-y-4">
                
                {/* Medical Conditions */}
                {student.medical_conditions && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <h5 className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Condições Médicas
                      </h5>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed whitespace-pre-wrap">
                      {student.medical_conditions}
                    </p>
                  </div>
                )}

                {/* Emergency Contact */}
                {student.emergency_contact && (
                  <div className="flex items-center gap-3 p-3 bg-app-bg-secondary rounded-xl">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-app-text-secondary">Contato de Emergência</div>
                      <div className="font-medium text-app-text-primary">
                        {student.emergency_contact}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Physical Assessments */}
      <Card className="border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-achievement-workout rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Avaliações Físicas
              </CardTitle>
              <Badge className="px-2 py-1 bg-achievement-workout/10 text-achievement-workout border border-app-border-accent rounded-full text-xs">
                {assessments.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('assessments')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.assessments ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex h-8 px-3 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-lg font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Avaliação
              </Button>
            </div>
          </div>
        </CardHeader>

        {(expandedSections.assessments || window.innerWidth >= 640) && (
          <CardContent>
            {isLoadingAssessments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-text-accent"></div>
              </div>
            ) : assessments.length > 0 ? (
              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <div key={assessment.id} className="p-4 bg-app-bg-secondary rounded-xl border border-app-border-muted">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-achievement-workout rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-app-text-primary">
                            Avaliação {formatDate(assessment.date)}
                          </div>
                          <div className="text-xs text-app-text-secondary">
                            Criada em {formatDateTime(assessment.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {assessment.weight && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-achievement-weight">
                            {assessment.weight}kg
                          </div>
                          <div className="text-xs text-app-text-secondary">Peso</div>
                        </div>
                      )}
                      
                      {assessment.height && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-achievement-consecutive">
                            {assessment.height}cm
                          </div>
                          <div className="text-xs text-app-text-secondary">Altura</div>
                        </div>
                      )}
                      
                      {assessment.body_fat && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-achievement-exercise">
                            {assessment.body_fat}%
                          </div>
                          <div className="text-xs text-app-text-secondary">Gordura</div>
                        </div>
                      )}
                      
                      {assessment.muscle_mass && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-achievement-workout">
                            {assessment.muscle_mass}kg
                          </div>
                          <div className="text-xs text-app-text-secondary">Massa Muscular</div>
                        </div>
                      )}
                    </div>

                    {assessment.notes && (
                      <div className="mt-3 p-3 bg-app-card rounded-lg">
                        <div className="text-xs text-app-text-secondary mb-1">Observações:</div>
                        <div className="text-sm text-app-text-primary">
                          {assessment.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                    <BarChart3 className="h-8 w-8 text-app-text-muted" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
                </div>
                
                <h3 className="text-lg font-bold text-app-heading mb-2">
                  Nenhuma Avaliação Física
                </h3>
                <p className="text-app-text-secondary mb-4 max-w-md mx-auto leading-relaxed">
                  Este aluno ainda não possui avaliações físicas registradas. Crie a primeira avaliação para acompanhar o progresso.
                </p>
                
                <Button className="btn-gradient-primary px-6 py-2 rounded-xl font-semibold shadow-app-medium hover:shadow-app-large transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Avaliação
                </Button>
              </div>
            )}

            {/* Mobile Add Assessment Button */}
            {assessments.length > 0 && (
              <div className="mt-4 sm:hidden">
                <Button className="w-full btn-gradient-primary h-12 rounded-xl font-semibold shadow-app-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Avaliação Física
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Notes */}
      {student.notes && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-text-accent rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Observações
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm sm:text-base leading-relaxed text-app-text-primary whitespace-pre-wrap bg-app-bg-secondary p-4 rounded-xl">
              {student.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Only if no additional info */}
      {!student.goals?.length && 
       !student.medical_conditions && 
       !student.emergency_contact && 
       !student.preferred_training_time && 
       !student.notes && 
       assessments.length === 0 && (
        <Card className="border-0 card-app">
          <CardContent className="text-center py-12 sm:py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
              Informações Adicionais Não Disponíveis
            </h3>
            <p className="text-app-text-secondary max-w-md mx-auto leading-relaxed">
              Este aluno possui apenas as informações básicas cadastradas. Adicione mais detalhes editando o perfil.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Cards - Mobile Only */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <Button
          onClick={() => window.navigator.share?.({
            title: `Aluno: ${student.full_name}`,
            text: `Informações do aluno ${student.full_name}`,
            url: window.location.href,
          })}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button
          onClick={() => {
            const studentData = {
              name: student.full_name,
              email: student.email,
              phone: student.phone,
              goals: student.goals,
              assessments_count: assessments.length
            };
            const dataStr = JSON.stringify(studentData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aluno-${student.full_name.toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
}