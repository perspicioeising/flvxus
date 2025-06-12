'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft,
    User,
    Calendar,
    Ruler,
    Weight,
    Calculator,
    Brain,
    BarChart3,
    Activity,
    Heart,
    Target,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Info,
    Download,
    Share2,
    Edit,
    Trash2,
    Eye,
    Scale,
    Zap,
    Sparkles,
    PieChart,
    Crown,
    Star,
    Award,
    Book,
    Menu,
    MoreVertical
} from "lucide-react";
import AssessmentComparison from "@/components/AssessmentComparison";
import AssessmentAIAnalysis from "@/components/AssessmentAIAnalysis";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Assessment {
    id: string;
    student_id: string;
    date: string;
    weight: number;
    height: number;
    age: number;
    gender: string;
    protocol: string;
    bmi: number;
    fat_percentage: number;
    fat_mass: number;
    lean_mass: number;
    body_density: number;
    notes?: string;
    ai_analysis?: any;
    ai_recommendations?: any;
    measurements: Record<string, number>;
    created_at: string;
    calculations_used: string;
    accuracy_estimate: string;
    profiles: {
        full_name: string;
        avatar_url?: string;
        email: string;
        goals?: string[];
    };
}

const PROTOCOLS = {
    'jackson_pollock_3': 'Jackson & Pollock (3 dobras)',
    'jackson_pollock_7': 'Jackson & Pollock (7 dobras)',
    'durnin_womersley': 'Durnin & Womersley',
    'slaughter': 'Slaughter et al.',
    'boileau': 'Boileau et al.',
    'guedes_1994': 'Guedes 1994'
};

const MEASUREMENT_LABELS = {
    // Circunferências
    neck: 'Pescoço',
    shoulders: 'Ombros',
    chest: 'Tórax',
    chest_circ: 'Circunf. Tórax',
    waist: 'Cintura',
    abdomen: 'Abdômen',
    hips: 'Quadril',
    left_arm: 'Braço Esquerdo',
    right_arm: 'Braço Direito',
    left_thigh: 'Coxa Esquerda',
    right_thigh: 'Coxa Direita',
    left_calf: 'Panturrilha Esq.',
    right_calf: 'Panturrilha Dir.',

    // Dobras cutâneas
    triceps: 'Tríceps',
    biceps: 'Bíceps',
    subscapular: 'Subescapular',
    abdominal: 'Abdominal',
    suprailiac: 'Supra-ilíaca',
    midaxillary: 'Axilar Média',
    thigh: 'Coxa'
};

// Função auxiliar corrigida para garantir que o valor seja um número
const formatNumber = (value: unknown, decimals: number = 2): string => {
    // Se o valor for null, undefined ou vazio, retorna '0.00'
    if (value === null || value === undefined || value === '') {
        return '0.00';
    }
    
    // Converte para string primeiro e remove espaços
    const stringValue = String(value).trim();
    
    // Se for uma string vazia após trim, retorna '0.00'
    if (stringValue === '') {
        return '0.00';
    }
    
    // Tenta converter para número
    const num = Number(stringValue);
    
    // Se não for um número válido, retorna '0.00'
    if (isNaN(num) || !isFinite(num)) {
        return '0.00';
    }
    
    // Retorna o número formatado
    return num.toFixed(decimals);
};

// Função auxiliar para garantir que temos um número válido
const ensureNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    
    const stringValue = String(value).trim();
    if (stringValue === '') {
        return 0;
    }
    
    const num = Number(stringValue);
    return isNaN(num) || !isFinite(num) ? 0 : num;
};

export default function AssessmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    const fetchAssessment = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/physical-assessments/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            // Parse de dados de IA se necessário
            if (data.ai_analysis && typeof data.ai_analysis === 'string') {
                try {
                    data.ai_analysis = JSON.parse(data.ai_analysis);
                } catch (parseError) {
                    console.error('Erro ao fazer parse de ai_analysis:', parseError);
                    data.ai_analysis = null;
                }
            }

            if (data.ai_recommendations && typeof data.ai_recommendations === 'string') {
                try {
                    data.ai_recommendations = JSON.parse(data.ai_recommendations);
                } catch (parseError) {
                    console.error('Erro ao fazer parse de ai_recommendations:', parseError);
                    data.ai_recommendations = null;
                }
            }

            // Garantir que todos os valores numéricos sejam números válidos
            const processedData = {
                ...data,
                weight: ensureNumber(data.weight),
                height: ensureNumber(data.height),
                age: ensureNumber(data.age),
                bmi: ensureNumber(data.bmi),
                fat_percentage: ensureNumber(data.fat_percentage),
                fat_mass: ensureNumber(data.fat_mass),
                lean_mass: ensureNumber(data.lean_mass),
                body_density: ensureNumber(data.body_density),
                measurements: data.measurements || {}
            };

            // Debug para verificar os dados
            console.log('Dados da avaliação processados:', {
                bmi: processedData.bmi,
                fat_percentage: processedData.fat_percentage,
                fat_mass: processedData.fat_mass,
                lean_mass: processedData.lean_mass,
                body_density: processedData.body_density,
                weight: processedData.weight
            });

            setAssessment(processedData);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao buscar avaliação",
                description: error.message,
            });
            router.push('/dashboard/physical-assessments');
        } finally {
            setIsLoading(false);
        }
    }, [params.id, toast, router]);

    const fetchUserRole = useCallback(async () => {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();
            if (response.ok) {
                setUserRole(data.role);
            }
        } catch (error) {
            console.error('Erro ao buscar role do usuário:', error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchUserRole();
            await fetchAssessment();
        };
        init();
    }, [fetchUserRole, fetchAssessment]);

    const getClassificationColor = (fatPercentage: number, gender: string) => {
        let classification = '';
        let colorClass = '';

        // Garantir que fatPercentage é um número válido
        const validFatPercentage = ensureNumber(fatPercentage);

        if (gender === 'male') {
            if (validFatPercentage < 6) {
                classification = 'Muito Baixo';
                colorClass = 'text-red-600 dark:text-red-400';
            } else if (validFatPercentage < 14) {
                classification = 'Atlético';
                colorClass = 'text-green-600 dark:text-green-400';
            } else if (validFatPercentage < 18) {
                classification = 'Fitness';
                colorClass = 'text-blue-600 dark:text-blue-400';
            } else if (validFatPercentage < 25) {
                classification = 'Aceitável';
                colorClass = 'text-yellow-600 dark:text-yellow-400';
            } else {
                classification = 'Elevado';
                colorClass = 'text-orange-600 dark:text-orange-400';
            }
        } else {
            if (validFatPercentage < 16) {
                classification = 'Muito Baixo';
                colorClass = 'text-red-600 dark:text-red-400';
            } else if (validFatPercentage < 21) {
                classification = 'Atlético';
                colorClass = 'text-green-600 dark:text-green-400';
            } else if (validFatPercentage < 25) {
                classification = 'Fitness';
                colorClass = 'text-blue-600 dark:text-blue-400';
            } else if (validFatPercentage < 32) {
                classification = 'Aceitável';
                colorClass = 'text-yellow-600 dark:text-yellow-400';
            } else {
                classification = 'Elevado';
                colorClass = 'text-orange-600 dark:text-orange-400';
            }
        }

        return { classification, colorClass };
    };

    const deleteAssessment = async () => {
        if (!confirm('Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`/api/physical-assessments/${params.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            toast({
                title: "Avaliação deletada",
                description: "A avaliação foi removida com sucesso.",
            });

            router.push('/dashboard/physical-assessments');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao deletar avaliação",
                description: error.message,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                        <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
                    </div>
                  
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
                <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-red-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                    <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                        <CardContent className="text-center py-12 sm:py-24 px-6 sm:px-12">
                            <div className="relative mb-6 sm:mb-8">
                                <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-red-100 via-orange-100 to-red-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl">
                                    <AlertCircle className="h-10 w-10 sm:h-16 sm:w-16 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
                            </div>

                            <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
                                Avaliação não encontrada
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed">
                                A avaliação solicitada não existe ou você não tem permissão para acessá-la.
                            </p>
                            <Button
                                onClick={() => router.push('/dashboard/physical-assessments')}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                            >
                                Voltar às Avaliações
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const { classification, colorClass } = getClassificationColor(assessment.fat_percentage, assessment.gender);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">

                {/* Mobile-Optimized Header */}
                <div className="relative mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
                        
                        {/* Header Top Row */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                </Button>

                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                                            <Book className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                            <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent truncate">
                                            Avaliação Física
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-lg mt-1 truncate">
                                            {assessment.profiles.full_name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Action Menu */}
                            {userRole === 'trainer' && (
                                <div className="sm:hidden">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="border-gray-300 rounded-lg">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem>
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Compartilhar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Relatório
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={deleteAssessment} className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Deletar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* Desktop Action Buttons */}
                            {userRole === 'trainer' && (
                                <div className="hidden sm:flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Compartilhar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Relatório
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={deleteAssessment}
                                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Deletar
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Student Info Card - Mobile Optimized */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
                            <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg flex-shrink-0">
                                        {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                                            {assessment.profiles.full_name}
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                                <span className="font-medium truncate">{assessment.age} anos</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                                <span className="font-medium truncate">{assessment.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                                <span className="font-medium truncate">{formatNumber(assessment.height, 0)}cm</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                                <span className="font-medium truncate">{formatNumber(assessment.weight, 1)}kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <div className={`text-lg sm:text-3xl font-black ${colorClass} flex items-center justify-center sm:justify-end gap-1 sm:gap-2`}>
                                            <Crown className="h-5 w-5 sm:h-8 sm:w-8" />
                                            <span className="truncate">{classification}</span>
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                            {formatNumber(assessment.fat_percentage)}% Gordura
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile-Optimized Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
                    <div className="relative mb-9 sm:mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
                        <TabsList className="relative grid w-full grid-cols-2 sm:grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0 gap-1">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 sm:py-3"
                            >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Visão Geral</span>
                                <span className="sm:hidden">Geral</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="measurements"
                                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 sm:py-3"
                            >
                                <Ruler className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Medidas</span>
                                <span className="sm:hidden">Medidas</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="analysis"
                                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 sm:py-3"
                            >
                                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Análise IA</span>
                                <span className="sm:hidden">IA</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="comparison"
                                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 sm:py-3"
                            >
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Comparação</span>
                                <span className="sm:hidden">Compare</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab - Mobile Optimized */}
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                        {/* Main Metrics - Mobile Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                            {[
                                {
                                    value: assessment.bmi,
                                    label: "IMC",
                                    color: "from-blue-600 to-cyan-600",
                                    icon: Scale,
                                    progress: Math.min((ensureNumber(assessment.bmi) / 35) * 100, 100)
                                },
                                {
                                    value: assessment.fat_percentage,
                                    label: "% Gordura",
                                    color: "from-red-600 to-orange-600",
                                    icon: BarChart3,
                                    progress: Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100),
                                    suffix: "%"
                                },
                                {
                                    value: assessment.fat_mass,
                                    label: "M. Gorda",
                                    color: "from-orange-600 to-yellow-600",
                                    icon: Weight,
                                    progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.fat_mass) / ensureNumber(assessment.weight)) * 100 : 0,
                                    suffix: "kg"
                                },
                                {
                                    value: assessment.lean_mass,
                                    label: "M. Magra",
                                    color: "from-green-600 to-emerald-600",
                                    icon: Activity,
                                    progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.lean_mass) / ensureNumber(assessment.weight)) * 100 : 0,
                                    suffix: "kg"
                                },
                                {
                                    value: assessment.body_density,
                                    label: "Densidade",
                                    color: "from-purple-600 to-pink-600",
                                    icon: Calculator,
                                    progress: 75,
                                    decimals: 4
                                }
                            ].map((metric, index) => {
                                const Icon = metric.icon;
                                const validValue = ensureNumber(metric.value);
                                
                                return (
                                    <div key={index} className="relative group">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                            <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

                                            <CardContent className="relative p-3 sm:p-6 text-center">
                                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                                    <div className="space-y-1">
                                                        <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${metric.color.replace('from-', 'text-').replace(' to-cyan-600', '').replace(' to-orange-600', '').replace(' to-yellow-600', '').replace(' to-emerald-600', '').replace(' to-pink-600', '')} dark:opacity-80`}>
                                                            {metric.label}
                                                        </p>
                                                        <p className="text-lg sm:text-4xl font-black text-gray-900 dark:text-white">
                                                            {formatNumber(validValue, metric.decimals || 1)}{metric.suffix || ''}
                                                        </p>
                                                    </div>
                                                    <div className={`p-2 sm:p-4 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-2xl shadow-lg`}>
                                                        <Icon className="h-4 w-4 sm:h-8 sm:w-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="h-1 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                                                        style={{ width: `${Math.min(metric.progress, 100)}%` }}></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Body Composition Chart - Mobile Optimized */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-purple-900/10 rounded-t-2xl sm:rounded-t-3xl">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="relative">
                                            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg">
                                                <PieChart className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Composição Corporal</CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                                                Distribuição visual da massa corporal
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                        {/* Gráfico Visual - Mobile Responsive */}
                                        <div className="text-center space-y-4 sm:space-y-6">
                                            <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto">
                                                <div
                                                    className="absolute inset-0 rounded-full shadow-2xl"
                                                    style={{
                                                        background: `conic-gradient(from 0deg, #ef4444 ${ensureNumber(assessment.fat_percentage) * 3.6}deg, #10b981 0deg)`
                                                    }}
                                                />
                                                <div className="absolute inset-6 sm:inset-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-inner">
                                                    <div className="text-center">
                                                        <div className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
                                                            {formatNumber(assessment.fat_percentage)}%
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Gordura</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg"></div>
                                                    <span className="text-xs sm:text-sm font-bold">M. Gorda ({formatNumber(assessment.fat_mass)}kg)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></div>
                                                    <span className="text-xs sm:text-sm font-bold">M. Magra ({formatNumber(assessment.lean_mass)}kg)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Indicadores de Referência - Mobile Optimized */}
                                        <div className="space-y-4 sm:space-y-6">
                                            <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                                Indicadores de Referência
                                            </h4>

                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg sm:rounded-xl">
                                                    <div className="flex justify-between mb-2 sm:mb-3">
                                                        <span className="text-sm font-bold">IMC</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{formatNumber(assessment.bmi)}</span>
                                                    </div>
                                                    <Progress value={Math.min((ensureNumber(assessment.bmi) / 30) * 100, 100)} className="h-3 sm:h-4" />
                                                    <div className="text-xs text-gray-500 mt-2 font-medium">Normal: 18.5-24.9</div>
                                                </div>

                                                <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl">
                                                    <div className="flex justify-between mb-2 sm:mb-3">
                                                        <span className="text-sm font-bold">% Gordura</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{formatNumber(assessment.fat_percentage)}%</span>
                                                    </div>
                                                    <Progress value={Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100)} className="h-3 sm:h-4" />
                                                    <div className="text-xs text-gray-500 mt-2 font-medium">
                                                        {assessment.gender === 'male' ? 'Ideal: 10-15%' : 'Ideal: 16-24%'}
                                                    </div>
                                                </div>

                                                <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl">
                                                    <div className="flex justify-between mb-2 sm:mb-3">
                                                        <span className="text-sm font-bold">Classificação</span>
                                                        <span className={`text-sm font-bold ${colorClass}`}>{classification}</span>
                                                    </div>
                                                    <div className={`h-3 sm:h-4 rounded-full shadow-md ${classification === 'Atlético' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                        classification === 'Fitness' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                            classification === 'Aceitável' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                                'bg-gradient-to-r from-red-500 to-pink-500'
                                                        }`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Protocol Information - Mobile Optimized */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-t-2xl sm:rounded-t-3xl">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="relative">
                                            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg">
                                                <Calculator className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Informações do Protocolo</CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                                                Método utilizado e precisão da avaliação
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-blue-200/30 dark:border-blue-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2 sm:mb-3 text-sm sm:text-lg">Protocolo Utilizado</div>
                                                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                                                    {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS] || assessment.protocol}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-green-200/30 dark:border-green-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                                <div className="font-bold text-green-700 dark:text-green-300 mb-2 sm:mb-3 text-sm sm:text-lg">Precisão Estimada</div>
                                                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                                                    {assessment.accuracy_estimate || 'Não especificada'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-purple-200/30 dark:border-purple-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                                <div className="font-bold text-purple-700 dark:text-purple-300 mb-2 sm:mb-3 text-sm sm:text-lg">Data da Avaliação</div>
                                                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                                                    {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Notes - Mobile Optimized */}
                        {assessment.notes && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-slate-500/10 to-gray-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                                <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                                    <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-gray-50/50 via-slate-50/50 to-gray-50/50 dark:from-gray-800/10 dark:via-slate-800/10 dark:to-gray-800/10 rounded-t-2xl sm:rounded-t-3xl">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="relative">
                                                <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl sm:rounded-2xl shadow-lg">
                                                    <Info className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                    <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Observações</CardTitle>
                                                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                                                    Anotações da avaliação física
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-8">
                                        <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
                                                {assessment.notes}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* Measurements Tab - Mobile Optimized */}
                    <TabsContent value="measurements" className="space-y-4 sm:space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
                                <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-2xl sm:rounded-t-3xl">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="relative">
                                            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                                                <Ruler className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Medidas Registradas</CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                                                Todas as medidas coletadas durante a avaliação
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-8">
                                    {/* Circunferências - Mobile Grid */}
                                    <div className="mb-6 sm:mb-10">
                                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="text-lg sm:text-2xl">🔵</span>
                                            Circunferências
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                            {Object.entries(assessment.measurements)
                                                .filter(([key]) => ['neck', 'shoulders', 'chest', 'chest_circ', 'waist', 'abdomen', 'hips', 'left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'left_calf', 'right_calf'].includes(key))
                                                .filter(([_, value]) => ensureNumber(value) > 0)
                                                .map(([key, value]) => (
                                                    <div key={key} className="group relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="relative p-3 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-blue-200/30 dark:border-blue-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                                            <div className="font-bold text-blue-700 dark:text-blue-300 text-xs sm:text-sm mb-1 sm:mb-2 truncate">
                                                                {MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
                                                            </div>
                                                            <div className="text-lg sm:text-3xl font-black text-gray-900 dark:text-white">
                                                                {formatNumber(value)}cm
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Dobras Cutâneas - Mobile Grid */}
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="text-lg sm:text-2xl">🟡</span>
                                            Dobras Cutâneas
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                            {Object.entries(assessment.measurements)
                                                .filter(([key]) => ['triceps', 'biceps', 'subscapular', 'abdominal', 'suprailiac', 'midaxillary', 'thigh'].includes(key))
                                                .filter(([_, value]) => ensureNumber(value) > 0)
                                                .map(([key, value]) => (
                                                    <div key={key} className="group relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="relative p-3 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-yellow-200/30 dark:border-yellow-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                                            <div className="font-bold text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm mb-1 sm:mb-2 truncate">
                                                                {MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
                                                            </div>
                                                            <div className="text-lg sm:text-3xl font-black text-gray-900 dark:text-white">
                                                                {formatNumber(value)}mm
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {Object.entries(assessment.measurements).filter(([_, value]) => ensureNumber(value) > 0).length === 0 && (
                                        <div className="text-center py-12 sm:py-24">
                                            <div className="relative mb-6 sm:mb-8">
                                                <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                                                    <Ruler className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
                                            </div>

                                            <h3 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
                                                Nenhuma medida registrada
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto text-sm sm:text-lg leading-relaxed">
                                                As medidas específicas não foram coletadas nesta avaliação
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analysis Tab - Mobile Optimized */}
                    <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
                        <AssessmentAIAnalysis
                            aiAnalysis={assessment.ai_analysis}
                            aiRecommendations={assessment.ai_recommendations}
                            className="mobile-optimized"
                        />
                    </TabsContent>

                    {/* Comparison Tab - Mobile Optimized */}
                    <TabsContent value="comparison" className="space-y-4 sm:space-y-6">
                        <AssessmentComparison
                            currentAssessment={assessment}
                            studentId={assessment.student_id}
                            className="mobile-optimized"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}