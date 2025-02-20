import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  ViewStyle,
  TextStyle,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInUp, 
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Enhanced color system with semantic naming and WCAG compliance
const Colors = {
  light: {
    primary: '#2E7D32', // Adjusted for AA contrast
    primaryLight: '#E8F5E9',
    primaryDark: '#1B5E20',
    background: '#FFFFFF',
    surface: '#F5F7FA',
    text: '#1A1A1A',
    textSecondary: '#595959', // Adjusted for AA contrast
    textTertiary: '#757575', // Adjusted for AA contrast
    border: '#E0E0E0',
    success: '#2E7D32',
    successLight: 'rgba(46, 125, 50, 0.1)',
    card: '#FFFFFF',
    shadow: '#000000',
    focus: '#2196F3',
    error: '#D32F2F',
  },
  dark: {
    primary: '#81C784',
    primaryLight: '#1B5E20',
    primaryDark: '#A5D6A7',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#999999',
    border: '#2C2C2C',
    success: '#81C784',
    successLight: 'rgba(129, 199, 132, 0.1)',
    card: '#1E1E1E',
    shadow: '#000000',
    focus: '#64B5F6',
    error: '#EF5350',
  },
};

// Enhanced theme with responsive scaling
const createTheme = (windowWidth: number) => ({
  spacing: {
    xs: Math.max(4, windowWidth * 0.01),
    sm: Math.max(8, windowWidth * 0.02),
    md: Math.max(16, windowWidth * 0.04),
    lg: Math.max(24, windowWidth * 0.06),
    xl: Math.max(32, windowWidth * 0.08),
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    title: {
      fontSize: Math.max(24, windowWidth * 0.06),
      fontWeight: '700' as const,
      lineHeight: Math.max(32, windowWidth * 0.08),
    },
    subtitle: {
      fontSize: Math.max(18, windowWidth * 0.045),
      fontWeight: '600' as const,
      lineHeight: Math.max(24, windowWidth * 0.06),
    },
    body: {
      fontSize: Math.max(16, windowWidth * 0.04),
      fontWeight: '400' as const,
      lineHeight: Math.max(24, windowWidth * 0.06),
    },
    caption: {
      fontSize: Math.max(14, windowWidth * 0.035),
      fontWeight: '400' as const,
      lineHeight: Math.max(20, windowWidth * 0.05),
    },
  },
  shadows: {
    sm: Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    md: Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  animation: {
    scale: 1,
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeOut: [0.4, 0, 0.2, 1],
      easeIn: [0.4, 0, 1, 1],
      easeInOut: [0.4, 0, 0.2, 1],
    },
  },
});

interface MealCardProps {
  mealType: string;
  time: string;
  calories: number;
  foods: string[];
  onPress: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, time, calories, foods, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    });
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${mealType} at ${time}, ${calories} calories`}
      accessibilityHint="Double tap to view meal details">
      <Animated.View 
        entering={FadeInUp.springify().damping(15)} 
        style={[styles.mealCardContainer, animatedStyle]}>
        <View style={styles.mealCard}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealTime}>{time}</Text>
            <Text style={styles.mealName}>{mealType}</Text>
            <View style={styles.caloriesBadgeContainer}>
              <Text style={styles.caloriesText}>{calories} kcal</Text>
            </View>
          </View>
          <View style={styles.foodList}>
            {foods.map((food, index) => (
              <Text key={index} style={styles.foodItem}>
                • {food}
              </Text>
            ))}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const DayButton: React.FC<{ 
  day: string; 
  date: number;
  isSelected: boolean; 
  onPress: () => void 
}> = ({
  day,
  date,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.dayButton, isSelected && styles.selectedDay]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
      {day}
    </Text>
    <Text style={[styles.dayDate, isSelected && styles.selectedDayText]}>
      {date}
    </Text>
  </TouchableOpacity>
);

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  image?: string;
}

interface DayPlan {
  date: Date;
  meals: Meal[];
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

const MealPlanScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => createTheme(windowWidth), [windowWidth]);
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [storedMeals, setStoredMeals] = useState<MealPlanStorage | null>(null);
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const headerHeight = useSharedValue(0);
  const router = useRouter();

  // Replace the useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      const loadMeals = async () => {
        try {
          const storedPlan = await AsyncStorage.getItem('currentMealPlan');
          if (storedPlan) {
            const parsedPlan: MealPlanStorage = JSON.parse(storedPlan);
            setStoredMeals(parsedPlan);
          }
        } catch (error) {
          console.error('Error loading stored meals:', error);
        }
      };

      loadMeals();
    }, [])
  );

  // Calculate total nutrition from all selected meals
  const totalNutrition = useMemo(() => {
    if (!storedMeals) return null;

    try {
      const meals = [
        storedMeals.breakfast,
        storedMeals.lunch,
        storedMeals.dinner,
        storedMeals.snacks
      ].filter(meal => meal !== null);

      return meals.reduce((acc, meal) => ({
        calories: acc.calories + (meal?.nutritionalInfo?.calories || 0),
        protein: acc.protein + (meal?.nutritionalInfo?.protein || 0),
        carbs: acc.carbs + (meal?.nutritionalInfo?.carbs || 0),
        fats: acc.fats + (meal?.nutritionalInfo?.fat || 0)
      }), {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      return null;
    }
  }, [storedMeals]);

  // Scroll to today effect
  useEffect(() => {
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: adjustedIndex * (48 + 4),
          animated: true,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll animation
  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerHeight.value = withSpring(
      Math.max(0, 120 - scrollY),
      { damping: 20, stiffness: 200 }
    );
  }, []);

  // Render a meal card with improved error handling
  const renderMealCard = useCallback((meal: MealOption | null, mealType: string) => {
    if (!meal) {
      return (
        <Animated.View 
          entering={FadeInUp.delay(100)}
          style={styles.emptyMealCard}
        >
          <Text style={styles.emptyMealText}>No {mealType} selected</Text>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => router.push('/prepare-plan')}
          >
            <Text style={styles.addMealButtonText}>Add {mealType}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    const handleRemoveMeal = async () => {
      try {
        console.log('Attempting to remove meal:', mealType);
        
        // Get current meal plan
        const currentPlanStr = await AsyncStorage.getItem('currentMealPlan');
        console.log('Current stored plan:', currentPlanStr);
        
        if (!currentPlanStr) {
          console.error('No meal plan found in storage');
          return;
        }

        // Parse current plan with error handling
        let currentPlan: MealPlanStorage;
        try {
          currentPlan = JSON.parse(currentPlanStr);
        } catch (e) {
          console.error('Failed to parse meal plan:', e);
          currentPlan = { breakfast: null, lunch: null, dinner: null, snacks: null };
        }

        // Normalize the meal type for comparison
        const normalizedMealType = mealType.toLowerCase().trim();
        
        // Get the storage key based on normalized meal type
        let planKey: keyof MealPlanStorage;
        switch (normalizedMealType) {
          case 'breakfast':
            planKey = 'breakfast';
            break;
          case 'lunch':
            planKey = 'lunch';
            break;
          case 'dinner':
            planKey = 'dinner';
            break;
          case 'snacks':
          case 'snack':
            planKey = 'snacks';
            break;
          default:
            console.error('Unknown meal type:', mealType);
            return;
        }
        
        // Create a new plan object with the specific meal set to null
        const updatedPlan = {
          ...currentPlan,
          [planKey]: null
        };
        
        console.log('Updated plan before save:', updatedPlan);

        // Save updated plan
        await AsyncStorage.setItem('currentMealPlan', JSON.stringify(updatedPlan));
        
        // Force a clean state update with the new plan
        setStoredMeals(updatedPlan);
        
        console.log('Meal removed successfully:', planKey);

      } catch (error) {
        console.error('Error removing meal:', error);
      }
    };

    return (
      <Animated.View 
        entering={FadeInUp.delay(100)}
        style={styles.mealCard}
      >
        <View style={styles.mealInfo}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTime}>
              {mealType === 'Breakfast' ? '8:00 AM' :
              mealType === 'Lunch' ? '1:00 PM' :
              mealType === 'Dinner' ? '7:00 PM' : '4:00 PM'
            }</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveMeal}
              accessibilityLabel={`Remove ${mealType}`}
              accessibilityHint={`Removes ${meal.name} from your ${mealType}`}
            >
              <Ionicons name="close-circle" size={24} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.nutritionInfo}>
            <Text style={styles.nutritionText}>
              {meal.nutritionalInfo?.calories || 0} cal · {meal.nutritionalInfo?.protein || 0}g protein · 
              {meal.nutritionalInfo?.carbs || 0}g carbs · {meal.nutritionalInfo?.fat || 0}g fats
            </Text>
          </View>
          {meal.ingredients && meal.ingredients.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text style={styles.ingredientsTitle}>Ingredients:</Text>
              {meal.ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <Animated.View entering={FadeIn} style={[styles.header, { height: headerHeight }]}>
        <ThemedText type="title" style={styles.headerTitle}>Meal Plan</ThemedText>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your personalized nutrition schedule
        </Text>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Breakfast</Text>
          {renderMealCard(storedMeals?.breakfast ?? null, 'Breakfast')}

          <Text style={styles.sectionTitle}>Lunch</Text>
          {renderMealCard(storedMeals?.lunch ?? null, 'Lunch')}

          <Text style={styles.sectionTitle}>Dinner</Text>
          {renderMealCard(storedMeals?.dinner ?? null, 'Dinner')}

          <Text style={styles.sectionTitle}>Snacks</Text>
          {renderMealCard(storedMeals?.snacks ?? null, 'Snacks')}

          {totalNutrition && (
            <Animated.View 
              entering={FadeInUp.delay(200)}
              style={styles.nutritionSummary}
            >
              <Text style={styles.summaryTitle}>Daily Nutrition Totals</Text>
              <View style={styles.macroContainer}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.calories}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.fats}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MealPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  } as ViewStyle,
  header: {
    padding: 24,
    backgroundColor: Colors.light.primary,
    minHeight: 120,
  } as ViewStyle,
  headerTitle: {
    color: Colors.light.background,
    marginBottom: 4,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.light.background,
    marginTop: 4,
  } as TextStyle,
  daysWrapper: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: 4,
  } as ViewStyle,
  daysContainer: {
    flexGrow: 0,
    flexShrink: 0,
  } as ViewStyle,
  daysScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  } as ViewStyle,
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    width: 48,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  } as ViewStyle,
  selectedDay: {
    backgroundColor: Colors.light.primary,
  } as ViewStyle,
  dayName: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  } as TextStyle,
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  } as TextStyle,
  selectedDayText: {
    color: Colors.light.background,
  } as TextStyle,
  nutritionSummary: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 80,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  } as ViewStyle,
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  } as ViewStyle,
  editButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 4,
  } as TextStyle,
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  macroItem: {
    alignItems: 'center',
  } as ViewStyle,
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  } as TextStyle,
  macroLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  } as TextStyle,
  content: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  mealsContainer: {
    paddingBottom: 32,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 17,
    textAlign: 'center',
  },
  mealCardContainer: {
    marginBottom: 16,
    opacity: 0.99,
  } as ViewStyle,
  mealCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  } as ViewStyle,
  mealInfo: {
    flex: 1,
  },
  mealTime: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  nutritionInfo: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  ingredientsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    marginLeft: 8,
  },
  emptyMealCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    gap: 12,
  },
  emptyMealText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  addMealButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addMealButtonText: {
    fontSize: 16,
    color: Colors.light.background,
    fontWeight: '600',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  removeButton: {
    padding: 4,
  },
  caloriesBadgeContainer: {
    backgroundColor: Colors.light.successLight,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  } as ViewStyle,
  caloriesText: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: '600',
  } as TextStyle,
  foodList: {
    marginTop: 12,
  } as ViewStyle,
  foodItem: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  } as TextStyle,
}); 