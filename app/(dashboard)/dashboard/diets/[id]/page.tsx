// app/(dashboard)/dashboard/diets/[id]/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  User,
  Target,
  Activity,
  Calendar,
  Weight,
  BarChart3,
  Utensils,
  Apple,
  Brain,
  Clock,
  CheckCircle,
  Edit,
  Copy,
  Share2,
  Download,
  Printer,
  TrendingUp,
  Zap,
  Timer,
  DollarSign,
  Heart,
  Shield,
  ChefHat,
  Coffee,
  Salad,
  Pizza,
  Beef
} from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface DietData {
  id: string;
  name: string;
  description: string;
  student: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  age: number;
  weight: number;
  height?: number;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description?: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions?: string;
  used_physical_assessment: boolean;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  status: string;
  created_at: string;
  updated_at: string;
  meals: Array<{
    id: string;
    meal_type: string;
    meal_time: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    order_index: number;
    foods: Array<{
      id: string;
      food_name: string;
      quantity: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      substitutions?: string[];
      notes?: string;
      order_index: number;
    }>;
  }>;
  shopping_list: Array<{
    id: string;
    category: string;
    item_name: string;
    quantity: string;
    notes?: string;
    order_index: number;
  }>;
}

export default function DietDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [diet, setDiet] = useState<DietData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (params.id) {
      fetchDiet();
    }
  }, [params.id]);

  const fetchDiet = async () => {
    try {
      setLoading(true);

      // Buscar dieta principal
      const { data: dietData, error: dietError } = await supabase
        .from('diets')
        .select(`
          *,
          student:student_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', params.id)
        .single();

      if (dietError) throw dietError;

      // Buscar refeições
      const { data: mealsData, error: mealsError } = await supabase
        .from('diet_meals')
        .select('*')
        .eq('diet_id', params.id)
        .order('order_index');

      if (mealsError) throw mealsError;

      // Buscar alimentos de cada refeição
      const mealsWithFoods = await Promise.all(
        (mealsData || []).map(async (meal) => {
          const { data: foodsData, error: foodsError } = await supabase
            .from('diet_meal_foods')
            .select('*')
            .eq('meal_id', meal.id)
            .order('order_index');

          if (foodsError) throw foodsError;

          return {
            ...meal,
            foods: foodsData || []
          };
        })
      );

      // Buscar lista de compras
      const { data: shoppingData, error: shoppingError } = await supabase
        .from('diet_shopping_lists')
        .select('*')
        .eq('diet_id', params.id)
        .order('order_index');

      if (shoppingError) throw shoppingError;

      setDiet({
        ...dietData,
        meals: mealsWithFoods,
        shopping_list: shoppingData || []
      });

    } catch (error: any) {
      console.error('Error fetching diet:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dieta",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getGoalIcon = (goal: string) => {
    const icons: Record<string, any> = {
      muscle_gain: <TrendingUp className="h-5 w-5" />,
      fat_loss: <Target className="h-5 w-5" />,
      reeducation: <Apple className="h-5 w-5" />,
      performance: <Zap className="h-5 w-5" />,
      maintenance: <BarChart3 className="h-5 w-5" />
    };
    return icons[goal] || <Target className="h-5 w-5" />;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      muscle_gain: 'Ganho de Massa Muscular',
      fat_loss: 'Perda de Gordura',
      reeducation: 'Reeducação Alimentar',
      performance: 'Melhora de Performance',
      maintenance: 'Manutenção de Peso'
    };
    return labels[goal] || 'Personalizado';
  };

  const getActivityLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: 'Sedentário',
      light: 'Leve',
      moderate: 'Moderado',
      intense: 'Intenso',
      athlete: 'Atleta'
    };
    return labels[level] || level;
  };

  const getBudgetLabel = (budget: string) => {
    const labels: Record<string, string> = {
      economic: 'Econômico',
      intermediate: 'Intermediário',
      free: 'Livre'
    };
    return labels[budget] || budget;
  };

  const getDietaryStyleIcon = (style: string) => {
    const icons: Record<string, any> = {
      vegetarian: <Salad className="h-4 w-4" />,
      vegan: <Apple className="h-4 w-4" />,
      omnivore: <Pizza className="h-4 w-4" />,
      low_carb: <Beef className="h-4 w-4" />,
      keto: <Beef className="h-4 w-4" />,
      paleo: <Beef className="h-4 w-4" />,
      intermittent: <Timer className="h-4 w-4" />,
      flexible: <Coffee className="h-4 w-4" />
    };
    return icons[style] || <Utensils className="h-4 w-4" />;
  };

  const getDietaryStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      vegetarian: 'Vegetariano',
      vegan: 'Vegano',
      omnivore: 'Onívoro',
      low_carb: 'Low Carb',
      keto: 'Cetogênica',
      paleo: 'Paleo',
      intermittent: 'Jejum Intermitente',
      flexible: 'Flexível'
    };
    return labels[style] || style;
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche da Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da Tarde',
      dinner: 'Jantar',
      evening_snack: 'Lanche da Noite'
    };
    return labels[mealType] || mealType;
  };

  const handleEdit = () => {
    router.push(`/dashboard/diets/${params.id}/edit`);
  };

  const handleClone = () => {
    router.push(`/dashboard/diets/new?clone=${params.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Carregando dieta...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Por favor, aguarde enquanto buscamos as informações.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/40 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
            <Target className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dieta não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A dieta solicitada não existe ou você não tem permissão para visualizá-la.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

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
                  
                  <div className="flex items-center gap-4">
                    {diet.student?.avatar_url ? (
                      <img
                        src={diet.student.avatar_url}
                        alt={diet.student.full_name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-green-500/20"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                    
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                        {diet.name}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                        <span className="font-semibold text-green-600 dark:text-green-400">{diet.student.full_name}</span> • 
                        <span className="ml-2">
                          {formatDistanceToNow(new Date(diet.created_at), {
                            locale: ptBR,
                            addSuffix: true
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl h-12 px-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleClone}
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl h-12 px-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Clonar
                </Button>
                
                <Button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0 h-12"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {diet.status !== 'active' && (
          <Alert className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-700/50">
            <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
              Esta dieta está {diet.status === 'inactive' ? 'inativa' : 'arquivada'}.
            </AlertDescription>
          </Alert>
        )}

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
            <TabsList className="relative grid w-full grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="meals"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Refeições
              </TabsTrigger>
              <TabsTrigger
                value="shopping"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
              >
                <Apple className="h-4 w-4 mr-2" />
                Lista de Compras
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Macros Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-green-600 dark:text-green-400">
                        {Math.round(diet.target_calories)}
                      </div>
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Calorias Diárias
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {Math.round(diet.target_protein)}g
                      </div>
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Proteína
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-orange-600 dark:text-orange-400">
                        {Math.round(diet.target_carbs)}g
                      </div>
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Carboidratos
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                        {Math.round(diet.target_fat)}g
                      </div>
                      <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Gordura
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Diet Summary */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <ChefHat className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Resumo da Dieta
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {diet.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Goal */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        {getGoalIcon(diet.goal)}
                        <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                          Objetivo
                        </span>
                      </div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        {getGoalLabel(diet.goal)}
                      </p>
                      {diet.goal_description && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {diet.goal_description}
                        </p>
                      )}
                    </div>

                    {/* Activity Level */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Atividade
                        </span>
                      </div>
                      <p className="font-semibold text-blue-800 dark:text-blue-300">
                        {getActivityLabel(diet.activity_level)}
                      </p>
                    </div>

                    {/* Meals per Day */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Refeições
                        </span>
                      </div>
                      <p className="font-semibold text-purple-800 dark:text-purple-300">
                        {diet.meals_per_day} por dia
                      </p>
                    </div>

                    {/* Physical Info */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Weight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Físico
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-300">
                        {diet.weight}kg • {diet.age} anos
                        {diet.height && ` • ${diet.height}cm`}
                      </p>
                    </div>

                    {/* Budget */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                          Orçamento
                        </span>
                      </div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                        {getBudgetLabel(diet.budget_profile)}
                      </p>
                    </div>

                    {/* Assessment */}
                    {diet.used_physical_assessment && (
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Avaliação
                          </span>
                        </div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Com Avaliação Física
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dietary Styles */}
                  {diet.dietary_style && diet.dietary_style.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Estilo Alimentar
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {diet.dietary_style.map((style) => (
                          <Badge key={style} className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 dark:border-indigo-600 rounded-full font-semibold">
                            <div className="flex items-center gap-2">
                              {getDietaryStyleIcon(style)}
                              {getDietaryStyleLabel(style)}
                            </div>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restrictions */}
                  {diet.restrictions && diet.restrictions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Restrições Alimentares
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {diet.restrictions.map((restriction) => (
                          <Badge key={restriction} className="px-3 py-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300 dark:border-red-600 rounded-full">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Restrictions */}
                  {diet.custom_restrictions && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Observações Adicionais
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        {diet.custom_restrictions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            <div className="space-y-6">
              {diet.meals.map((meal, index) => (
                <div key={meal.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                            <Utensils className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                              {meal.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {meal.meal_time} • {meal.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(meal.calories)} cal
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            P: {Math.round(meal.protein)}g • C: {Math.round(meal.carbs)}g • G: {Math.round(meal.fat)}g
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Foods */}
                      <div className="space-y-3">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={food.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {food.food_name}
                                </span>
                                <Badge className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                                  {food.quantity} {food.unit}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                              </div>
                              {food.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {food.notes}
                                </p>
                              )}
                            </div>
                            
                            {food.substitutions && food.substitutions.length > 0 && (
                              <div className="ml-4">
                                <Badge className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">
                                  {food.substitutions.length} substituição{food.substitutions.length > 1 ? 'ões' : ''}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shopping List Tab */}
          <TabsContent value="shopping" className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                      <Apple className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Lista de Compras
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Todos os ingredientes necessários organizados por categoria
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {diet.shopping_list.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(
                        diet.shopping_list.reduce((acc, item) => {
                          if (!acc[item.category]) {
                            acc[item.category] = [];
                          }
                          acc[item.category].push(item);
                          return acc;
                        }, {} as Record<string, typeof diet.shopping_list>)
                      ).map(([category, items]) => (
                        <div key={category} className="space-y-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {item.item_name}
                                  </span>
                                </div>
                                {item.quantity && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Apple className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Nenhuma lista de compras
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Esta dieta não possui uma lista de compras gerada.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        Informações da Dieta
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Detalhes técnicos e metadados
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Dados do Aluno
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {diet.student.full_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Idade:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {diet.age} anos
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Peso:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {diet.weight} kg
                          </span>
                        </div>
                        {diet.height && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Altura:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {diet.height} cm
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sexo:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {diet.gender === 'male' ? 'Masculino' : diet.gender === 'female' ? 'Feminino' : 'Outro'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Metadados
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <Badge className={cn(
                            "px-3 py-1 rounded-full font-semibold",
                            diet.status === 'active' 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          )}>
                            {diet.status === 'active' ? 'Ativa' : diet.status === 'inactive' ? 'Inativa' : 'Arquivada'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Criada em:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(diet.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Atualizada em:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(diet.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}