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
    PieChart
} from "lucide-react";
import AssessmentComparison from "@/components/AssessmentComparison";

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
    ai_analysis?: {
        classification: string;
        somatotype: string;
        healthStatus: string;
    };
    ai_recommendations?: {
        training?: Record<string, string>;
        nutrition?: Record<string, string>;
        lifestyle?: Record<string, string>;
    };
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
    'boileau': 'Boileau et al.'
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

// Função auxiliar para garantir que o valor seja um número
const formatNumber = (value: unknown, decimals: number = 2): string => {
    const num = typeof value === 'number' ? value : Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

// Função auxiliar para garantir que o valor seja uma string
const formatString = (value: unknown): string => {
    return typeof value === 'string' ? value : String(value || '');
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

            setAssessment(data);
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
        fetchUserRole();
        fetchAssessment();
    }, [fetchUserRole, fetchAssessment]);

    const getClassificationColor = (fatPercentage: number, gender: string) => {
        let classification = '';
        let colorClass = '';

        if (gender === 'male') {
            if (fatPercentage < 6) {
                classification = 'Muito Baixo';
                colorClass = 'text-red-600 dark:text-red-400';
            } else if (fatPercentage < 14) {
                classification = 'Atlético';
                colorClass = 'text-green-600 dark:text-green-400';
            } else if (fatPercentage < 18) {
                classification = 'Fitness';
                colorClass = 'text-blue-600 dark:text-blue-400';
            } else if (fatPercentage < 25) {
                classification = 'Aceitável';
                colorClass = 'text-yellow-600 dark:text-yellow-400';
            } else {
                classification = 'Elevado';
                colorClass = 'text-orange-600 dark:text-orange-400';
            }
        } else {
            if (fatPercentage < 16) {
                classification = 'Muito Baixo';
                colorClass = 'text-red-600 dark:text-red-400';
            } else if (fatPercentage < 21) {
                classification = 'Atlético';
                colorClass = 'text-green-600 dark:text-green-400';
            } else if (fatPercentage < 25) {
                classification = 'Fitness';
                colorClass = 'text-blue-600 dark:text-blue-400';
            } else if (fatPercentage < 32) {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                        Avaliação não encontrada
                    </h2>
                    <p className="text-gray-500 dark:text-gray-500 mb-6">
                        A avaliação solicitada não existe ou você não tem permissão para acessá-la.
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard/physical-assessments')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                        Voltar às Avaliações
                    </Button>
                </div>
            </div>
        );
    }

    const { classification, colorClass } = getClassificationColor(assessment.fat_percentage, assessment.gender);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
            <div className="container mx-auto px-4 py-6 max-w-7xl">

                {/* Header */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-3xl blur-xl"></div>
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </Button>

                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Brain className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                        Avaliação Física Detalhada
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                                        {assessment.profiles.full_name} • {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {userRole === 'trainer' && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl"
                                    >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Compartilhar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Relatório
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={deleteAssessment}
                                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Deletar
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Student Info Card */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                                    {assessment.profiles.full_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {assessment.profiles.full_name}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span>{assessment.age} anos</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <span>{assessment.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Ruler className="h-4 w-4 text-blue-600" />
                                            <span>{assessment.height}cm</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Weight className="h-4 w-4 text-blue-600" />
                                            <span>{formatNumber(assessment.weight)}kg</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-black ${colorClass}`}>
                                        {classification}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatNumber(assessment.fat_percentage)}% Gordura
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-2xl blur-xl"></div>
                        <TabsList className="relative grid w-full grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
                            <TabsTrigger
                                value="overview"
                                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Visão Geral</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="measurements"
                                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300"
                            >
                                <Ruler className="h-4 w-4" />
                                <span className="hidden sm:inline">Medidas</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="analysis"
                                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all duration-300"
                            >
                                <Brain className="h-4 w-4" />
                                <span className="hidden sm:inline">Análise IA</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="comparison"
                                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
                            >
                                <TrendingUp className="h-4 w-4" />
                                <span className="hidden sm:inline">Comparação</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Main Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">IMC</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(assessment.bmi)}</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                                                <Scale className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                style={{ width: `${Math.min((assessment.bmi / 35) * 100, 100)}%` }}></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-wider">% Gordura</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(assessment.fat_percentage)}%</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                                                <BarChart3 className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                                style={{ width: `${Math.min((assessment.fat_percentage / 35) * 100, 100)}%` }}></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">M. Gorda</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(assessment.fat_mass)}kg</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                                                <Weight className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                                                style={{ width: `${(assessment.fat_mass / assessment.weight) * 100}%` }}></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">M. Magra</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(assessment.lean_mass)}kg</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                                                <Activity className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                                style={{ width: `${(assessment.lean_mass / assessment.weight) * 100}%` }}></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Densidade</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(assessment.body_density, 4)}</p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                                                <Calculator className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-3/4"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Body Composition Chart */}
                        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                        <PieChart className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Composição Corporal</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Distribuição visual da massa corporal
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Gráfico Visual */}
                                    <div className="text-center space-y-6">
                                        <div className="relative w-48 h-48 mx-auto">
                                            <div
                                                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                                                style={{
                                                    background: `conic-gradient(from 0deg, #ef4444 ${assessment.fat_percentage * 3.6}deg, #10b981 0deg)`
                                                }}
                                            />
                                            <div className="absolute inset-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-inner">
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-gray-900 dark:text-white">
                                                        {formatNumber(assessment.fat_percentage)}%
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Gordura</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                                <span className="text-sm font-medium">Massa Gorda ({formatNumber(assessment.fat_mass)}kg)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium">Massa Magra ({formatNumber(assessment.lean_mass)}kg)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barras de Progresso */}
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Indicadores de Referência</h4>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">IMC</span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(assessment.bmi)}</span>
                                                </div>
                                                <Progress value={Math.min((assessment.bmi / 30) * 100, 100)} className="h-3" />
                                                <div className="text-xs text-gray-500 mt-1">Normal: 18.5-24.9</div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">% Gordura</span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(assessment.fat_percentage)}%</span>
                                                </div>
                                                <Progress value={Math.min((assessment.fat_percentage / 35) * 100, 100)} className="h-3" />
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {assessment.gender === 'male' ? 'Ideal: 10-15%' : 'Ideal: 16-24%'}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">Classificação</span>
                                                    <span className={`text-sm font-semibold ${colorClass}`}>{classification}</span>
                                                </div>
                                                <div className={`h-3 rounded-full ${classification === 'Atlético' ? 'bg-green-500' :
                                                        classification === 'Fitness' ? 'bg-blue-500' :
                                                            classification === 'Aceitável' ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Protocol Information */}
                        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                                        <Calculator className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Informações do Protocolo</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Método utilizado e precisão da avaliação
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                                        <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Protocolo Utilizado</div>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                        <div className="font-semibold text-green-700 dark:text-green-300 mb-2">Precisão Estimada</div>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {assessment.accuracy_estimate}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                        <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Data da Avaliação</div>
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {assessment.notes && (
                            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl">
                                            <Info className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Observações</CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                Anotações da avaliação física
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                            {assessment.notes}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Measurements Tab */}
                    <TabsContent value="measurements" className="space-y-6">
                        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                        <Ruler className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Medidas Registradas</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Todas as medidas coletadas durante a avaliação
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Circunferências */}
                                <div className="mb-8">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl">🔵</span>
                                        Circunferências
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(assessment.measurements)
                                            .filter(([key]) => ['neck', 'shoulders', 'chest', 'chest_circ', 'waist', 'abdomen', 'hips', 'left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'left_calf', 'right_calf'].includes(key))
                                            .filter(([_, value]) => value > 0)
                                            .map(([key, value]) => (
                                                <div key={key} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                                    <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
                                                        {MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {formatNumber(value)}cm
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Dobras Cutâneas */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl">🟡</span>
                                        Dobras Cutâneas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(assessment.measurements)
                                            .filter(([key]) => ['triceps', 'biceps', 'subscapular', 'abdominal', 'suprailiac', 'midaxillary', 'thigh'].includes(key))
                                            .filter(([_, value]) => value > 0)
                                            .map(([key, value]) => (
                                                <div key={key} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                                    <div className="font-semibold text-yellow-700 dark:text-yellow-300 text-sm">
                                                        {MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {formatNumber(value)}mm
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {Object.entries(assessment.measurements).filter(([_, value]) => value > 0).length === 0 && (
                                    <div className="text-center py-12">
                                        <Ruler className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                            Nenhuma medida registrada
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-500">
                                            As medidas específicas não foram coletadas nesta avaliação
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-6">
                        {assessment.ai_analysis ? (
                            <div className="space-y-6">
                                {/* Classification */}
                                <Card className="border-0 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                                <Brain className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Análise Inteligente</CardTitle>
                                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                                    Classificação e perfil corporal por IA
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
                                                    {assessment.ai_analysis.classification}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Classificação Corporal</div>
                                            </div>
                                            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                                                    {assessment.ai_analysis.somatotype}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Somatótipo</div>
                                            </div>
                                            <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2">
                                                    {assessment.ai_analysis.healthStatus}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Status de Saúde</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recommendations */}
                                {assessment.ai_recommendations && (
                                    <>
                                        {/* Training Recommendations */}
                                        {assessment.ai_recommendations.training && (
                                            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                                            <Activity className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações de Treino</CardTitle>
                                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                                Estratégias personalizadas de treinamento
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(assessment.ai_recommendations.training).map(([key, value]) => (
                                                            <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                                <div className="font-semibold text-blue-700 dark:text-blue-300 capitalize mb-2">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                                </div>
                                                                <div className="text-gray-900 dark:text-white">{formatString(value)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Nutrition Recommendations */}
                                        {assessment.ai_recommendations.nutrition && (
                                            <Card className="border-0 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                                            <Heart className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações Nutricionais</CardTitle>
                                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                                Estratégias alimentares personalizadas
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(assessment.ai_recommendations.nutrition).map(([key, value]) => (
                                                            <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                                <div className="font-semibold text-green-700 dark:text-green-300 capitalize mb-2">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                                </div>
                                                                <div className="text-gray-900 dark:text-white">{formatString(value)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Lifestyle Recommendations */}
                                        {assessment.ai_recommendations.lifestyle && (
                                            <Card className="border-0 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                                                            <Zap className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recomendações de Estilo de Vida</CardTitle>
                                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                                Hábitos para otimizar resultados
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {Object.entries(assessment.ai_recommendations.lifestyle).map(([key, value]) => (
                                                            <div key={key} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                                <div className="font-semibold text-purple-700 dark:text-purple-300 capitalize mb-2">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                                </div>
                                                                <div className="text-gray-900 dark:text-white">{formatString(value)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                                <CardContent className="text-center py-24">
                                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                                        Análise IA não disponível
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-500 mb-6">
                                        Esta avaliação não possui análise de inteligência artificial
                                    </p>
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
                                        Análise manual realizada
                                    </Badge>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Comparison Tab */}
                    <TabsContent value="comparison" className="space-y-6">
                        <AssessmentComparison 
                            currentAssessment={assessment}
                            studentId={assessment.student_id}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}