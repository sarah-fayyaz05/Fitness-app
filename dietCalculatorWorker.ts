// Web Worker for Diet Plan Generation
// This handles heavy calculations in background thread to prevent UI freezing

interface Recipe {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  ingredients: string[];
  instructions: string[];
  image: string;
}

interface MealPlan {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snack: Recipe;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface CalorieDistribution {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  healthGoal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
}

interface WorkerMessage {
  type: 'GENERATE_DIET_PLAN';
  data: {
    dailyCalories: number;
    profile?: UserProfile;
  };
}

interface WorkerResponse {
  type: 'DIET_PLAN_GENERATED' | 'ERROR';
  data: MealPlan | { error: string };
}

// Fallback recipes if API fails
const fallbackRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Grilled Chicken Salad',
    category: 'lunch',
    calories: 320,
    protein: 35,
    carbs: 12,
    fat: 15,
    prepTime: 20,
    ingredients: ['200g chicken breast', '2 cups mixed greens', '1 cucumber, diced', '1 tomato, chopped', '1 tbsp olive oil', '1 tbsp lemon juice'],
    instructions: ['Season chicken breast with salt and pepper', 'Grill chicken for 6-8 minutes per side until cooked through', 'Let chicken rest for 5 minutes, then slice', 'Combine mixed greens, cucumber, and tomato in a bowl', 'Whisk olive oil and lemon juice together', 'Top salad with sliced chicken and dressing'],
    image: '/assets/Grilled.jpg'
  },
  {
    id: 2,
    name: 'Overnight Oats',
    category: 'breakfast',
    calories: 280,
    protein: 12,
    carbs: 45,
    fat: 8,
    prepTime: 5,
    ingredients: ['1/2 cup rolled oats', '1/2 cup milk of choice', '1 tbsp chia seeds', '1 tbsp honey', '1/4 cup berries', '1 tbsp almond butter'],
    instructions: ['Combine oats, milk, chia seeds, and honey in a jar', 'Stir well to combine', 'Refrigerate overnight', 'Top with berries and almond butter before serving'],
    image: '/assets/overnight.jpg'
  },
  {
    id: 3,
    name: 'Baked Salmon with Vegetables',
    category: 'dinner',
    calories: 420,
    protein: 40,
    carbs: 20,
    fat: 22,
    prepTime: 30,
    ingredients: ['200g salmon fillet', '1 cup broccoli florets', '1 bell pepper, sliced', '1 zucchini, sliced', '2 tbsp olive oil', '1 lemon, sliced'],
    instructions: ['Preheat oven to 400°F (200°C)', 'Place salmon and vegetables on a baking sheet', 'Drizzle with olive oil and season', 'Top salmon with lemon slices', 'Bake for 20-25 minutes until salmon flakes easily'],
    image: '/assets/baked.jpg'
  },
  {
    id: 4,
    name: 'Greek Yogurt Parfait',
    category: 'snack',
    calories: 180,
    protein: 15,
    carbs: 25,
    fat: 4,
    prepTime: 5,
    ingredients: ['1 cup Greek yogurt', '1/4 cup granola', '1/2 cup mixed berries', '1 tbsp honey', '1 tbsp chopped nuts'],
    instructions: ['Layer half the yogurt in a glass', 'Add half the berries and granola', 'Repeat layers', 'Top with honey and nuts'],
    image: '/assets/greek.jpg'
  }
];

// Fetch recipes from API
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch('http://localhost:3001/api/recipes');
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    const data = await response.json();
    return data.recipes.map((recipe: any) => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
      instructions: JSON.parse(recipe.instructions)
    })) as Recipe[];
  } catch (error) {
    console.warn('API fetch failed, using fallback recipes:', error);
    return fallbackRecipes;
  }
}

// Calculate calorie distribution
function calculateDistribution(dailyCalories: number): CalorieDistribution {
  return {
    breakfast: Math.round(dailyCalories * 0.25), // 25%
    lunch: Math.round(dailyCalories * 0.35),     // 35%
    dinner: Math.round(dailyCalories * 0.30),    // 30%
    snack: Math.round(dailyCalories * 0.10),     // 10%
  };
}

// Find best recipe match for target calories
function findBestMatch(recipeList: Recipe[], targetCalories: number): Recipe {
  if (recipeList.length === 0) {
    // Fallback recipe if no recipes in category
    return {
      id: 0,
      name: 'Custom Meal',
      category: 'custom',
      calories: targetCalories,
      protein: Math.round(targetCalories * 0.15 / 4), // 15% protein
      carbs: Math.round(targetCalories * 0.50 / 4),   // 50% carbs
      fat: Math.round(targetCalories * 0.35 / 9),     // 35% fat
      prepTime: 15,
      ingredients: ['Custom ingredients based on your preferences'],
      instructions: ['Prepare according to your dietary needs'],
      image: '/api/placeholder/300/200'
    };
  }

  // Find recipe closest to target calories
  return recipeList.reduce((best, current) => {
    const bestDiff = Math.abs(best.calories - targetCalories);
    const currentDiff = Math.abs(current.calories - targetCalories);
    return currentDiff < bestDiff ? current : best;
  });
}

// Generate diet plan
async function generateDietPlan(dailyCalories: number, profile?: UserProfile): Promise<MealPlan> {
  try {
    // Fetch recipes (this is I/O bound, but in worker it won't block UI)
    const recipes = await fetchRecipes();

    // Calculate distribution (CPU intensive)
    const distribution = calculateDistribution(dailyCalories);

    // Filter recipes by category (CPU intensive filtering)
    const breakfastRecipes = recipes.filter(r => r.category === 'breakfast');
    const lunchRecipes = recipes.filter(r => r.category === 'lunch');
    const dinnerRecipes = recipes.filter(r => r.category === 'dinner');
    const snackRecipes = recipes.filter(r => r.category === 'snack');

    // Select meals (CPU intensive matching algorithm)
    const breakfast = findBestMatch(breakfastRecipes, distribution.breakfast);
    const lunch = findBestMatch(lunchRecipes, distribution.lunch);
    const dinner = findBestMatch(dinnerRecipes, distribution.dinner);
    const snack = findBestMatch(snackRecipes, distribution.snack);

    // Calculate totals (CPU intensive aggregation)
    const totalCalories = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein;
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs;
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat;

    return {
      breakfast,
      lunch,
      dinner,
      snack,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  } catch (error) {
    console.error('Error in worker diet plan generation:', error);
    throw error;
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'GENERATE_DIET_PLAN':
        const mealPlan = await generateDietPlan(data.dailyCalories, data.profile);
        const response: WorkerResponse = {
          type: 'DIET_PLAN_GENERATED',
          data: mealPlan
        };
        self.postMessage(response);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorResponse: WorkerResponse = {
      type: 'ERROR',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
    self.postMessage(errorResponse);
  }
};

// Export types for TypeScript (not actually used in worker)
export type { Recipe, MealPlan, CalorieDistribution, UserProfile, WorkerMessage, WorkerResponse };
