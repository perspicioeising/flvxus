// components/physical-assessments/components/steps/stepBasic.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhysicalAssessmentFormData, Student } from '@/components/physical-assessments/types/physical-assessment';
import { 
  Search, 
  User, 
  Calendar, 
  Weight, 
  Ruler, 
  Target,
  Star
} from 'lucide-react';

interface StepBasicProps {
  students: Student[];
  selectedStudent: Student | null;
  formData: PhysicalAssessmentFormData;
  onStudentSelect: (student: Student) => void;
  onUpdateField: (field: keyof PhysicalAssessmentFormData, value: string) => void;
  isLoading: boolean;
}

export function StepBasic({
  students,
  selectedStudent,
  formData,
  onStudentSelect,
  onUpdateField,
  isLoading
}: StepBasicProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Seleção de Aluno */}
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
              onStudentSelect(student);
            }
          }}
        >
          <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
            <SelectValue placeholder="Selecione um aluno para avaliação...">
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
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{student.full_name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {calculateAge(student.birthDate)} anos • {student.gender === 'male' ? 'M' : 'F'}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Card do Aluno Selecionado */}
      {selectedStudent && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r  rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
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
                  {selectedStudent.goals && selectedStudent.goals.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedStudent.goals.slice(0, 3).map((goal, index) => (
                          <Badge key={index} className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 rounded-full text-xs font-semibold dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                            <Target className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                            <span className="truncate max-w-20 sm:max-w-none">{goal}</span>
                          </Badge>
                        ))}
                        {selectedStudent.goals.length > 3 && (
                          <Badge className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-0 rounded-full text-xs font-semibold">
                            +{selectedStudent.goals.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    onUpdateField('student_id', '');
                    onUpdateField('age', '');
                    onUpdateField('gender', '');
                    onUpdateField('height', '');
                    onUpdateField('weight', '');
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl shadow-lg shrink-0 text-xs sm:text-sm px-2 sm:px-4"
                >
                  Alterar
                </Button>
              </div>
            </div>
          </div>

          {/* Dados da Avaliação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                Peso Atual (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => onUpdateField('weight', e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                placeholder="70.5"
              />
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
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                Data da Avaliação
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => onUpdateField('date', e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}