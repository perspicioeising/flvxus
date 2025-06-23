// components/diets/hooks/useDietForm.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';
import { useDiets } from '@/hooks/use-diets';

import type { 
  UseDietFormReturn, 
  DietFormConfig, 
  DietFormErrors 
} from './form-types';
import type { 
  DietFormData, 
  DietStep, 
  Student, 
  PhysicalAssessment, 
  GeneratedDiet 
} from '../types';

const INITIAL_FORM_DATA: DietFormData = {
  student_id: '',
  age: '',
  weight: '',
  height: '',
  gender: 'male',
  activity_level: '',
  goal: '',
  goal_description: '',
  budget_profile: '',
  meals_per_day: 3,
  dietary_style: [],
  food_preferences: [],
  restrictions: [],
  custom_restrictions: '',
  use_physical_assessment: false,
  physical_assessment_id: '',
  name: '',
  description: '',
  used_physical_assessment: false
};

export function useDietForm(config: DietFormConfig): UseDietFormReturn {
  const { mode, dietId, studentId, onSuccess } = config;
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const { createDiet, generateDietWithAI } = useDiets();

  // State
  const [formData, setFormData] = useState<DietFormData>(INITIAL_FORM_DATA);
  const [activeStep, setActiveStep] = useState<DietStep>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [physicalAssessment, setPhysicalAssessment] = useState<PhysicalAssessment | null>(null);
  const [generatedDiet, setGeneratedDiet] = useState<GeneratedDiet | null>(null);
  const [errors, setErrors] = useState<DietFormErrors>({});
  const [dietNotes, setDietNotes] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Helper functions
  const calculateAge = useCallback((birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  }, []);

  // Data fetching functions
  const fetchUserProfile = useCallback(async () => {
    try {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setUserProfile(profile);
        
        // Se for aluno, preencher dados automaticamente
        if (profile.role === 'student') {
          setFormData(prev => ({
            ...prev,
            student_id: profile.id,
            age: calculateAge(profile.birth_date || ''),
            weight: profile.weight?.toString() || '',
            height: profile.height?.toString() || '',
            gender: profile.gender || 'male'
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase, calculateAge, toast]);

  const fetchStudents = useCallback(async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, birth_date, weight, height, gender')
        .eq('role', 'student')
        .eq('tenant_id', tenantId)
        .order('full_name');

      if (error) throw error;

      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar alunos",
        description: error.message
      });
    }
  }, [supabase, toast]);

  const fetchPhysicalAssessment = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('physical_assessments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é quando não encontra nenhum registro
        throw error;
      }

      if (data) {
        setPhysicalAssessment(data);
        setFormData(prev => ({
          ...prev,
          physical_assessment_id: data.id,
          weight: data.weight?.toString() || prev.weight,
          height: data.height?.toString() || prev.height
        }));
      } else {
        setPhysicalAssessment(null);
      }
    } catch (error: any) {
      console.error('Error fetching physical assessment:', error);
      setPhysicalAssessment(null);
    }
  }, [supabase]);

  // Effects
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile?.role === 'trainer' && userProfile.tenant_id) {
      fetchStudents(userProfile.tenant_id);
    }
  }, [userProfile, fetchStudents]);

  useEffect(() => {
    if (formData.student_id && formData.use_physical_assessment) {
      fetchPhysicalAssessment(formData.student_id);
    } else {
      setPhysicalAssessment(null);
      if (formData.physical_assessment_id) {
        setFormData(prev => ({ ...prev, physical_assessment_id: '' }));
      }
    }
  }, [formData.student_id, formData.use_physical_assessment, fetchPhysicalAssessment]);

  // Se studentId foi passado como prop, usar ele
  useEffect(() => {
    if (studentId && userProfile?.role === 'trainer') {
      handleStudentChange(studentId);
    }
  }, [studentId, userProfile]);

  // Validation functions
  const validateStep = useCallback((step: DietStep): boolean => {
    const newErrors: DietFormErrors = {};

    switch (step) {
      case 'basic':
        if (!formData.student_id) newErrors.student_id = 'Selecione um aluno';
        if (!formData.age) newErrors.age = 'Idade é obrigatória';
        if (!formData.weight) newErrors.weight = 'Peso é obrigatório';
        break;
      case 'goals':
        if (!formData.goal) newErrors.goal = 'Selecione um objetivo';
        if (!formData.activity_level) newErrors.activity_level = 'Selecione o nível de atividade';
        if (!formData.budget_profile) newErrors.budget_profile = 'Selecione o perfil de orçamento';
        break;
      case 'preferences':
        // Validações opcionais para preferências
        break;
      case 'review':
        // Validações do step de revisão
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const canAdvanceStep = useCallback((): boolean => {
    return validateStep(activeStep);
  }, [validateStep, activeStep]);

  const isFormValid = useCallback((): boolean => {
    return Boolean(
      formData.student_id && 
      formData.age && 
      formData.weight && 
      formData.goal && 
      formData.activity_level && 
      formData.budget_profile
    );
  }, [formData]);

  // Form actions
  const updateFormField = useCallback(<K extends keyof DietFormData>(
    field: K, 
    value: DietFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando campo é atualizado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleStudentChange = useCallback((studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        student_id: studentId,
        age: calculateAge(student.birth_date || ''),
        weight: student.weight?.toString() || '',
        height: student.height?.toString() || '',
        gender: student.gender || 'male',
        use_physical_assessment: false,
        physical_assessment_id: ''
      }));
      setPhysicalAssessment(null);
    }
  }, [students, calculateAge]);

  const toggleDietaryStyle = useCallback((style: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_style: prev.dietary_style.includes(style)
        ? prev.dietary_style.filter(s => s !== style)
        : [...prev.dietary_style, style]
    }));
  }, []);

  const toggleFoodPreference = useCallback((preference: string) => {
    setFormData(prev => ({
      ...prev,
      food_preferences: prev.food_preferences.includes(preference)
        ? prev.food_preferences.filter(p => p !== preference)
        : [...prev.food_preferences, preference]
    }));
  }, []);

  const toggleRestriction = useCallback((restriction: string) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  }, []);

  const togglePhysicalAssessment = useCallback((use: boolean) => {
    setFormData(prev => ({ ...prev, use_physical_assessment: use }));
  }, []);

  // Diet operations
  const generateDiet = useCallback(async (): Promise<void> => {
    try {
      setIsGenerating(true);

      const valid = isFormValid();
      if (!valid) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios"
        });
        return;
      }

      const dietParams = {
        student_id: formData.student_id,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: formData.height ? parseFloat(formData.height) : undefined,
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal: formData.goal,
        goal_description: formData.goal_description,
        budget_profile: formData.budget_profile,
        meals_per_day: formData.meals_per_day,
        dietary_style: formData.dietary_style,
        food_preferences: formData.food_preferences,
        restrictions: formData.restrictions,
        custom_restrictions: formData.custom_restrictions,
        physical_assessment: formData.use_physical_assessment ? physicalAssessment : undefined
      };

      const generated = await generateDietWithAI(dietParams);
      setGeneratedDiet(generated);
      setActiveStep("review");

      toast({
        title: "Dieta gerada com sucesso!",
        description: "Revise a dieta gerada e faça ajustes se necessário"
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar dieta",
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  }, [formData, physicalAssessment, isFormValid, generateDietWithAI, toast]);

  const saveDiet = useCallback(async (): Promise<void> => {
    try {
      setIsSaving(true);

      if (!generatedDiet) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, gere uma dieta antes de salvar"
        });
        return;
      }

      const dietData = {
        student_id: formData.student_id,
        name: generatedDiet.name,
        description: dietNotes ? `${generatedDiet.description}\n\nObservações: ${dietNotes}` : generatedDiet.description,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: formData.height ? parseFloat(formData.height) : undefined,
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal: formData.goal,
        goal_description: formData.goal_description,
        budget_profile: formData.budget_profile,
        meals_per_day: formData.meals_per_day,
        dietary_style: formData.dietary_style,
        food_preferences: formData.food_preferences,
        restrictions: formData.restrictions,
        custom_restrictions: formData.custom_restrictions,
        used_physical_assessment: formData.use_physical_assessment,
        physical_assessment_id: formData.use_physical_assessment && formData.physical_assessment_id ? formData.physical_assessment_id : undefined,
        target_calories: generatedDiet.target_calories,
        target_protein: generatedDiet.target_protein,
        target_carbs: generatedDiet.target_carbs,
        target_fat: generatedDiet.target_fat,
        generatedMeals: generatedDiet.meals,
        generatedShoppingList: generatedDiet.shopping_list,
        generatedRecommendations: generatedDiet.recommendations,
        created_by: userProfile?.id
      };

      await createDiet(dietData);
      
      toast({
        title: "Dieta salva com sucesso!",
        description: "A dieta foi criada e está disponível para o aluno"
      });

      onSuccess?.();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar dieta",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, generatedDiet, dietNotes, userProfile, createDiet, toast, onSuccess]);

  // Return state and actions - Usando useMemo para evitar re-renders
  return useMemo(() => ({
    // State
    formData,
    activeStep,
    isGenerating,
    isSaving,
    isLoading,
    students,
    physicalAssessment,
    generatedDiet,
    errors,
    dietNotes,
    userProfile,

    // Actions
    setActiveStep,
    updateFormField,
    handleStudentChange,
    toggleDietaryStyle,
    toggleFoodPreference,
    toggleRestriction,
    togglePhysicalAssessment,
    generateDiet,
    saveDiet,
    validateStep,
    canAdvanceStep,
    isFormValid,
    setDietNotes
  }), [
    formData,
    activeStep,
    isGenerating,
    isSaving,
    isLoading,
    students,
    physicalAssessment,
    generatedDiet,
    errors,
    dietNotes,
    userProfile,
    updateFormField,
    handleStudentChange,
    toggleDietaryStyle,
    toggleFoodPreference,
    toggleRestriction,
    togglePhysicalAssessment,
    generateDiet,
    saveDiet,
    validateStep,
    canAdvanceStep,
    isFormValid
  ]);
}