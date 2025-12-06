import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Utensils } from 'lucide-react';
import { getMacroPercentages, getHealthGoalRecommendations } from '@/utils/dietCalculator';
import { UserProfile } from '@/context/UserContext';

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

interface DietPlanProps {
  mealPlan: MealPlan;
  dailyCalories: number;
  profile?: UserProfile;
}

const DietPlan: React.FC<DietPlanProps> = ({ mealPlan, dailyCalories, profile }) => {
  const macroPercentages = getMacroPercentages(
    mealPlan.totalCalories,
    mealPlan.totalProtein,
    mealPlan.totalCarbs,
    mealPlan.totalFat
  );

  const recommendations = profile ? getHealthGoalRecommendations(profile.healthGoal) : null;

  const MealCard: React.FC<{ meal: Recipe; mealType: string }> = ({ meal, mealType }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg capitalize">{mealType}</CardTitle>
          <Badge variant="outline">{meal.calories} cal</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">{meal.name}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{meal.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            <span>{meal.ingredients.length} ingredients</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">{meal.protein}g</div>
            <div className="text-blue-600 text-xs">Protein</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">{meal.carbs}g</div>
            <div className="text-green-600 text-xs">Carbs</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-semibold text-purple-700">{meal.fat}g</div>
            <div className="text-purple-600 text-xs">Fat</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Ingredients:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {ingredient}
                </li>
              ))}
              {meal.ingredients.length > 3 && (
                <li className="text-xs text-gray-500">
                  +{meal.ingredients.length - 3} more ingredients
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Daily Nutrition Summary</CardTitle>
          <p className="text-gray-600">
            Target: {dailyCalories} calories | Actual: {mealPlan.totalCalories} calories
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{mealPlan.totalCalories}</div>
              <div className="text-orange-600 text-sm">Total Calories</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{mealPlan.totalProtein}g</div>
              <div className="text-blue-600 text-sm">Protein ({macroPercentages.protein}%)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{mealPlan.totalCarbs}g</div>
              <div className="text-green-600 text-sm">Carbs ({macroPercentages.carbs}%)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{mealPlan.totalFat}g</div>
              <div className="text-purple-600 text-sm">Fat ({macroPercentages.fat}%)</div>
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="space-y-3">
            <h3 className="font-semibold">Macronutrient Distribution</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>{macroPercentages.protein}%</span>
              </div>
              <Progress value={macroPercentages.protein} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Carbohydrates</span>
                <span>{macroPercentages.carbs}%</span>
              </div>
              <Progress value={macroPercentages.carbs} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Fat</span>
                <span>{macroPercentages.fat}%</span>
              </div>
              <Progress value={macroPercentages.fat} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MealCard meal={mealPlan.breakfast} mealType="breakfast" />
        <MealCard meal={mealPlan.lunch} mealType="lunch" />
        <MealCard meal={mealPlan.dinner} mealType="dinner" />
        <MealCard meal={mealPlan.snack} mealType="snack" />
      </div>

      {/* Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>{recommendations.title}</CardTitle>
            <p className="text-gray-600">{recommendations.description}</p>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">Tips for Success:</h4>
            <ul className="space-y-2">
              {recommendations.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DietPlan;