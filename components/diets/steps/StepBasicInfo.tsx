// components/diets/steps/StepBasicInfo.tsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Calendar, 
  Weight, 
  Ruler, 
  Shield,
  Heart,
  Activity
} from 'lucide-react';

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
  const [studentSearch, setStudentSearch] = useState('');

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes((studentSearch || '').toLowerCase())
  );

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  if (!userProfile) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedStudent = students.find(s => s.id === formData.student_id);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Seleção de Aluno */}
      {userProfile?.role === 'trainer' ? (
        <div className="space-y-3">
          <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Search className="h-4 w-4 text-green-600" />
            Selecionar Aluno
          </Label>
          <Select
            value={formData.student_id}
            onValueChange={(value) => {
              const student = students.find(s => s.id === value);
              if (student) {
                onStudentChange(value);
              }
            }}
          >
            <SelectTrigger className={`h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm ${
              errors.student_id ? 'ring-2 ring-red-500' : ''
            }`}>
              <SelectValue placeholder="Selecione um aluno para a dieta...">
                {selectedStudent && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {selectedStudent.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{selectedStudent.full_name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60 sm:max-h-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <div className="p-2">
                <Input
                  placeholder="Digite para buscar..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="h-8 sm:h-10 text-sm border-0 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {studentSearch ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <SelectItem
                    key={student.id}
                    value={student.id}
                    className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                        {student.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {student.full_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {calculateAge(student.birth_date || '')} anos • {student.gender === 'male' ? 'M' : 'F'}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.student_id && (
            <p className="text-sm text-red-500 mt-1">{errors.student_id}</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
          <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-lg shrink-0">
                {userProfile.full_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {userProfile.full_name}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{formData.age || calculateAge(userProfile.birth_date || '')} anos</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{userProfile.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card do Aluno Selecionado */}
      {selectedStudent && userProfile?.role === 'trainer' && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
          <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-lg shrink-0">
                {selectedStudent.full_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {selectedStudent.full_name}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{formData.age} anos</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                  </div>
                  {selectedStudent.height && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                      <span className="font-medium">{selectedStudent.height}cm</span>
                    </div>
                  )}
                  {selectedStudent.weight && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                      <span className="font-medium">{selectedStudent.weight}kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dados da Dieta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            Peso Atual (kg) *
          </Label>
          <Input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => onUpdateField('weight', e.target.value)}
            className={`h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
              errors.weight ? 'ring-2 ring-red-500' : ''
            }`}
            placeholder="70.5"
          />
          {errors.weight && (
            <p className="text-sm text-red-500">{errors.weight}</p>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            Altura (cm)
          </Label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => onUpdateField('height', e.target.value)}
            className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
            placeholder="175"
          />
        </div>

        <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
          <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            Idade *
          </Label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => onUpdateField('age', e.target.value)}
            className={`h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
              errors.age ? 'ring-2 ring-red-500' : ''
            }`}
            placeholder="29"
          />
          {errors.age && (
            <p className="text-sm text-red-500">{errors.age}</p>
          )}
        </div>
      </div>

      {/* Avaliação Física */}
      {formData.student_id && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="use_assessment"
              checked={formData.use_physical_assessment}
              onCheckedChange={onTogglePhysicalAssessment}
              className="h-5 w-5"
            />
            <Label htmlFor="use_assessment" className="text-sm sm:text-base font-medium cursor-pointer flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              Usar dados da avaliação física mais recente
            </Label>
          </div>

          {formData.use_physical_assessment && physicalAssessment && (
            <Alert className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200/50 dark:border-indigo-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <AlertDescription className="text-indigo-800 dark:text-indigo-200">
                  <div className="font-semibold mb-2">
                    Avaliação de {new Date(physicalAssessment.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Gordura: {physicalAssessment.fat_percentage?.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Massa Magra: {physicalAssessment.lean_mass?.toFixed(1)}kg</span>
                    </div>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {formData.use_physical_assessment && !physicalAssessment && (
            <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Nenhuma avaliação física encontrada para este aluno.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}