// components/diets/steps/StepReview.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  Brain, 
  Loader2, 
  Edit3, 
  Utensils, 
  Apple, 
  ChefHat,
  Save,
  Info,
  AlertCircle,
  Sparkles,
  Scale,
  BarChart3,
  Zap,
  Beef
} from 'lucide-react';

import type { DietFormData, GeneratedDiet } from '../types';

interface StepReviewProps {
  formData: DietFormData;
  generatedDiet: GeneratedDiet | null;
  dietNotes: string;
  isGenerating: boolean;
  isSaving: boolean;
  isFormValid: boolean;
  onGenerateDiet: () => void;
  onSaveDiet: () => void;
  onSetDietNotes: (notes: string) => void;
}

const MACRO_METRICS = [
  { key: 'target_calories', label: 'Calorias', suffix: '', icon: 'Zap', color: 'from-yellow-500 to-orange-500', maxValue: 5000 },
  { key: 'target_protein', label: 'Proteína', suffix: 'g', icon: 'Beef', color: 'from-blue-500 to-cyan-500', maxValue: 300 },
  { key: 'target_carbs', label: 'Carboidratos', suffix: 'g', icon: 'Apple', color: 'from-green-500 to-emerald-500', maxValue: 500 },
  { key: 'target_fat', label: 'Gordura', suffix: 'g', icon: 'Scale', color: 'from-purple-500 to-pink-500', maxValue: 200 }
];

export function StepReview({
  formData,
  generatedDiet,
  dietNotes,
  isGenerating,
  isSaving,
  isFormValid,
  onGenerateDiet,
  onSaveDiet,
  onSetDietNotes
}: StepReviewProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);

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

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Zap,
      Beef,
      Apple,
      Scale
    };
    return icons[iconName] || BarChart3;
  };

  if (!generatedDiet) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="relative mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
            <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-4">
          Gere sua dieta personalizada
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
          Clique no botão abaixo para criar uma dieta personalizada com IA baseada nas suas preferências
        </p>
        
        <Button
          onClick={onGenerateDiet}
          disabled={!isFormValid || isGenerating}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Gerando dieta com IA...</span>
              <span className="sm:hidden">Gerando...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Gerar Dieta com IA</span>
              <span className="sm:hidden">Gerar com IA</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Diet Summary */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur-xl opacity-75"></div>
        <div className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {generatedDiet.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {generatedDiet.description}
              </p>
            </div>
          </div>

          {/* Macros Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {MACRO_METRICS.map((metric) => {
              const IconComponent = getIconComponent(metric.icon);
              const value = generatedDiet[metric.key as keyof GeneratedDiet] as number;
              const percentage = Math.min((value / metric.maxValue) * 100, 100);
              
              return (
                <div key={metric.key} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="space-y-0.5 text-left">
                          <p className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                            {metric.label}
                          </p>
                          <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                            {Math.round(value)}{metric.suffix}
                          </p>
                        </div>
                        <div className={`p-2 bg-gradient-to-br ${metric.color} rounded-lg shadow-lg shrink-0`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3 sm:space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          Observações da Dieta
        </Label>
        <Textarea
          placeholder="Adicione observações personalizadas, instruções especiais ou modificações desejadas..."
          value={dietNotes}
          onChange={(e) => onSetDietNotes(e.target.value)}
          className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
        />
      </div>

      {/* Tabs for Content */}
      <Tabs defaultValue="meals" className="w-full">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <TabsList className="relative grid w-full grid-cols-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
            <TabsTrigger
              value="meals"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300 font-semibold"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Refeições</span>
              <span className="sm:hidden">Refeições</span>
            </TabsTrigger>
            <TabsTrigger
              value="shopping"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300 font-semibold"
            >
              <Apple className="h-4 w-4" />
              <span className="hidden sm:inline">Lista Compras</span>
              <span className="sm:hidden">Compras</span>
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 font-semibold"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendações</span>
              <span className="sm:hidden">Dicas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-4">
          {generatedDiet.meals.map((meal, index) => (
            <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {meal.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {meal.meal_time} • {getMealTypeLabel(meal.meal_type)}
                    </p>
                    {meal.description && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {meal.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(meal.calories)} cal
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      P: {Math.round(meal.protein)}g • C: {Math.round(meal.carbs)}g • G: {Math.round(meal.fat)}g
                    </div>
                  </div>
                </div>

                {/* Foods */}
                <div className="space-y-2">
                  {meal.foods.map((food, foodIndex) => (
                    <div key={foodIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                          {food.food_name}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {food.quantity} {food.unit}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {food.calories} cal
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Shopping List Tab */}
        <TabsContent value="shopping" className="space-y-4">
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  generatedDiet.shopping_list.reduce((acc, item) => {
                    if (!acc[item.category]) {
                      acc[item.category] = [];
                    }
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, typeof generatedDiet.shopping_list>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      {category}
                    </h4>
                    <div className="space-y-1 pl-4">
                      {items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
                          <span>• {item.item_name}</span>
                          <span className="font-medium text-green-600 dark:text-green-400 text-xs">
                            {item.weekly_quantity || item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="tips" className="space-y-4">
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {generatedDiet.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-indigo-800 dark:text-indigo-200 text-sm sm:text-base">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button
          onClick={onGenerateDiet}
          disabled={isGenerating || isSaving}
          className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Gerando...</span>
              <span className="sm:hidden">Gerando...</span>
            </>
          ) : (
            <>
              <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Gerar Nova Versão</span>
              <span className="sm:hidden">Nova Versão</span>
            </>
          )}
        </Button>

        <Button
          onClick={onSaveDiet}
          disabled={isSaving || isGenerating}
          className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Salvando...</span>
              <span className="sm:hidden">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Salvar Dieta</span>
              <span className="sm:hidden">Salvar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}