import type { Step, Recipe } from '@/types/recipe';

export function validateStep(step: Step): string[] {
    const errors: string[] = [];
    if (!step.description.trim()) errors.push('Step description is required');
    if (step.durationSeconds <= 0) errors.push('Step duration must be > 0');
    if (step.type === 'cooking') {
        if (!step.cookingSettings) errors.push('Cooking step requires settings');
        else {
            const { temperatureC, speed } = step.cookingSettings;
            if (temperatureC < 40 || temperatureC > 200) errors.push('Temperature must be 40–200°C');
            if (speed < 1 || speed > 5) errors.push('Speed must be 1–5');
        }
    }
    if (step.type === 'instruction') {
        if (!step.ingredientIds || step.ingredientIds.length === 0) errors.push('Instruction step requires ingredientIds');
    }
    return errors;
}

export function validateRecipe(recipe: Omit<Recipe, 'id'>): string[] {
    const errors: string[] = [];
    if (!recipe.title.trim()) errors.push('Title is required');
    if (!recipe.ingredients.length) errors.push('At least one ingredient is required');
    if (!recipe.steps.length) errors.push('At least one step is required');
    recipe.steps.forEach((s, idx) => {
        const e = validateStep(s);
        if (e.length) errors.push(`Step ${idx + 1}: ${e.join(', ')}`);
    });
    return errors;
}
