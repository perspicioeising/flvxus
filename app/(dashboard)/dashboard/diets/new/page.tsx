// app/(dashboard)/dashboard/diets/new/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Loader2,
    Sparkles,
    Utensils,
    User,
    Weight,
    Calendar,
    Target,
    Activity,
    DollarSign,
    Clock,
    Apple,
    AlertCircle,
    CheckCircle,
    Brain,
    Zap,
    Plus,
    X,
    FileText,
    Dumbbell,
    Heart,
    TrendingUp,
    Pizza,
    Coffee,
    Salad,
    Beef,
    Timer,
    BarChart3,
    Shield,
    ChefHat
} from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { useDiets } from "@/hooks/use-diets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const GOALS = [
    { value: 'muscle_gain', label: 'Ganho de Massa Muscular', icon: TrendingUp, color: 'from-blue-500 to-purple-500' },
    { value: 'fat_loss', label: 'Perda de Gordura', icon: Target, color: 'from-red-500 to-orange-500' },
    { value: 'reeducation', label: 'Reeducação Alimentar', icon: Apple, color: 'from-green-500 to-emerald-500' },
    { value: 'performance', label: 'Melhora de Performance', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { value: 'maintenance', label: 'Manutenção de Peso', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { value: 'other', label: 'Outro', icon: FileText, color: 'from-gray-500 to-gray-600' }
];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentário', description: 'Pouco ou nenhum exercício' },
    { value: 'light', label: 'Leve', description: '1-3 dias por semana' },
    { value: 'moderate', label: 'Moderado', description: '3-5 dias por semana' },
    { value: 'intense', label: 'Intenso', description: '6-7 dias por semana' },
    { value: 'athlete', label: 'Atleta', description: 'Treino intenso diário' }
];

const DIETARY_STYLES = [
    { value: 'vegetarian', label: 'Vegetariano', icon: Salad },
    { value: 'vegan', label: 'Vegano', icon: Apple },
    { value: 'omnivore', label: 'Onívoro', icon: Pizza },
    { value: 'low_carb', label: 'Low Carb', icon: Beef },
    { value: 'keto', label: 'Cetogênica', icon: Beef },
    { value: 'paleo', label: 'Paleo', icon: Beef },
    { value: 'intermittent', label: 'Jejum Intermitente', icon: Timer },
    { value: 'flexible', label: 'Flexível', icon: Coffee },
];

const RESTRICTIONS = [
    'Lactose',
    'Glúten',
    'Frutos do mar',
    'Nozes e castanhas',
    'Ovo',
    'Soja',
    'Açúcar',
    'Sal',
];

const FOOD_PREFERENCES = [
    { value: 'common', label: 'Comuns e acessíveis' },
    { value: 'nutrient_rich', label: 'Ricos em nutrientes' },
    { value: 'easy_prep', label: 'Fácil preparo' },
    { value: 'ready_made', label: 'Prontos/congelados' }
];

export default function NewDietPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { supabase } = useSupabase();
    const { toast } = useToast();
    const { createDiet, generateDietWithAI } = useDiets();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [physicalAssessment, setPhysicalAssessment] = useState<any>(null);
    const [generatedDiet, setGeneratedDiet] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("basic");
  type Student = { id: string; full_name: string };

    // Form state
    const [formData, setFormData] = useState({
        student_id: '',
        age: '',
        weight: '',
        height: '',
        gender: 'male',
        activity_level: 'moderate',
        goal: 'maintenance',
        goal_description: '',
        budget_profile: 'intermediate',
        meals_per_day: 3,
        dietary_style: [] as string[],
        food_preferences: [] as string[],
        restrictions: [] as string[],
        custom_restrictions: '',
        use_physical_assessment: false,
        physical_assessment_id: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile) {
            if (userProfile.role === 'trainer') {
                fetchStudents();
            } else {
                // Se for aluno, preencher automaticamente
                setFormData(prev => ({
                    ...prev,
                    student_id: userProfile.id,
                    age: calculateAge(userProfile.birth_date),
                    weight: userProfile.weight || '',
                    height: userProfile.height || '',
                    gender: userProfile.gender || 'male'
                }));
            }
        }
    }, [userProfile]);

    useEffect(() => {
        if (formData.student_id && formData.use_physical_assessment) {
            fetchPhysicalAssessment();
        }
    }, [formData.student_id, formData.use_physical_assessment]);

    const fetchUserProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                setUserProfile(profile);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, birth_date, weight, height, gender')
                .eq('role', 'student')
                .eq('tenant_id', userProfile.tenant_id)
                .order('full_name');

            setStudents(data || []);
        } catch (error: any) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchPhysicalAssessment = async () => {
        try {
            const { data } = await supabase
                .from('physical_assessments')
                .select('*')
                .eq('student_id', formData.student_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setPhysicalAssessment(data);
                setFormData(prev => ({
                    ...prev,
                    physical_assessment_id: data.id,
                    weight: data.weight || prev.weight,
                    height: data.height || prev.height
                }));
            }
        } catch (error: any) {
            console.error('Error fetching physical assessment:', error);
        }
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    const handleStudentChange = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            setFormData(prev => ({
                ...prev,
                student_id: studentId,
                age: calculateAge(student.birth_date),
                weight: student.weight || '',
                height: student.height || '',
                gender: student.gender || 'male'
            }));
        }
    };

    const handleGenerateDiet = async () => {
        try {
            setIsGenerating(true);

            // Validar campos obrigatórios
            if (!formData.student_id || !formData.age || !formData.weight) {
                toast({
                    variant: "destructive",
                    title: "Campos obrigatórios",
                    description: "Por favor, preencha todos os campos obrigatórios"
                });
                return;
            }

            const dietParams = {
                ...formData,
                age: parseInt(formData.age),
                weight: parseFloat(formData.weight),
                height: formData.height ? parseFloat(formData.height) : null,
                physical_assessment: formData.use_physical_assessment ? physicalAssessment : null
            };

            const generated = await generateDietWithAI(dietParams);
            setGeneratedDiet(generated);
            setActiveTab("review");

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
    };

    const handleSaveDiet = async () => {
        try {
            setIsLoading(true);

            if (!generatedDiet) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Por favor, gere uma dieta antes de salvar"
                });
                return;
            }

            const dietData = {
                ...formData,
                ...generatedDiet,
                age: parseInt(formData.age),
                weight: parseFloat(formData.weight),
                height: formData.height ? parseFloat(formData.height) : null,
                used_physical_assessment: formData.use_physical_assessment,
                physical_assessment_id: formData.use_physical_assessment ? formData.physical_assessment_id : null
            };

            await createDiet(dietData);

            router.push('/dashboard/diets');

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar dieta",
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return formData.student_id && formData.age && formData.weight && formData.goal;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
            <div className="container mx-auto px-4 py-6 max-w-6xl">

                {/* Ultra Modern Header */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.back()}
                                        className="p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                                            <ChefHat className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                            <Brain className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                                            Nova Dieta
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                            <span className="font-semibold text-green-600 dark:text-green-400">Criação Inteligente</span> • Nutrição Personalizada
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl h-14 px-8 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                >
                                    Cancelar
                                </Button>
                                {generatedDiet ? (
                                    <Button
                                        onClick={handleSaveDiet}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0 h-14"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-3 h-5 w-5" />
                                                Salvar Dieta
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleGenerateDiet}
                                        disabled={!isFormValid() || isGenerating}
                                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 border-0 h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Gerando...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="mr-3 h-5 w-5" />
                                                Gerar com IA
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
                        <TabsList className="relative grid w-full grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
                            <TabsTrigger
                                value="basic"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
                            >
                                <User className="h-4 w-4 mr-2" />
                                Básico
                            </TabsTrigger>
                            <TabsTrigger
                                value="goals"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
                            >
                                <Target className="h-4 w-4 mr-2" />
                                Objetivos
                            </TabsTrigger>
                            <TabsTrigger
                                value="preferences"
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
                            >
                                <Apple className="h-4 w-4 mr-2" />
                                Preferências
                            </TabsTrigger>
                            <TabsTrigger
                                value="review"
                                disabled={!generatedDiet}
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Revisão
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="basic" className="space-y-6">
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
                                            <Select value={formData.student_id} onValueChange={handleStudentChange}>
                                                <SelectTrigger className="h-14 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm">
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
                                                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                                    placeholder="Ex: 29"
                                                    className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                                                />
                                            </div>
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
                                                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                                                    placeholder="Ex: 75.5"
                                                    className="relative h-14 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                                                />
                                            </div>
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
                                                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
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
                                            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_physical_assessment: checked as boolean }))}
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
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                                <CardHeader className="relative pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                            <Target className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                                Objetivos da Dieta
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                Defina os objetivos e nível de atividade física
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative space-y-8">
                                    {/* Goals */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Qual é o objetivo? *
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {GOALS.map((goal) => {
                                                const Icon = goal.icon;
                                                const isSelected = formData.goal === goal.value;

                                                return (
                                                    <button
                                                        key={goal.value}
                                                        onClick={() => setFormData(prev => ({ ...prev, goal: goal.value }))}
                                                        className={cn(
                                                            "relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105",
                                                            isSelected
                                                                ? "border-transparent shadow-xl"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className={cn(
                                                                "absolute inset-0 bg-gradient-to-r rounded-2xl opacity-10",
                                                                goal.color
                                                            )} />
                                                        )}
                                                        <div className="relative z-10 flex flex-col items-center space-y-3">
                                                            <div className={cn(
                                                                "p-3 rounded-xl bg-gradient-to-r",
                                                                goal.color
                                                            )}>
                                                                <Icon className="h-6 w-6 text-white" />
                                                            </div>
                                                            <span className={cn(
                                                                "font-semibold text-sm",
                                                                isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                                            )}>
                                                                {goal.label}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {formData.goal === 'other' && (
                                            <div className="mt-4">
                                                <Textarea
                                                    value={formData.goal_description}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
                                                    placeholder="Descreva o objetivo específico..."
                                                    className="min-h-[100px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Activity Level */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Nível de Atividade Física *
                                        </Label>
                                        <div className="space-y-3">
                                            {ACTIVITY_LEVELS.map((level) => (
                                                <button
                                                    key={level.value}
                                                    onClick={() => setFormData(prev => ({ ...prev, activity_level: level.value }))}
                                                    className={cn(
                                                        "w-full p-4 rounded-xl border-2 transition-all duration-300 text-left",
                                                        formData.activity_level === level.value
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {level.label}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {level.description}
                                                            </p>
                                                        </div>
                                                        {formData.activity_level === level.value && (
                                                            <CheckCircle className="h-5 w-5 text-blue-500" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meals per Day */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Número de Refeições por Dia: {formData.meals_per_day}
                                        </Label>
                                        <Slider
                                            value={[formData.meals_per_day]}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, meals_per_day: value[0] }))}
                                            min={1}
                                            max={6}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>1 refeição</span>
                                            <span>6 refeições</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                                <CardHeader className="relative pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                                            <Apple className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                                Preferências e Restrições
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                Personalize a dieta de acordo com suas preferências
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative space-y-8">
                                    {/* Dietary Style */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Estilo Alimentar Preferido
                                        </Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {DIETARY_STYLES.map((style) => {
                                                const Icon = style.icon;
                                                const isSelected = formData.dietary_style.includes(style.value);

                                                return (
                                                    <button
                                                        key={style.value}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    dietary_style: prev.dietary_style.filter(s => s !== style.value)
                                                                }));
                                                            } else {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    dietary_style: [...prev.dietary_style, style.value]
                                                                }));
                                                            }
                                                        }}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2",
                                                            isSelected
                                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                        )}
                                                    >
                                                        <Icon className={cn(
                                                            "h-5 w-5",
                                                            isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
                                                        )} />
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            isSelected ? "text-purple-800 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                                                        )}>
                                                            {style.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>


                                <TabsContent value="review" className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                                            <CardHeader className="relative pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                                                        <FileText className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                                            Revisão e Geração da Dieta
                                                        </CardTitle>
                                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                                            Verifique as informações e gere a dieta com inteligência artificial
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-6">
                                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    <p><strong>Aluno:</strong> {formData.student_id}</p>
                                                    <p><strong>Idade:</strong> {formData.age} anos</p>
                                                    <p><strong>Peso:</strong> {formData.weight} kg</p>
                                                    <p><strong>Altura:</strong> {formData.height} cm</p>
                                                    <p><strong>Sexo:</strong> {formData.gender}</p>
                                                    <p><strong>Objetivo:</strong> {formData.goal}</p>
                                                    {formData.goal === 'other' && (
                                                        <p><strong>Descrição:</strong> {formData.goal_description}</p>
                                                    )}
                                                    <p><strong>Atividade Física:</strong> {formData.activity_level}</p>
                                                    <p><strong>Refeições por dia:</strong> {formData.meals_per_day}</p>
                                                    <p><strong>Estilo Alimentar:</strong> {formData.dietary_style.join(', ') || 'Não especificado'}</p>
                                                </div>

                                                <Button
                                                    size="lg"
                                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg"
                                                    onClick={handleGenerateDiet}
                                                    disabled={isLoading || generatedDiet}
                                                >
                                                    {isLoading ? 'Gerando dieta...' : 'Gerar dieta com IA'}
                                                </Button>

                                                {generatedDiet && (
                                                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-300/50 dark:border-green-700/50 text-sm text-green-800 dark:text-green-300 whitespace-pre-line">
                                                        {generatedDiet}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                                                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

