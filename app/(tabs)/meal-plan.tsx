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
    primary: '#91C788',
    primaryLight: '#ACE1AF',
    primaryDark: '#52734D',
    background: '#FEFFDE',
    surface: '#E0FBE2',
    text: '#000000',
    textSecondary: '#52734D',
    textTertiary: '#91C788',
    border: '#B0EBB4',
    success: '#91C788',
    successLight: '#BFF6C3',
    card: '#FEFFDE',
    shadow: '#000000',
    focus: '#52734D',
    error: '#FF6B6B',
  },
  dark: {
    primary: '#91C788',
    primaryLight: '#52734D',
    primaryDark: '#ACE1AF',
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FEFFDE',
    textSecondary: '#DDFFBC',
    textTertiary: '#B0EBB4',
    border: '#52734D',
    success: '#91C788',
    successLight: '#BFF6C3',
    card: '#1A1A1A',
    shadow: '#000000',
    focus: '#ACE1AF',
    error: '#FF6B6B',
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
        // Get current meal plan
        const currentPlanStr = await AsyncStorage.getItem('currentMealPlan');
        if (!currentPlanStr) {
          console.error('No meal plan found in storage');
          return;
        }

        let currentPlan: MealPlanStorage = JSON.parse(currentPlanStr);

        // Map the meal type to the storage key
        const mealTypeMap: { [key: string]: keyof MealPlanStorage } = {
          'Breakfast': 'breakfast',
          'Lunch': 'lunch',
          'Dinner': 'dinner',
          'Snacks': 'snacks'
        };

        const storageKey = mealTypeMap[mealType];
        if (!storageKey) {
          console.error('Invalid meal type:', mealType);
          return;
        }

        // Create updated plan with the meal removed
        const updatedPlan = {
          ...currentPlan,
          [storageKey]: null
        };

        // Save to storage
        await AsyncStorage.setItem('currentMealPlan', JSON.stringify(updatedPlan));
        
        // Update state
        setStoredMeals(updatedPlan);

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
              mealType === 'Dinner' ? '7:00 PM' : '4:00 PM'}
            </Text>
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
  }, [router, setStoredMeals]);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'light'} />
      
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
                  <Text style={styles.macroValue}>{totalNutrition.protein}</Text>
                  <Text style={styles.macroLabel}>Protein{'\n'}(g)</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.carbs}</Text>
                  <Text style={styles.macroLabel}>Carbs{'\n'}(g)</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalNutrition.fats}</Text>
                  <Text style={styles.macroLabel}>Fats{'\n'}(g)</Text>
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
    paddingTop: 0,
  } as ViewStyle,
  header: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 0,
    backgroundColor: '#52734D',
    minHeight: 140,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
  headerTitle: {
    color: '#FEFFDE',
    marginBottom: 8,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    color: '#E0FBE2',
    marginTop: 4,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: 24,
    padding: 24,
    marginTop: 32,
    marginBottom: 80,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginHorizontal: 4,
  } as ViewStyle,
  macroItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  } as ViewStyle,
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primaryDark,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  } as TextStyle,
  macroLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    flexWrap: 'wrap',
  } as TextStyle,
  content: {
    flex: 1,
    padding: 24,
  } as ViewStyle,
  mealsContainer: {
    paddingBottom: 32,
    gap: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primaryDark,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  mealCardContainer: {
    marginBottom: 16,
    opacity: 0.99,
  } as ViewStyle,
  mealCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,
  mealInfo: {
    flex: 1,
    gap: 8,
  },
  mealTime: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  nutritionInfo: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  nutritionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    fontWeight: '500',
  },
  ingredientsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  ingredient: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginLeft: 12,
    lineHeight: 24,
  },
  emptyMealCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    gap: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
  },
  emptyMealText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  addMealButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addMealButtonText: {
    fontSize: 18,
    color: Colors.light.background,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
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