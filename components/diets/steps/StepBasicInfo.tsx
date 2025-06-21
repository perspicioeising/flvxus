// components/diets/components/steps/StepBasicInfo.tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

import type { DietFormData, Student, PhysicalAssessment } from '../types';
import type { DietFormErrors } from '../hooks/form-types';

interface StepBasicInfoProps {
  formData: DietFormData;
  students: Student[];
  physicalAssessment: PhysicalAssessment | null;
  userProfile: any;
  errors: DietFormErrors;
  onUpdateField: <K extends keyof DietFormData>(field: K, value: DietFormData[K]) => void;
  onStudentChange: (studentId: string) => void;
  onTogglePhysicalAssessment: (use: boolean) => void;
}

export function StepBasicInfo({
  formData,
  students,
  physicalAssessment,
  userProfile,
  errors,
  onUpdateField,
  onStudentChange,
  onTogglePhysicalAssessment
}: StepBasicInfoProps) {
  
  // Aguardar carregamento do userProfile
  if (!userProfile) {
    return (
      <div className="relative group">
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Informações Básicas
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Dados essenciais para criar a dieta personalizada
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Student Selection */}
          {userProfile?.role === 'trainer' ? (
            <div className="space-y-3">
              <Label htmlFor="student" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Aluno *
              </Label>
              <Select value={formData.student_id} onValueChange={onStudentChange}>
                <SelectTrigger className={`h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm ${
                  errors.student_id ? 'ring-2 ring-red-500' : ''
                }`}>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.full_name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span>{student.full_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student_id && (
                <p className="text-sm text-red-500 mt-1">{errors.student_id}</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    {userProfile?.full_name}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Criando dieta para você
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div className="space-y-3">
              <Label htmlFor="age" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Idade *
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-50"></div>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => onUpdateField('age', e.target.value)}
                  placeholder="Ex: 29"
                  className={`relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
                    errors.age ? 'ring-2 ring-red-500' : ''
                  }`}
                />
              </div>
              {errors.age && (
                <p className="text-sm text-red-500 mt-1">{errors.age}</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-3">
              <Label htmlFor="weight" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Peso (kg) *
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-50"></div>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => onUpdateField('weight', e.target.value)}
                  placeholder="Ex: 75.5"
                  className={`relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
                    errors.weight ? 'ring-2 ring-red-500' : ''
                  }`}
                />
              </div>
              {errors.weight && (
                <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
              )}
            </div>

            {/* Height */}
            <div className="space-y-3">
              <Label htmlFor="height" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Altura (cm)
              </Label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-50"></div>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => onUpdateField('height', e.target.value)}
                  placeholder="Ex: 175"
                  className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label htmlFor="gender" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Sexo *
              </Label>
              <Select value={formData.gender} onValueChange={(value) => onUpdateField('gender', value)}>
                <SelectTrigger className="h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Physical Assessment */}
          {formData.student_id && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="use_assessment"
                  checked={formData.use_physical_assessment}
                  onCheckedChange={onTogglePhysicalAssessment}
                />
                <Label htmlFor="use_assessment" className="text-sm font-medium cursor-pointer">
                  Usar avaliação física disponível
                </Label>
              </div>

              {formData.use_physical_assessment && physicalAssessment && (
                <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/50">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    Usando avaliação física de {new Date(physicalAssessment.date).toLocaleDateString('pt-BR')}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>Gordura: {physicalAssessment.fat_percentage?.toFixed(1)}%</div>
                      <div>Massa Magra: {physicalAssessment.lean_mass?.toFixed(1)}kg</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {formData.use_physical_assessment && !physicalAssessment && (
                <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-700/50">
                  <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                    Nenhuma avaliação física encontrada para este aluno.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}