"use client";

import React, { useState, useEffect } from "react";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface Ingredient {
  id: string;
  name: string;
  calories: number;
}

interface Meal {
  dishName: string;
  calories: number;
  ingredients: Ingredient[];
  showIngredients: boolean;
}

interface DayMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  descriptor: string;
}

interface WeekPlan {
  [key: string]: DayMeals;
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack"
};

const createEmptyMeal = (): Meal => ({
  dishName: "",
  calories: 0,
  ingredients: [],
  showIngredients: false
});

const createEmptyDay = (): DayMeals => ({
  breakfast: createEmptyMeal(),
  lunch: createEmptyMeal(),
  dinner: createEmptyMeal(),
  snack: createEmptyMeal(),
  descriptor: "No meals planned"
});

export default function DietPlan() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({
    sunday: createEmptyDay(),
    monday: createEmptyDay(),
    tuesday: createEmptyDay(),
    wednesday: createEmptyDay(),
    thursday: createEmptyDay(),
    friday: createEmptyDay(),
    saturday: createEmptyDay(),
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<string>("");
  const [viewingDay, setViewingDay] = useState<string>("");
  
  // Modal state for ingredient warning
  const [showModal, setShowModal] = useState(false);
  const [modalContext, setModalContext] = useState<{ day: string; mealType: MealType } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("dietPlan");
    if (saved) {
      try {
        setWeekPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved diet plan", e);
      }
    }

    // Determine current day
    const today = new Date().getDay(); // 0 = Sunday
    const todayName = DAYS[today];
    setCurrentDay(todayName);
    setViewingDay(todayName);
  }, []);

  // Save to localStorage whenever weekPlan changes
  useEffect(() => {
    if (Object.keys(weekPlan).length > 0) {
      localStorage.setItem("dietPlan", JSON.stringify(weekPlan));
    }
  }, [weekPlan]);

  const toggleEditMode = () => {
    if (isEditMode) {
      // Save when exiting edit mode
      setSelectedDay(null);
      setIsEditMode(false);
    } else {
      // Enter edit mode, auto-select current day
      setIsEditMode(true);
      setSelectedDay(currentDay);
    }
  };

  const handleDayClick = (day: string) => {
    if (isEditMode) {
      setSelectedDay(day);
    } else {
      setViewingDay(day);
    }
  };

  const updateMeal = (day: string, mealType: MealType, field: string, value: any) => {
    setWeekPlan((prev) => {
      const dayMeals = { ...prev[day] };
      const meal = { ...dayMeals[mealType] };
      
      if (field === "dishName") {
        meal.dishName = value;
      } else if (field === "calories") {
        meal.calories = value;
      }

      dayMeals[mealType] = meal;
      
      // Update descriptor
      const mealNames = MEAL_TYPES
        .map(mt => dayMeals[mt].dishName)
        .filter(name => name.trim() !== "");
      
      const descriptor = mealNames.length > 0
        ? mealNames.join(", ").substring(0, 40) + (mealNames.join(", ").length > 40 ? "..." : "")
        : "No meals planned";

      dayMeals.descriptor = descriptor;

      return {
        ...prev,
        [day]: dayMeals
      };
    });
  };

  const toggleIngredientDetails = (day: string, mealType: MealType) => {
    const meal = weekPlan[day][mealType];
    
    if (meal.showIngredients && meal.ingredients.length > 0) {
      // Show warning modal
      setModalContext({ day, mealType });
      setShowModal(true);
    } else {
      // Safe to toggle
      setWeekPlan((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: {
            ...prev[day][mealType],
            showIngredients: !prev[day][mealType].showIngredients
          }
        }
      }));
    }
  };

  const confirmCloseIngredients = () => {
    if (!modalContext) return;
    
    const { day, mealType } = modalContext;
    
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType as MealType]: {
          ...prev[day][mealType as MealType],
          showIngredients: false,
          ingredients: [],
          calories: 0
        }
      }
    }));
    
    setShowModal(false);
    setModalContext(null);
  };

  const cancelCloseIngredients = () => {
    setShowModal(false);
    setModalContext(null);
  };

  const addIngredient = (day: string, mealType: MealType) => {
    setWeekPlan((prev) => {
      const dayMeals = { ...prev[day] };
      const meal = { ...dayMeals[mealType] };
      
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: "",
        calories: 0
      };
      
      meal.ingredients = [...meal.ingredients, newIngredient];
      dayMeals[mealType] = meal;
      
      return {
        ...prev,
        [day]: dayMeals
      };
    });
  };

  const updateIngredient = (day: string, mealType: MealType, ingredientId: string, field: string, value: any) => {
    setWeekPlan((prev) => {
      const dayMeals = { ...prev[day] };
      const meal = { ...dayMeals[mealType] };
      
      meal.ingredients = meal.ingredients.map(ing => {
        if (ing.id === ingredientId) {
          return { ...ing, [field]: value };
        }
        return ing;
      });
      
      // Recalculate total calories
      meal.calories = meal.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
      
      dayMeals[mealType] = meal;
      
      return {
        ...prev,
        [day]: dayMeals
      };
    });
  };

  const removeIngredient = (day: string, mealType: MealType, ingredientId: string) => {
    setWeekPlan((prev) => {
      const dayMeals = { ...prev[day] };
      const meal = { ...dayMeals[mealType] };
      
      meal.ingredients = meal.ingredients.filter(ing => ing.id !== ingredientId);
      
      // Recalculate total calories
      meal.calories = meal.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
      
      dayMeals[mealType] = meal;
      
      return {
        ...prev,
        [day]: dayMeals
      };
    });
  };

  const getTotalCaloriesForDay = (day: string): number => {
    const dayMeals = weekPlan[day];
    return MEAL_TYPES.reduce((total, mealType) => {
      return total + (dayMeals[mealType].calories || 0);
    }, 0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Diet Plan</h1>
          <p className="text-sm opacity-70 mt-1">Plan and track your weekly meals</p>
        </div>
        <button
          onClick={toggleEditMode}
          className="px-4 py-2 rounded border hover:bg-white/5 transition-colors flex items-center gap-2"
          aria-label={isEditMode ? "Save and exit edit mode" : "Enter edit mode"}
        >
          {isEditMode ? (
            <>
              <span>💾</span> Save
            </>
          ) : (
            <>
              <span>✏️</span> Edit
            </>
          )}
        </button>
      </div>

      {/* Weekly Calendar */}
      <div className="mb-6 p-4 border rounded bg-white/5">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, index) => {
            const isToday = day === currentDay;
            const isSelected = day === selectedDay;
            const isViewing = day === viewingDay;
            const dayPlan = weekPlan[day];

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  p-3 rounded border transition-all cursor-pointer
                  ${isToday ? "border-cyan-400 bg-cyan-400/10" : "border-white/20"}
                  ${isSelected && isEditMode ? "border-yellow-400 bg-yellow-400/20" : ""}
                  ${isViewing && !isEditMode ? "border-green-400 bg-green-400/10" : ""}
                  hover:bg-white/10
                `}
              >
                <div className="font-semibold text-center mb-1">{DAY_LABELS[index]}</div>
                <div className="text-xs text-center opacity-70 break-words">
                  {dayPlan.descriptor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mode Instructions */}
      {isEditMode && !selectedDay && (
        <div className="mb-6 p-4 border rounded bg-yellow-400/5 border-yellow-400/30 text-center">
          <p className="opacity-70">👆 Click on a day above to edit meals</p>
        </div>
      )}

      {/* Edit Mode Panel */}
      {isEditMode && selectedDay && (
        <div className="mb-6 p-4 border rounded bg-yellow-400/5 border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold capitalize">
              Editing {selectedDay}
            </h3>
            <p className="text-sm opacity-60">Click another day to switch</p>
          </div>

          {/* Meal Inputs */}
          <div className="space-y-6">
            {MEAL_TYPES.map((mealType) => {
              const meal = weekPlan[selectedDay!][mealType];
              
              return (
                <div key={mealType} className="p-4 border rounded bg-white/5">
                  <h4 className="font-semibold mb-3 text-lg">{MEAL_LABELS[mealType]}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Dish Name</label>
                      <input
                        type="text"
                        value={meal.dishName}
                        onChange={(e) => updateMeal(selectedDay!, mealType, "dishName", e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border rounded"
                        placeholder={`e.g., Oatmeal with berries`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Calories</label>
                      <input
                        type="number"
                        value={meal.calories || ""}
                        onChange={(e) => updateMeal(selectedDay!, mealType, "calories", Number(e.target.value))}
                        disabled={meal.showIngredients}
                        className="w-full px-3 py-2 bg-white/5 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0"
                        min="0"
                      />
                      {meal.showIngredients && (
                        <p className="text-xs opacity-60 mt-1">
                          Calculated from ingredients: {meal.calories} cal
                        </p>
                      )}
                    </div>

                    {/* Ingredient Details Toggle */}
                    <div>
                      <button
                        onClick={() => toggleIngredientDetails(selectedDay!, mealType)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {meal.showIngredients ? "Close ingredient details" : "Add ingredient details"}
                      </button>
                    </div>

                    {/* Ingredient Details Section */}
                    {meal.showIngredients && (
                      <div className="mt-4 p-3 border border-cyan-400/30 rounded bg-cyan-400/5">
                        <h5 className="font-semibold mb-3 text-sm">Ingredients</h5>
                        
                        <div className="space-y-2 mb-3">
                          {meal.ingredients.map((ingredient) => (
                            <div key={ingredient.id} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={ingredient.name}
                                onChange={(e) => updateIngredient(selectedDay!, mealType, ingredient.id, "name", e.target.value)}
                                className="flex-1 px-2 py-1 bg-white/5 border rounded text-sm"
                                placeholder="Ingredient name"
                              />
                              <input
                                type="number"
                                value={ingredient.calories || ""}
                                onChange={(e) => updateIngredient(selectedDay!, mealType, ingredient.id, "calories", Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-white/5 border rounded text-sm"
                                placeholder="Cal"
                                min="0"
                              />
                              <button
                                onClick={() => removeIngredient(selectedDay!, mealType, ingredient.id)}
                                className="px-2 py-1 text-sm border border-red-400/50 rounded hover:bg-red-400/10"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addIngredient(selectedDay!, mealType)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          + Add Ingredient
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Total */}
          <div className="mt-4 p-3 bg-green-400/10 border border-green-400/30 rounded text-center">
            <div className="text-sm opacity-70">Total Daily Calories</div>
            <div className="text-2xl font-bold">{getTotalCaloriesForDay(selectedDay!)} cal</div>
          </div>
        </div>
      )}

      {/* View Mode - Show Selected Day's Meals */}
      {!isEditMode && viewingDay && weekPlan[viewingDay] && (
        <div className="p-6 border rounded bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold capitalize">
              {viewingDay} - {weekPlan[viewingDay].descriptor}
            </h2>
            {viewingDay === currentDay && (
              <span className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/40 rounded text-sm">
                Today
              </span>
            )}
          </div>

          <div className="space-y-4">
            {MEAL_TYPES.map((mealType) => {
              const meal = weekPlan[viewingDay][mealType];
              
              if (!meal.dishName) {
                return (
                  <div key={mealType} className="p-4 border rounded bg-white/5 opacity-50">
                    <h4 className="font-semibold mb-2">{MEAL_LABELS[mealType]}</h4>
                    <p className="text-sm opacity-70">No meal planned</p>
                  </div>
                );
              }

              return (
                <div key={mealType} className="p-4 border rounded bg-white/5">
                  <h4 className="font-semibold mb-2 text-lg">{MEAL_LABELS[mealType]}</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{meal.dishName}</p>
                      {meal.ingredients.length > 0 && (
                        <div className="mt-2 text-sm opacity-70">
                          <div className="font-semibold mb-1">Ingredients:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {meal.ingredients.map((ing) => (
                              <li key={ing.id}>
                                {ing.name} - {ing.calories} cal
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{meal.calories}</div>
                      <div className="text-xs opacity-70">calories</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Total */}
          <div className="mt-6 p-4 bg-green-400/10 border border-green-400/30 rounded text-center">
            <div className="text-sm opacity-70">Total Daily Calories</div>
            <div className="text-3xl font-bold text-green-400">{getTotalCaloriesForDay(viewingDay)} cal</div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-red-400/50 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-400">⚠️ Warning</h3>
            <p className="mb-6 opacity-90">
              Closing ingredient details will delete all ingredient information you've entered. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelCloseIngredients}
                className="px-4 py-2 border rounded hover:bg-white/5"
              >
                No, Keep Ingredients
              </button>
              <button
                onClick={confirmCloseIngredients}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete Ingredients
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
