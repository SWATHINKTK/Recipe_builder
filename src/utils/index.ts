import { Recipe } from "@/types/recipe";

export function computeDerived(recipe: Omit<Recipe, 'totalTimeMinutes' | 'totalIngredients' | 'complexityScore'>): Recipe {
    const totalSeconds = recipe.steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    const totalTimeMinutes = Math.round(totalSeconds / 60);
    const totalIngredients = recipe.ingredients.length;
    const stepComplexity = recipe.steps.reduce((sum, s) => sum + (s.type === 'cooking' ? 2 : 1), 0);
    const difficultyFactor = recipe.difficulty === 'Easy' ? 1 : recipe.difficulty === 'Medium' ? 1.5 : 2;
    const complexityScore = Math.round((stepComplexity + totalIngredients / 2 + totalSeconds / 180) * difficultyFactor);
    return { ...recipe, totalTimeMinutes, totalIngredients, complexityScore };
  }