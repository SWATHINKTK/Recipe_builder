import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { Recipe } from '@/types/recipe';
import { loadRecipes, saveRecipes } from '@/utils/storage';
import { computeDerived } from '../utils';

export interface RecipesState {
  items: Recipe[];
}

const initialState: RecipesState = {
  items: loadRecipes()
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    addRecipe: {
      prepare: (recipe: Omit<Recipe, 'id' | 'totalTimeMinutes' | 'totalIngredients' | 'complexityScore'>) => {
        const withId = { ...recipe, id: nanoid() };
        return { payload: computeDerived(withId) };
      },
      reducer: (state, action: PayloadAction<Recipe>) => {
        state.items.push(action.payload);
        saveRecipes(state.items);
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const r = state.items.find((x) => x.id === action.payload);
      if (r) {
        r.favorite = !r.favorite;
        saveRecipes(state.items);
      }
    }
  }
});

export const { addRecipe, toggleFavorite } = recipesSlice.actions;
export default recipesSlice.reducer;


