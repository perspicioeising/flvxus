// components/diets/components/steps/StepReview.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Brain, 
  Loader2, 
  Edit3, 
  Utensils, 
  Apple, 
  ChefHat 
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
  const [isEditing, setIsEditing] = useState(false);

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

  return (
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
                Dieta Gerada com IA
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Revise e aprove a dieta personalizada
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {!generatedDiet ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gere sua dieta personalizada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete as informações nas abas anteriores e clique em "Gerar com IA"
              </p>
              <Button
                onClick={onGenerateDiet}
                disabled={!isFormValid || isGenerating}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Diet Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                      {generatedDiet.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400">
                      {generatedDiet.description}
                    </p>
                  </div>
                </div>

                {/* Macros Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(generatedDiet.target_calories)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Calorias</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(generatedDiet.target_protein)}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Proteína</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(generatedDiet.target_carbs)}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Carboidratos</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(generatedDiet.target_fat)}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gordura</div>
                  </div>
                </div>
              </div>

              {/* Editable Notes Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Observações Adicionais (Opcional)
                  </Label>
                </div>
                <Textarea
                  value={dietNotes}
                  onChange={(e) => onSetDietNotes(e.target.value)}
                  placeholder="Adicione observações personalizadas, instruções especiais ou modificações desejadas..."
                  className="min-h-[120px] bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm"
                />
              </div>

              {/* Meals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Refeições ({generatedDiet.meals.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 dark:text-blue-400 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Visualizar' : 'Editar'}
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {generatedDiet.meals.map((meal, index) => (
                    <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {meal.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {meal.meal_time} • {getMealTypeLabel(meal.meal_type)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {meal.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
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
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {food.food_name}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                  {food.quantity} {food.unit}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {food.calories} cal
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Shopping List */}
              {generatedDiet.shopping_list && generatedDiet.shopping_list.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Apple className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Lista de Compras (Semanal)
                  </h3>
                  
                  <Card className="border-0 bg-white/80 dark:bg-gray-800/80 shadow-lg rounded-xl">
                    <CardContent className="p-6">
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
                            <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                              {category}
                            </h4>
                            <div className="space-y-1">
                              {items.map((item, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                                  <span>• {item.item_name}</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
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
                </div>
              )}

              {/* Recommendations */}
              {generatedDiet.recommendations && generatedDiet.recommendations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Recomendações
                  </h3>
                  
                  <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-lg rounded-xl">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {generatedDiet.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                            <p className="text-blue-800 dark:text-blue-300 text-sm">
                              {rec}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={onGenerateDiet}
                  disabled={isGenerating || isSaving}
                  className="flex-1 h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 rounded-xl font-semibold"
                >
                  <ChefHat className="h-5 w-5 mr-2" />
                  Gerar Nova Versão
                </Button>
                
                <Button
                  onClick={onSaveDiet}
                  disabled={isSaving}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Salvar Dieta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}