import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/ui/Navbar";
import RecipeCard from "@/components/ui/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

import { Search, Filter, Clock, Users } from "lucide-react";
import Swal from 'sweetalert2';

// ✅ Images
import grilledImg from "@/assest/Grilled.jpg";
import overnightImg from "@/assest/overnight.jpg";
import bakedImg from "@/assest/baked.jpg";
import greekImg from "@/assest/greek.jpg";
import quinoaImg from "@/assest/Quinoa.jpg";
import proteinImg from "@/assest/protien.jpg";
import pastaImg from "@/assest/pasta.jpg";
import seekhKababImg from "@/assest/seekh_kabab.jpg";

// ✅ Type
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

// ✅ Map recipe.image to actual imports
const imageMap: { [key: string]: string } = {
  "/src/assest/Grilled.jpg": grilledImg,
  "/src/assest/overnight.jpg": overnightImg,
  "/src/assest/baked.jpg": bakedImg,
  "/src/assest/greek.jpg": greekImg,
  "/src/assest/Quinoa.jpg": quinoaImg,
  "/src/assest/protien.jpg": proteinImg,
  "/src/assest/pasta.jpg": pastaImg,
  "/src/assest/seekh kabab.jpg": seekhKababImg,
};



// ✅ Main Page
const Recipes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [calorieFilter, setCalorieFilter] = useState<string>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    console.log('Fetching recipes from API...');
    fetch('http://localhost:3001/api/recipes')
      .then(res => {
        console.log('API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Raw API data:', data);
        console.log('Number of recipes received:', data.recipes ? data.recipes.length : 0);
        if (data.recipes && data.recipes.length > 0) {
          const parsedRecipes = data.recipes.map((recipe: any) => ({
            ...recipe,
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : JSON.parse(recipe.ingredients || '[]'),
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions : JSON.parse(recipe.instructions || '[]')
          }));
          console.log('Parsed recipes:', parsedRecipes);
          setRecipes(parsedRecipes);
          setFilteredRecipes(parsedRecipes);
        } else {
          console.log('No recipes in response');
          // Fallback to local data if API fails
          console.log('Falling back to local recipes data...');
          const localRecipes = [
            {
              id: 1,
              name: "Grilled Chicken Salad",
              category: "lunch",
              calories: 320,
              protein: 35,
              carbs: 12,
              fat: 15,
              prepTime: 20,
              ingredients: ["200g chicken breast", "2 cups mixed greens", "1 cucumber, diced", "1 tomato, chopped", "1 tbsp olive oil", "1 tbsp lemon juice", "Salt and pepper to taste"],
              instructions: ["Season chicken breast with salt and pepper", "Grill chicken for 6-8 minutes per side until cooked through", "Let chicken rest for 5 minutes, then slice", "Combine mixed greens, cucumber, and tomato in a bowl", "Whisk olive oil and lemon juice together", "Top salad with sliced chicken and dressing"],
              image: "/src/assest/Grilled.jpg"
            },
            {
              id: 2,
              name: "Overnight Oats",
              category: "breakfast",
              calories: 280,
              protein: 12,
              carbs: 45,
              fat: 8,
              prepTime: 5,
              ingredients: ["1/2 cup rolled oats", "1/2 cup milk of choice", "1 tbsp chia seeds", "1 tbsp honey", "1/4 cup berries", "1 tbsp almond butter"],
              instructions: ["Combine oats, milk, chia seeds, and honey in a jar", "Stir well to combine", "Refrigerate overnight", "Top with berries and almond butter before serving"],
              image: "/src/assest/overnight.jpg"
            },
            {
              id: 3,
              name: "Baked Salmon with Vegetables",
              category: "dinner",
              calories: 420,
              protein: 40,
              carbs: 20,
              fat: 22,
              prepTime: 30,
              ingredients: ["200g salmon fillet", "1 cup broccoli florets", "1 bell pepper, sliced", "1 zucchini, sliced", "2 tbsp olive oil", "1 lemon, sliced", "Herbs and spices"],
              instructions: ["Preheat oven to 400°F (200°C)", "Place salmon and vegetables on a baking sheet", "Drizzle with olive oil and season", "Top salmon with lemon slices", "Bake for 20-25 minutes until salmon flakes easily"],
              image: "/src/assest/baked.jpg"
            },
            {
              id: 4,
              name: "Greek Yogurt Parfait",
              category: "snack",
              calories: 180,
              protein: 15,
              carbs: 25,
              fat: 4,
              prepTime: 5,
              ingredients: ["1 cup Greek yogurt", "1/4 cup granola", "1/2 cup mixed berries", "1 tbsp honey", "1 tbsp chopped nuts"],
              instructions: ["Layer half the yogurt in a glass", "Add half the berries and granola", "Repeat layers", "Top with honey and nuts"],
              image: "/src/assest/greek.jpg"
            },
            {
              id: 5,
              name: "Quinoa Buddha Bowl",
              category: "lunch",
              calories: 380,
              protein: 18,
              carbs: 52,
              fat: 12,
              prepTime: 25,
              ingredients: ["1 cup cooked quinoa", "1/2 avocado, sliced", "1/2 cup chickpeas", "1 cup spinach", "1/4 cup shredded carrots", "2 tbsp tahini dressing"],
              instructions: ["Cook quinoa according to package instructions", "Arrange quinoa in a bowl", "Top with spinach, chickpeas, carrots, and avocado", "Drizzle with tahini dressing"],
              image: "/src/assest/Quinoa.jpg"
            },
            {
              id: 6,
              name: "Protein Smoothie",
              category: "breakfast",
              calories: 250,
              protein: 25,
              carbs: 30,
              fat: 6,
              prepTime: 5,
              ingredients: ["1 scoop protein powder", "1 banana", "1 cup spinach", "1 cup almond milk", "1 tbsp almond butter", "Ice cubes"],
              instructions: ["Add all ingredients to a blender", "Blend until smooth", "Add ice for desired consistency", "Pour into a glass and enjoy"],
              image: "/src/assest/protien.jpg"
            },
            {
              id: 7,
              name: "Creamy Pasta Alfredo",
              category: "dinner",
              calories: 450,
              protein: 18,
              carbs: 55,
              fat: 20,
              prepTime: 25,
              ingredients: ["200g fettuccine pasta", "1 cup heavy cream", "1/2 cup grated Parmesan cheese", "2 cloves garlic, minced", "2 tbsp butter", "Salt and pepper to taste", "Fresh parsley for garnish"],
              instructions: ["Cook pasta according to package instructions until al dente", "In a large pan, melt butter over medium heat", "Add minced garlic and sauté for 1 minute", "Pour in heavy cream and bring to a simmer", "Stir in Parmesan cheese until melted and smooth", "Season with salt and pepper", "Drain pasta and toss with sauce", "Garnish with fresh parsley before serving"],
              image: "/src/assest/pasta.jpg"
            },
            {
              id: 8,
              name: "Seekh Kebab",
              category: "dinner",
              calories: 280,
              protein: 25,
              carbs: 8,
              fat: 18,
              prepTime: 30,
              ingredients: ["500g ground beef or lamb", "1 onion, finely chopped", "2 cloves garlic, minced", "1 inch ginger, grated", "2 green chilies, finely chopped", "2 tbsp fresh coriander, chopped", "1 tbsp garam masala", "1 tsp red chili powder", "Salt to taste", "2 tbsp oil for grilling"],
              instructions: ["In a large bowl, mix ground meat with all ingredients except oil", "Mix thoroughly and let marinate for 15 minutes", "Divide mixture into 8 equal portions", "Shape each portion into long sausages around skewers", "Preheat grill or oven to 400°F (200°C)", "Brush kebabs with oil", "Grill for 15-20 minutes, turning occasionally until cooked through", "Serve hot with mint chutney and lemon wedges"],
              image: "/src/assest/seekh kabab.jpg"
            }
          ];
          setRecipes(localRecipes);
          setFilteredRecipes(localRecipes);
        }
      })
      .catch(err => {
        console.error('Error fetching recipes:', err);
        // Fallback to local data if API fails
        console.log('API failed, using local fallback data...');
        const localRecipes = [
          {
            id: 1,
            name: "Grilled Chicken Salad",
            category: "lunch",
            calories: 320,
            protein: 35,
            carbs: 12,
            fat: 15,
            prepTime: 20,
            ingredients: ["200g chicken breast", "2 cups mixed greens", "1 cucumber, diced", "1 tomato, chopped", "1 tbsp olive oil", "1 tbsp lemon juice", "Salt and pepper to taste"],
            instructions: ["Season chicken breast with salt and pepper", "Grill chicken for 6-8 minutes per side until cooked through", "Let chicken rest for 5 minutes, then slice", "Combine mixed greens, cucumber, and tomato in a bowl", "Whisk olive oil and lemon juice together", "Top salad with sliced chicken and dressing"],
            image: "/src/assest/Grilled.jpg"
          },
          {
            id: 2,
            name: "Overnight Oats",
            category: "breakfast",
            calories: 280,
            protein: 12,
            carbs: 45,
            fat: 8,
            prepTime: 5,
            ingredients: ["1/2 cup rolled oats", "1/2 cup milk of choice", "1 tbsp chia seeds", "1 tbsp honey", "1/4 cup berries", "1 tbsp almond butter"],
            instructions: ["Combine oats, milk, chia seeds, and honey in a jar", "Stir well to combine", "Refrigerate overnight", "Top with berries and almond butter before serving"],
            image: "/src/assest/overnight.jpg"
          },
          {
            id: 3,
            name: "Baked Salmon with Vegetables",
            category: "dinner",
            calories: 420,
            protein: 40,
            carbs: 20,
            fat: 22,
            prepTime: 30,
            ingredients: ["200g salmon fillet", "1 cup broccoli florets", "1 bell pepper, sliced", "1 zucchini, sliced", "2 tbsp olive oil", "1 lemon, sliced", "Herbs and spices"],
            instructions: ["Preheat oven to 400°F (200°C)", "Place salmon and vegetables on a baking sheet", "Drizzle with olive oil and season", "Top salmon with lemon slices", "Bake for 20-25 minutes until salmon flakes easily"],
            image: "/src/assest/baked.jpg"
          },
          {
            id: 4,
            name: "Greek Yogurt Parfait",
            category: "snack",
            calories: 180,
            protein: 15,
            carbs: 25,
            fat: 4,
            prepTime: 5,
            ingredients: ["1 cup Greek yogurt", "1/4 cup granola", "1/2 cup mixed berries", "1 tbsp honey", "1 tbsp chopped nuts"],
            instructions: ["Layer half the yogurt in a glass", "Add half the berries and granola", "Repeat layers", "Top with honey and nuts"],
            image: "/src/assest/greek.jpg"
          },
          {
            id: 5,
            name: "Quinoa Buddha Bowl",
            category: "lunch",
            calories: 380,
            protein: 18,
            carbs: 52,
            fat: 12,
            prepTime: 25,
            ingredients: ["1 cup cooked quinoa", "1/2 avocado, sliced", "1/2 cup chickpeas", "1 cup spinach", "1/4 cup shredded carrots", "2 tbsp tahini dressing"],
            instructions: ["Cook quinoa according to package instructions", "Arrange quinoa in a bowl", "Top with spinach, chickpeas, carrots, and avocado", "Drizzle with tahini dressing"],
            image: "/src/assest/Quinoa.jpg"
          },
          {
            id: 6,
            name: "Protein Smoothie",
            category: "breakfast",
            calories: 250,
            protein: 25,
            carbs: 30,
            fat: 6,
            prepTime: 5,
            ingredients: ["1 scoop protein powder", "1 banana", "1 cup spinach", "1 cup almond milk", "1 tbsp almond butter", "Ice cubes"],
            instructions: ["Add all ingredients to a blender", "Blend until smooth", "Add ice for desired consistency", "Pour into a glass and enjoy"],
            image: "/src/assest/protien.jpg"
          },
          {
            id: 7,
            name: "Creamy Pasta Alfredo",
            category: "dinner",
            calories: 450,
            protein: 18,
            carbs: 55,
            fat: 20,
            prepTime: 25,
            ingredients: ["200g fettuccine pasta", "1 cup heavy cream", "1/2 cup grated Parmesan cheese", "2 cloves garlic, minced", "2 tbsp butter", "Salt and pepper to taste", "Fresh parsley for garnish"],
            instructions: ["Cook pasta according to package instructions until al dente", "In a large pan, melt butter over medium heat", "Add minced garlic and sauté for 1 minute", "Pour in heavy cream and bring to a simmer", "Stir in Parmesan cheese until melted and smooth", "Season with salt and pepper", "Drain pasta and toss with sauce", "Garnish with fresh parsley before serving"],
            image: "/src/assest/pasta.jpg"
          },
          {
            id: 8,
            name: "Seekh Kebab",
            category: "dinner",
            calories: 280,
            protein: 25,
            carbs: 8,
            fat: 18,
            prepTime: 30,
            ingredients: ["500g ground beef or lamb", "1 onion, finely chopped", "2 cloves garlic, minced", "1 inch ginger, grated", "2 green chilies, finely chopped", "2 tbsp fresh coriander, chopped", "1 tbsp garam masala", "1 tsp red chili powder", "Salt to taste", "2 tbsp oil for grilling"],
            instructions: ["In a large bowl, mix ground meat with all ingredients except oil", "Mix thoroughly and let marinate for 15 minutes", "Divide mixture into 8 equal portions", "Shape each portion into long sausages around skewers", "Preheat grill or oven to 400°F (200°C)", "Brush kebabs with oil", "Grill for 15-20 minutes, turning occasionally until cooked through", "Serve hot with mint chutney and lemon wedges"],
            image: "/src/assest/seekh kabab.jpg"
          }
        ];
        setRecipes(localRecipes);
        setFilteredRecipes(localRecipes);
      });
  }, []);

  // ✅ Filters
  useEffect(() => {
    let filtered = recipes;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      // Track search history if user is logged in
      if (user && searchQuery.trim()) {
        console.log('Logging search history:', { userId: user.id, searchQuery: searchQuery.trim() });
        fetch('http://localhost:3001/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parseInt(user.id), searchQuery: searchQuery.trim() }),
        }).then(response => {
          console.log('Search history response:', response.status);
          return response.json();
        }).then(data => {
          console.log('Search history data:', data);
        }).catch(err => console.error('Error logging search:', err));
      }
    }

    // Category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((recipe) => recipe.category === categoryFilter);
    }

    // Calories
    if (calorieFilter !== "all") {
      switch (calorieFilter) {
        case "low":
          filtered = filtered.filter((recipe) => recipe.calories < 300);
          break;
        case "medium":
          filtered = filtered.filter(
            (recipe) => recipe.calories >= 300 && recipe.calories <= 500
          );
          break;
        case "high":
          filtered = filtered.filter((recipe) => recipe.calories > 500);
          break;
      }
    }

    setFilteredRecipes(filtered);

    // Auto-expand if search finds exactly one recipe
    if (searchQuery && filtered.length === 1) {
      setSelectedRecipe(filtered[0]);
    } else if (filtered.length !== 1) {
      setSelectedRecipe(null);
    }
  }, [searchQuery, categoryFilter, calorieFilter, recipes, user]);

  // Options
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snacks" },
  ];

  const calorieRanges = [
    { value: "all", label: "All Calories" },
    { value: "low", label: "Under 300 cal" },
    { value: "medium", label: "300-500 cal" },
    { value: "high", label: "Over 500 cal" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={(query: string) => setSearchQuery(query)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Recipe Collection</h1>
          <p className="text-gray-600">
            Discover healthy and delicious recipes with detailed nutritional information
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search recipes or ingredients..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!user) {
                      Swal.fire({
                        title: 'Login Required',
                        text: 'Please login first to search recipes.',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                      });
                      return;
                    }
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Calories */}
              <Select value={calorieFilter} onValueChange={setCalorieFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calorieRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                isExpanded={selectedRecipe?.id === recipe.id}
                onClose={() => setSelectedRecipe(null)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setCalorieFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
};

export default Recipes;
