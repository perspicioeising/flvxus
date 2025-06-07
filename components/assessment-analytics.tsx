'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
    Legend
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Activity,
    Target,
    Award,
    AlertTriangle,
    Brain,
    Calendar,
    Zap,
    Eye,
    Download,
    Filter,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface AnalyticsData {
    totalAssessments: number;
    totalStudents: number;
    averageBMI: number;
    averageFat: number;
    protocolDistribution: { protocol: string; count: number; percentage: number }[];
    monthlyTrends: { month: string; assessments: number; avgFat: number; avgLean: number }[];
    demographicData: { ageGroup: string; count: number; avgFat: number }[];
    improvementMetrics: {
        studentsImproving: number;
        averageImprovement: number;
        topPerformers: { name: string; improvement: number }[];
    };
    riskAnalysis: {
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
    };
}

interface AssessmentAnalyticsProps {
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const chartConfig = {
    avgFat: {
        label: "% Gordura Média",
        color: "hsl(var(--chart-1))",
    },
    avgLean: {
        label: "Massa Magra (kg)",
        color: "hsl(var(--chart-2))",
    },
    assessments: {
        label: "Avaliações",
        color: "hsl(var(--chart-3))",
    },
    count: {
        label: "Quantidade",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig;

const protocolColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export default function AssessmentAnalytics({ timeRange = 'month' }: AssessmentAnalyticsProps) {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'demographics' | 'performance'>('overview');
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);


    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedTimeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);

            // Simular dados para demonstração - em produção, viria da API
            const mockData: AnalyticsData = {
                totalAssessments: 156,
                totalStudents: 89,
                averageBMI: 24.3,
                averageFat: 18.7,
                protocolDistribution: [
                    { protocol: 'Jackson & Pollock (3 dobras)', count: 45, percentage: 28.8 },
                    { protocol: 'Jackson & Pollock (7 dobras)', count: 38, percentage: 24.4 },
                    { protocol: 'Guedes (1994)', count: 32, percentage: 20.5 },
                    { protocol: 'Durnin & Womersley', count: 25, percentage: 16.0 },
                    { protocol: 'PROESP-BR', count: 16, percentage: 10.3 }
                ],
                monthlyTrends: [
                    { month: 'Jan', assessments: 12, avgFat: 19.2, avgLean: 55.8 },
                    { month: 'Fev', assessments: 18, avgFat: 18.9, avgLean: 56.1 },
                    { month: 'Mar', assessments: 22, avgFat: 18.5, avgLean: 56.8 },
                    { month: 'Abr', assessments: 19, avgFat: 18.2, avgLean: 57.2 },
                    { month: 'Mai', assessments: 25, avgFat: 17.8, avgLean: 57.9 },
                    { month: 'Jun', assessments: 28, avgFat: 17.5, avgLean: 58.3 }
                ],
                demographicData: [
                    { ageGroup: '18-25', count: 32, avgFat: 16.8 },
                    { ageGroup: '26-35', count: 28, avgFat: 18.2 },
                    { ageGroup: '36-45', count: 18, avgFat: 20.1 },
                    { ageGroup: '46-55', count: 8, avgFat: 22.5 },
                    { ageGroup: '55+', count: 3, avgFat: 24.8 }
                ],
                improvementMetrics: {
                    studentsImproving: 67,
                    averageImprovement: 12.3,
                    topPerformers: [
                        { name: 'João Silva', improvement: 28.5 },
                        { name: 'Maria Santos', improvement: 24.8 },
                        { name: 'Pedro Costa', improvement: 22.1 }
                    ]
                },
                riskAnalysis: {
                    highRisk: 8,
                    mediumRisk: 23,
                    lowRisk: 58
                }
            };

            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAnalyticsData(mockData);
        } catch (error) {
            console.error('Erro ao buscar dados de analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOverviewCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">
                                Total Avaliações
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {analyticsData?.totalAssessments}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                            <BarChart3 className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            +12% vs mês anterior
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wider">
                                Alunos Ativos
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {analyticsData?.totalStudents}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            +8% vs mês anterior
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">
                                IMC Médio
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {analyticsData?.averageBMI}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                        Faixa Normal
                    </Badge>
                </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">
                                % Gordura Média
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {analyticsData?.averageFat}%
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                            <Target className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            -2.3% vs mês anterior
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderProtocolDistribution = () => (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                        <PieChartIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Distribuição de Protocolos</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300">
                            Protocolos mais utilizados nas avaliações
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64">
                        <ChartContainer config={chartConfig}>
                            <PieChart>
                                <Pie
                                    data={analyticsData?.protocolDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {analyticsData?.protocolDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={protocolColors[index % protocolColors.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </div>

                    <div className="space-y-3">
                        {analyticsData?.protocolDistribution.map((item, index) => (
                            <div key={item.protocol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: protocolColors[index % protocolColors.length] }}
                                    ></div>
                                    <span className="font-medium text-sm">{item.protocol}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">{item.count}</div>
                                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderTrendsChart = () => (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                        <LineChartIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Tendências Mensais</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300">
                            Evolução da composição corporal ao longo do tempo
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ChartContainer config={chartConfig}>
                        <AreaChart data={analyticsData?.monthlyTrends}>
                            <defs>
                                <linearGradient id="fillFat" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-avgFat)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-avgFat)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient id="fillLean" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-avgLean)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-avgLean)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Area
                                dataKey="avgFat"
                                type="natural"
                                fill="url(#fillFat)"
                                fillOpacity={0.4}
                                stroke="var(--color-avgFat)"
                                strokeWidth={2}
                                stackId="a"
                            />
                            <Area
                                dataKey="avgLean"
                                type="natural"
                                fill="url(#fillLean)"
                                fillOpacity={0.4}
                                stroke="var(--color-avgLean)"
                                strokeWidth={2}
                                stackId="b"
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>

                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">% Gordura Média</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Massa Magra Média (kg)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderDemographics = () => (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Análise Demográfica</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300">
                            Distribuição por faixa etária e composição corporal
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={analyticsData?.demographicData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="ageGroup"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );

    const renderPerformanceMetrics = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Melhoria */}
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Métricas de Evolução</CardTitle>
                            <p className="text-gray-600 dark:text-gray-300">
                                Performance dos alunos
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                            {analyticsData?.improvementMetrics.studentsImproving}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            alunos com melhoria significativa
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                            {analyticsData?.improvementMetrics.averageImprovement}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            melhoria média
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Top Performers</h4>
                        {analyticsData?.improvementMetrics.topPerformers.map((performer, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="font-medium">{performer.name}</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                    +{performer.improvement}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Análise de Riscos */}
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Análise de Riscos</CardTitle>
                            <p className="text-gray-600 dark:text-gray-300">
                                Classificação de risco de saúde
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span className="font-medium text-red-800 dark:text-red-200">Alto Risco</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {analyticsData?.riskAnalysis.highRisk}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                <span className="font-medium text-yellow-800 dark:text-yellow-200">Risco Moderado</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {analyticsData?.riskAnalysis.mediumRisk}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span className="font-medium text-green-800 dark:text-green-200">Baixo Risco</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {analyticsData?.riskAnalysis.lowRisk}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Recomendações da IA</h5>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-start gap-2">
                                <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Agendar reavaliações trimestrais para o grupo de alto risco</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Implementar programas específicos de redução de gordura corporal</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Considerar parcerias com nutricionistas para casos complexos</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
                        <CardContent className="p-8">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header com Filtros */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Analytics de Avaliações
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Insights inteligentes sobre o desempenho dos seus alunos
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        value={selectedTimeRange}
                        onValueChange={(value) => setSelectedTimeRange(value as 'week' | 'month' | 'quarter' | 'year')}
                    >            <SelectTrigger className="w-[180px] h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Última Semana</SelectItem>
                            <SelectItem value="month">Último Mês</SelectItem>
                            <SelectItem value="quarter">Último Trimestre</SelectItem>
                            <SelectItem value="year">Último Ano</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        {[
                            { key: 'overview', label: 'Visão Geral', icon: Eye },
                            { key: 'trends', label: 'Tendências', icon: TrendingUp },
                            { key: 'demographics', label: 'Demografia', icon: Users },
                            { key: 'performance', label: 'Performance', icon: Award }
                        ].map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                variant={selectedView === key ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedView(key as any)}
                                className={`rounded-lg transition-all duration-200 ${selectedView === key
                                        ? 'bg-white dark:bg-gray-700 shadow-lg'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {label}
                            </Button>
                        ))}
                    </div>

                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-12 px-6">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Conteúdo baseado na view selecionada */}
            {selectedView === 'overview' && (
                <div className="space-y-8">
                    {renderOverviewCards()}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {renderProtocolDistribution()}
                        {renderTrendsChart()}
                    </div>
                </div>
            )}

            {selectedView === 'trends' && (
                <div className="space-y-6">
                    {renderTrendsChart()}
                    {renderDemographics()}
                </div>
            )}

            {selectedView === 'demographics' && (
                <div className="space-y-6">
                    {renderDemographics()}
                    {renderProtocolDistribution()}
                </div>
            )}

            {selectedView === 'performance' && (
                <div className="space-y-6">
                    {renderPerformanceMetrics()}
                </div>
            )}

            {/* Insights da IA */}
            <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Insights Inteligentes</CardTitle>
                            <p className="text-gray-600 dark:text-gray-300">
                                Análises automáticas baseadas em IA
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <span className="font-semibold text-green-600 dark:text-green-400">Tendência Positiva</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                75% dos alunos mostram melhoria na composição corporal nos últimos 3 meses.
                            </p>
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-blue-600 dark:text-blue-400">Protocolo Eficaz</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Jackson & Pollock (7 dobras) apresenta os melhores resultados de precisão.
                            </p>
                        </div>

                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <span className="font-semibold text-yellow-600 dark:text-yellow-400">Atenção Requerida</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                8 alunos necessitam de acompanhamento mais próximo devido ao alto risco.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
