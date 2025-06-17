// components/workout-plans/components/steps/StepBasicInfo.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, Info, AlertCircle } from 'lucide-react';
import { useSupabase } from '@/app/providers';

interface StepBasicInfoProps {
  formData: {
    name: string;
    description: string;
    student_id: string;
    start_date: string;
    end_date: string;
  };
  onUpdateField: (field: string, value: any) => void;
  errors: Record<string, string>;
  studentId?: string;
}

export function StepBasicInfo({ 
  formData, 
  onUpdateField, 
  errors,
  studentId 
}: StepBasicInfoProps) {
  const { supabase } = useSupabase();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (!studentId) {
      fetchStudents();
    } else {
      onUpdateField('student_id', studentId);
    }
  }, [studentId]);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .order('full_name');

      if (!error && data) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      
      if (weeks > 0 && days > 0) {
        return `${weeks} semana${weeks > 1 ? 's' : ''} e ${days} dia${days > 1 ? 's' : ''}`;
      } else if (weeks > 0) {
        return `${weeks} semana${weeks > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      }
    }
    return null;
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">1</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informações Básicas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Defina o nome, descrição e período do plano
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Student Selection (if not pre-selected) */}
        {!studentId && (
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Aluno
            </Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => onUpdateField('student_id', value)}
              disabled={isLoadingStudents}
            >
              <SelectTrigger className={`h-14 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
                errors.student_id ? 'ring-2 ring-red-500' : ''
              }`}>
                <SelectValue placeholder={isLoadingStudents ? "Carregando alunos..." : "Selecione um aluno"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.student_id && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.student_id}
              </p>
            )}
          </div>
        )}

        {/* Plan Name */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Nome do Plano
          </Label>
          <Input
            placeholder="ex: Plano de Hipertrofia - 12 semanas"
            value={formData.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
              errors.name ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Descrição
          </Label>
          <Textarea
            placeholder="Descreva os objetivos e observações importantes sobre este plano..."
            value={formData.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            className={`min-h-[120px] text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none ${
              errors.description ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            Período do Plano
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Data de Início
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => onUpdateField('start_date', e.target.value)}
                className={`h-14 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
                  errors.start_date ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.start_date && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.start_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Data de Término
              </Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => onUpdateField('end_date', e.target.value)}
                min={formData.start_date}
                className={`h-14 text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 ${
                  errors.end_date || errors.date_range ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {(errors.end_date || errors.date_range) && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.end_date || errors.date_range}
                </p>
              )}
            </div>
          </div>

          {/* Duration Badge */}
          {duration && (
            <div className="flex items-center justify-center mt-4">
              <Badge className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-300 dark:border-orange-600 text-sm font-semibold">
                <Calendar className="h-4 w-4 mr-2" />
                Duração: {duration}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 to-amber-200/50 dark:from-orange-700/50 dark:to-amber-700/50 rounded-2xl blur-xl"></div>
        <div className="relative p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
          <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider mb-3">
            💡 Dica
          </h4>
          <p className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">
            Um bom plano de treino deve ter objetivos claros e um período bem definido. 
            Recomendamos planos entre 4 a 12 semanas para melhores resultados.
          </p>
        </div>
      </div>
    </div>
  );
}