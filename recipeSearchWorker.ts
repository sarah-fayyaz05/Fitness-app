// Web Worker for Recipe Search & Filtering
// This handles heavy search and filtering operations in background thread to prevent UI freezing

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

interface SearchFilters {
  category: string;
  maxCalories: string;
  maxPrepTime: string;
  minProtein: string;
  searchQuery: string;
}

interface WorkerMessage {
  type: 'SEARCH_RECIPES';
  data: {
    recipes: Recipe[];
    filters: SearchFilters;
  };
}

interface WorkerResponse {
  type: 'SEARCH_COMPLETED' | 'SEARCH_PROGRESS' | 'ERROR';
  data: Recipe[] | { progress: number; message: string } | { error: string };
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
    image: '/src/assest/Grilled.jpg'
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
    image: '/src/assest/overnight.jpg'
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
    image: '/src/assest/baked.jpg'
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
    image: '/src/assest/greek.jpg'
  },
  {
    id: 5,
    name: 'Quinoa Buddha Bowl',
    category: 'lunch',
    calories: 380,
    protein: 18,
    carbs: 55,
    fat: 12,
    prepTime: 25,
    ingredients: ['1/2 cup quinoa', '1 cup chickpeas', '1 avocado, sliced', '1 cup spinach', '1 carrot, shredded', '2 tbsp tahini', '1 tbsp lemon juice'],
    instructions: ['Cook quinoa according to package instructions', 'Drain and rinse chickpeas', 'Arrange all ingredients in a bowl', 'Mix tahini and lemon juice for dressing', 'Drizzle dressing over the bowl'],
    image: '/src/assest/Quinoa.jpg'
  },
  {
    id: 6,
    name: 'Protein Pancakes',
    category: 'breakfast',
    calories: 350,
    protein: 25,
    carbs: 35,
    fat: 10,
    prepTime: 15,
    ingredients: ['1 cup oat flour', '2 scoops protein powder', '1 banana, mashed', '1 cup almond milk', '1 tsp baking powder', '1 tbsp maple syrup'],
    instructions: ['Mix all dry ingredients in a bowl', 'Add wet ingredients and stir until combined', 'Heat a non-stick pan over medium heat', 'Pour batter to form pancakes', 'Cook for 2-3 minutes per side until golden'],
    image: '/src/assest/protien.jpg'
  },
  {
    id: 7,
    name: 'Whole Wheat Pasta Primavera',
    category: 'dinner',
    calories: 450,
    protein: 16,
    carbs: 70,
    fat: 14,
    prepTime: 35,
    ingredients: ['200g whole wheat pasta', '2 cups mixed vegetables', '2 tbsp olive oil', '3 garlic cloves, minced', '1/4 cup parmesan cheese', 'Fresh basil leaves'],
    instructions: ['Cook pasta according to package instructions', 'Heat olive oil in a pan and sauté garlic', 'Add vegetables and cook until tender', 'Toss cooked pasta with vegetables', 'Top with parmesan and fresh basil'],
    image: '/src/assest/pasta.jpg'
  },
  {
    id: 8,
    name: 'Seekh Kebabs',
    category: 'dinner',
    calories: 280,
    protein: 22,
    carbs: 8,
    fat: 18,
    prepTime: 45,
    ingredients: ['500g ground chicken', '1 onion, finely chopped', '2 garlic cloves, minced', '1 tbsp ginger paste', '2 tbsp coriander leaves', '1 tsp garam masala', 'Salt to taste'],
    instructions: ['Mix all ingredients in a bowl', 'Marinate for 30 minutes', 'Shape mixture onto skewers', 'Grill or bake at 400°F for 20-25 minutes', 'Serve with mint chutney'],
    image: '/src/assest/seekh_kabab.jpg'
  }
];

// Advanced search function with multiple criteria
function searchRecipes(recipes: Recipe[], filters: SearchFilters): Recipe[] {
  let filtered = [...recipes];

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 10, message: 'Initializing search...' }
  });

  // Apply search query (text search across name, ingredients, category)
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(query);
      const ingredientMatch = recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(query)
      );
      const categoryMatch = recipe.category.toLowerCase().includes(query);

      return nameMatch || ingredientMatch || categoryMatch;
    });
  }

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 30, message: 'Applied text search...' }
  });

  // Apply category filter
  if (filters.category !== 'all') {
    filtered = filtered.filter(recipe => recipe.category === filters.category);
  }

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 50, message: 'Filtered by category...' }
  });

  // Apply calorie filter
  if (filters.maxCalories) {
    const maxCal = parseInt(filters.maxCalories);
    if (!isNaN(maxCal)) {
      filtered = filtered.filter(recipe => recipe.calories <= maxCal);
    }
  }

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 65, message: 'Applied calorie filter...' }
  });

  // Apply prep time filter
  if (filters.maxPrepTime) {
    const maxTime = parseInt(filters.maxPrepTime);
    if (!isNaN(maxTime)) {
      filtered = filtered.filter(recipe => recipe.prepTime <= maxTime);
    }
  }

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 80, message: 'Applied prep time filter...' }
  });

  // Apply protein filter
  if (filters.minProtein) {
    const minProtein = parseInt(filters.minProtein);
    if (!isNaN(minProtein)) {
      filtered = filtered.filter(recipe => recipe.protein >= minProtein);
    }
  }

  // Send progress update
  self.postMessage({
    type: 'SEARCH_PROGRESS',
    data: { progress: 95, message: 'Applied protein filter...' }
  });

  // Sort results by relevance (recipes with more matches first)
  if (filters.searchQuery.trim()) {
    filtered.sort((a, b) => {
      const query = filters.searchQuery.toLowerCase();
      const aScore = calculateRelevanceScore(a, query);
      const bScore = calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  return filtered;
}

// Calculate relevance score for search results
function calculateRelevanceScore(recipe: Recipe, query: string): number {
  let score = 0;

  // Exact name match gets highest score
  if (recipe.name.toLowerCase().includes(query)) {
    score += 10;
  }

  // Category match
  if (recipe.category.toLowerCase().includes(query)) {
    score += 5;
  }

  // Ingredient matches
  recipe.ingredients.forEach(ingredient => {
    if (ingredient.toLowerCase().includes(query)) {
      score += 2;
    }
  });

  return score;
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'SEARCH_RECIPES':
        const results = searchRecipes(data.recipes, data.filters);
        const response: WorkerResponse = {
          type: 'SEARCH_COMPLETED',
          data: results
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
export type { Recipe, SearchFilters, WorkerMessage, WorkerResponse };
