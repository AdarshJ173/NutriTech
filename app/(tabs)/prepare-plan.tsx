import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface UserProfile {
  name: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  bmi: string;
  location: string;
}

interface MealPlan {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  mealPlan: {
    breakfast: [MealOption, MealOption];
    lunch: [MealOption, MealOption];
    dinner: [MealOption, MealOption];
    snacks: [MealOption, MealOption];
  };
  localConsiderations: string;
  dietaryRecommendations: string;
}

interface MealOption {
  name: string;
  ingredients: string[];
  preparation: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
}

interface MealPlanStorage {
  breakfast: MealOption | null;
  lunch: MealOption | null;
  dinner: MealOption | null;
  snacks: MealOption | null;
}

export default function PreparePlanScreen() {
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [currentDiet, setCurrentDiet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const generateMealPlan = async (retryAttempt: number = 0) => {
    if (!userProfile) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    if (!dietaryPreferences.trim() || !currentDiet.trim()) {
      Alert.alert('Error', 'Please fill in both dietary preferences and current diet information');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyA5ofUIdJnHEOuZWeFw6An5b9alGZdHzOE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You must respond with ONLY valid JSON and no other text. Generate a personalized meal plan with EXACTLY TWO OPTIONS for each meal category based on the following information:

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Sex: ${userProfile.sex}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- BMI: ${userProfile.bmi}
- Location: ${userProfile.location}

Dietary Preferences: ${dietaryPreferences}
Current Diet: ${currentDiet}

Based on exactly what the user has input in the Dietary Preferences and Current Diet fields, create a personalized meal plan. Do not hallucinate or make assumptions beyond what the user has explicitly stated.

The response must be ONLY the following JSON structure with no additional text or explanations:
{
  "dailyCalorieTarget": 2000,
  "dailyProteinTarget": 150,
  "dailyCarbTarget": 200,
  "dailyFatTarget": 70,
  "mealPlan": {
    "breakfast": [
      {
        "name": "Healthy Breakfast Option 1",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 500,
          "protein": 30,
          "carbs": 45,
          "fat": 20
        }
      },
      {
        "name": "Healthy Breakfast Option 2",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 500,
          "protein": 30,
          "carbs": 45,
          "fat": 20
        }
      }
    ],
    "lunch": [
      {
        "name": "Healthy Lunch Option 1",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 600,
          "protein": 40,
          "carbs": 50,
          "fat": 25
        }
      },
      {
        "name": "Healthy Lunch Option 2",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 600,
          "protein": 40,
          "carbs": 50,
          "fat": 25
        }
      }
    ],
    "dinner": [
      {
        "name": "Healthy Dinner Option 1",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 500,
          "protein": 35,
          "carbs": 40,
          "fat": 20
        }
      },
      {
        "name": "Healthy Dinner Option 2",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 500,
          "protein": 35,
          "carbs": 40,
          "fat": 20
        }
      }
    ],
    "snacks": [
      {
        "name": "Healthy Snack Option 1",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 200,
          "protein": 10,
          "carbs": 25,
          "fat": 8
        }
      },
      {
        "name": "Healthy Snack Option 2",
        "ingredients": ["ingredient1", "ingredient2"],
        "preparation": "Step by step instructions",
        "nutritionalInfo": {
          "calories": 200,
          "protein": 10,
          "carbs": 25,
          "fat": 8
        }
      }
    ]
  },
  "localConsiderations": "Consider local food availability and preferences based on user's location",
  "dietaryRecommendations": "Personalized recommendations based on profile, BMI, and stated preferences"
}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      try {
        const planText = data.candidates[0].content.parts[0].text;
        
        // Clean the response text
        const cleanedText = planText
          .trim()
          // Remove any markdown code blocks
          .replace(/```json\n?|\n?```/g, '')
          // Remove any additional whitespace or newlines at start/end
          .trim()
          // Remove any non-JSON text before or after the JSON structure
          .replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1');

        // Validate JSON structure before parsing
        if (!cleanedText.startsWith('{') || !cleanedText.endsWith('}')) {
          throw new Error('Invalid JSON structure');
        }

        const planJson = JSON.parse(cleanedText);
        
        // Validate required fields
        if (!planJson.dailyCalorieTarget || !planJson.mealPlan || 
            !planJson.mealPlan.breakfast || !planJson.mealPlan.lunch || 
            !planJson.mealPlan.dinner || !planJson.mealPlan.snacks ||
            !Array.isArray(planJson.mealPlan.breakfast) || planJson.mealPlan.breakfast.length !== 2 ||
            !Array.isArray(planJson.mealPlan.lunch) || planJson.mealPlan.lunch.length !== 2 ||
            !Array.isArray(planJson.mealPlan.dinner) || planJson.mealPlan.dinner.length !== 2 ||
            !Array.isArray(planJson.mealPlan.snacks) || planJson.mealPlan.snacks.length !== 2) {
          throw new Error('Invalid meal plan structure');
        }

        setGeneratedPlan(planJson);
        
        // Save the generated plan
        await AsyncStorage.setItem('lastGeneratedMealPlan', JSON.stringify(planJson));
        
      } catch (parseError) {
        console.error('Error parsing meal plan:', parseError);
        
        // Attempt to recover from parsing error by making another request
        if (retryAttempt < 2) {
          setIsLoading(false);
          return generateMealPlan(retryAttempt + 1);
        }
        
        // If we've already retried twice, show a user-friendly error and use fallback plan
        Alert.alert(
          'Notice',
          'We encountered an issue generating your meal plan. We are generating a basic plan instead.',
          [{ text: 'OK' }]
        );

        // Create a properly typed fallback plan
        const fallbackPlan: MealPlan = {
          dailyCalorieTarget: 2000,
          dailyProteinTarget: 150,
          dailyCarbTarget: 200,
          dailyFatTarget: 70,
          mealPlan: {
            breakfast: [
              {
                name: "Healthy Oatmeal Bowl",
                ingredients: ["Oats", "Milk", "Honey", "Fruits"],
                preparation: "Cook oats with milk, add honey and fruits",
                nutritionalInfo: { calories: 500, protein: 30, carbs: 45, fat: 20 }
              } as MealOption,
              {
                name: "Toast with Eggs",
                ingredients: ["Bread", "Eggs", "Butter", "Salt"],
                preparation: "Toast bread, scramble eggs, serve together",
                nutritionalInfo: { calories: 500, protein: 30, carbs: 45, fat: 20 }
              } as MealOption
            ] as [MealOption, MealOption],
            lunch: [
              {
                name: "Rice and Curry",
                ingredients: ["Rice", "Vegetables", "Spices", "Oil"],
                preparation: "Cook rice, prepare curry with vegetables",
                nutritionalInfo: { calories: 600, protein: 40, carbs: 50, fat: 25 }
              } as MealOption,
              {
                name: "Sandwich",
                ingredients: ["Bread", "Vegetables", "Cheese", "Sauce"],
                preparation: "Layer ingredients between bread slices",
                nutritionalInfo: { calories: 600, protein: 40, carbs: 50, fat: 25 }
              } as MealOption
            ] as [MealOption, MealOption],
            dinner: [
              {
                name: "Grilled Chicken",
                ingredients: ["Chicken", "Spices", "Oil", "Vegetables"],
                preparation: "Marinate chicken, grill with vegetables",
                nutritionalInfo: { calories: 500, protein: 35, carbs: 40, fat: 20 }
              } as MealOption,
              {
                name: "Fish Curry",
                ingredients: ["Fish", "Spices", "Oil", "Vegetables"],
                preparation: "Cook fish with spices and vegetables",
                nutritionalInfo: { calories: 500, protein: 35, carbs: 40, fat: 20 }
              } as MealOption
            ] as [MealOption, MealOption],
            snacks: [
              {
                name: "Fruit Bowl",
                ingredients: ["Mixed Fruits", "Honey", "Nuts"],
                preparation: "Mix cut fruits with honey and nuts",
                nutritionalInfo: { calories: 200, protein: 10, carbs: 25, fat: 8 }
              } as MealOption,
              {
                name: "Yogurt Parfait",
                ingredients: ["Yogurt", "Granola", "Honey", "Fruits"],
                preparation: "Layer yogurt with fruits and granola",
                nutritionalInfo: { calories: 200, protein: 10, carbs: 25, fat: 8 }
              } as MealOption
            ] as [MealOption, MealOption]
          },
          localConsiderations: "Basic plan considering common ingredients",
          dietaryRecommendations: "General healthy eating guidelines"
        };
        
        setGeneratedPlan(fallbackPlan);
        await AsyncStorage.setItem('lastGeneratedMealPlan', JSON.stringify(fallbackPlan));
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // Show user-friendly error message
      Alert.alert(
        'Notice',
        'We encountered a temporary issue. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMealSection = (title: string, meals: MealOption[]) => {
    const handleAddMeal = async (meal: MealOption, mealType: string) => {
      try {
        // Get current meal plan
        const currentPlanStr = await AsyncStorage.getItem('currentMealPlan');
        let currentPlan: MealPlanStorage = currentPlanStr 
          ? JSON.parse(currentPlanStr)
          : { breakfast: null, lunch: null, dinner: null, snacks: null };

        // Update the specific meal type
        const type = mealType.toLowerCase();
        switch (type) {
          case 'breakfast options':
          case 'breakfast':
            currentPlan.breakfast = meal;
            break;
          case 'lunch options':
          case 'lunch':
            currentPlan.lunch = meal;
            break;
          case 'dinner options':
          case 'dinner':
            currentPlan.dinner = meal;
            break;
          case 'snack options':
          case 'snacks':
            currentPlan.snacks = meal;
            break;
        }

        // Save updated plan
        await AsyncStorage.setItem('currentMealPlan', JSON.stringify(currentPlan));
        
        // Show success alert with navigation options
        Alert.alert(
          'Success',
          `Added ${meal.name} to your ${mealType.replace(' Options', '')} plan`,
          [
            {
              text: 'View Meal Plan',
              onPress: () => {
                router.push('/meal-plan');
              }
            },
            { text: 'OK' }
          ]
        );
      } catch (error) {
        console.error('Error saving meal:', error);
        Alert.alert('Error', 'Failed to add meal to plan');
      }
    };

    return (
      <View style={styles.mealSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {meals.map((meal, index) => (
          <Animated.View 
            key={index} 
            entering={FadeInDown.delay(index * 100)}
            style={styles.mealCard}
          >
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealSubtitle}>Ingredients:</Text>
            {meal.ingredients.map((ingredient, idx) => (
              <Text key={idx} style={styles.ingredient}>• {ingredient}</Text>
            ))}
            <Text style={styles.mealSubtitle}>Preparation:</Text>
            <Text style={styles.preparation}>{meal.preparation}</Text>
            <View style={styles.nutritionInfo}>
              <Text style={styles.nutritionTitle}>Nutritional Information:</Text>
              <Text style={styles.nutritionText}>Calories: {meal.nutritionalInfo.calories}</Text>
              <Text style={styles.nutritionText}>Protein: {meal.nutritionalInfo.protein}g</Text>
              <Text style={styles.nutritionText}>Carbs: {meal.nutritionalInfo.carbs}g</Text>
              <Text style={styles.nutritionText}>Fat: {meal.nutritionalInfo.fat}g</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddMeal(meal, title)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add to Meal Plan</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prepare Meal Plan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.inputSection}>
          <Text style={styles.label}>Dietary Preferences</Text>
          <TextInput
            style={styles.input}
            value={dietaryPreferences}
            onChangeText={setDietaryPreferences}
            placeholder="Enter any dietary preferences or restrictions"
            multiline
          />

          <Text style={styles.label}>Current Diet</Text>
          <TextInput
            style={styles.input}
            value={currentDiet}
            onChangeText={setCurrentDiet}
            placeholder="Describe your current eating habits"
            multiline
          />

          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateMealPlan()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={24} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {generatedPlan && (
          <Animated.View entering={FadeInUp} style={styles.planContainer}>
            <View style={styles.targetSection}>
              <Text style={styles.targetTitle}>Daily Nutritional Targets</Text>
              <View style={styles.targetsGrid}>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{generatedPlan.dailyCalorieTarget}</Text>
                  <Text style={styles.targetLabel}>Calories</Text>
                </View>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{generatedPlan.dailyProteinTarget}g</Text>
                  <Text style={styles.targetLabel}>Protein</Text>
                </View>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{generatedPlan.dailyCarbTarget}g</Text>
                  <Text style={styles.targetLabel}>Carbs</Text>
                </View>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{generatedPlan.dailyFatTarget}g</Text>
                  <Text style={styles.targetLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {renderMealSection('Breakfast Options', generatedPlan.mealPlan.breakfast)}
            {renderMealSection('Lunch Options', generatedPlan.mealPlan.lunch)}
            {renderMealSection('Dinner Options', generatedPlan.mealPlan.dinner)}
            {renderMealSection('Snack Options', generatedPlan.mealPlan.snacks)}

            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>Local Considerations</Text>
              <Text style={styles.recommendationsText}>{generatedPlan.localConsiderations}</Text>
              
              <Text style={styles.recommendationsTitle}>Dietary Recommendations</Text>
              <Text style={styles.recommendationsText}>{generatedPlan.dietaryRecommendations}</Text>
            </View>

            <TouchableOpacity
              style={styles.savePlanButton}
              onPress={() => router.push('/meal-plan')}
            >
              <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
              <Text style={styles.savePlanButtonText}>View in Meal Planner</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#58CC02',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  generateButton: {
    backgroundColor: '#58CC02',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  planContainer: {
    marginTop: 20,
  },
  targetSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  targetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  targetsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58CC02',
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mealSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mealSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredient: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
  preparation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 5,
  },
  nutritionInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recommendationsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  recommendationsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  savePlanButton: {
    backgroundColor: '#58CC02',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 100,
  },
  savePlanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#58CC02',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 