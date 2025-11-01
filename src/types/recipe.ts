export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export type StepType = 'instruction' | 'cooking';

export interface CookingSettings {
  temperatureC: number; // 40–200
  speed: number; // 1–5
}

export interface Step {
  id: string;
  description: string;
  type: StepType;
  durationSeconds: number; // duration for the step
  ingredientIds?: string[]; // required if type=instruction
  cookingSettings?: CookingSettings; // required if type=cooking
}

export interface Recipe {
  id: string;
  title: string;
  difficulty: Difficulty;
  favorite: boolean;
  ingredients: Ingredient[];
  steps: Step[];
  cuisine?: string;
  // Derived
  totalTimeMinutes: number;
  totalIngredients: number;
  complexityScore: number;
}





