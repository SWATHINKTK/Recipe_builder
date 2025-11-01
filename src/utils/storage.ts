import { Recipe } from '@/types/recipe';

const RECIPES_KEY = 'recipes:v1';

export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Recipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}


