import { z } from 'zod';

/**
 * Schema de saída da IA para `generate_diet` (Edge Function `generate-diet`).
 *
 * PURO: só `zod`. Nenhuma API só-Deno (`Deno.*`, `npm:`, `std/`) — este arquivo
 * é importável pelo Next, pelo Vitest e pelo runtime Deno das Edge Functions.
 *
 * Campos alinhados a architecture.md §6.2:
 * - `diet_meals` (name, time, order_index)
 * - `diet_meal_foods` (food_name, quantity, unit, kcal, protein_g, carbs_g, fat_g)
 * - `diets` (target_kcal, protein_g, carbs_g, fat_g como totais)
 * - `diet_shopping_lists` (items jsonb) -> lista de compras
 */

// Macro em gramas: número finito, não-negativo.
const macroGrams = z
  .number({ invalid_type_error: 'Valor de macronutriente deve ser numérico.' })
  .finite()
  .nonnegative('Macronutriente não pode ser negativo.');

// Energia em kcal: número finito, não-negativo.
const kcal = z
  .number({ invalid_type_error: 'Valor de kcal deve ser numérico.' })
  .finite()
  .nonnegative('kcal não pode ser negativo.');

/** Um alimento de uma refeição (`diet_meal_foods`). */
export const dietMealFoodSchema = z.object({
  food_name: z.string().min(1, 'Nome do alimento é obrigatório.'),
  quantity: z.number().finite().positive('Quantidade deve ser positiva.'),
  unit: z.string().min(1, 'Unidade é obrigatória.'),
  kcal,
  protein_g: macroGrams,
  carbs_g: macroGrams,
  fat_g: macroGrams,
});

/** Uma refeição da dieta (`diet_meals`). */
export const dietMealSchema = z.object({
  name: z.string().min(1, 'Nome da refeição é obrigatório.'),
  // `diet_meals.time` é um horário livre (ex.: "08:00"); string não-vazia.
  time: z.string().min(1, 'Horário da refeição é obrigatório.'),
  order_index: z.number().int('order_index deve ser inteiro.').nonnegative(),
  foods: z.array(dietMealFoodSchema).min(1, 'A refeição precisa de ao menos um alimento.'),
});

/** Totais de macros da dieta (correspondem às colunas de `diets`). */
export const dietMacroTotalsSchema = z.object({
  target_kcal: kcal,
  protein_g: macroGrams,
  carbs_g: macroGrams,
  fat_g: macroGrams,
});

/** Saída completa da geração de dieta. */
export const generateDietOutputSchema = z.object({
  meals: z.array(dietMealSchema).min(1, 'A dieta precisa de ao menos uma refeição.'),
  totals: dietMacroTotalsSchema,
  // Lista de compras -> `diet_shopping_lists.items`.
  shopping_list: z.array(z.string().min(1)).min(1, 'A lista de compras não pode ser vazia.'),
  // Aviso de rascunho / não substitui nutricionista-médico (ADR 0001 §6).
  disclaimer: z.string().min(1, 'O aviso é obrigatório.'),
});

export type DietMealFood = z.infer<typeof dietMealFoodSchema>;
export type DietMeal = z.infer<typeof dietMealSchema>;
export type DietMacroTotals = z.infer<typeof dietMacroTotalsSchema>;
export type GenerateDietOutput = z.infer<typeof generateDietOutputSchema>;
