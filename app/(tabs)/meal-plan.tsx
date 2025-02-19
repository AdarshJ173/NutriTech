import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInUp, 
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

const Colors = {
  light: {
    primary: '#4CAF50',
    primaryLight: '#E8F5E9',
    primaryDark: '#388E3C',
    background: '#FFFFFF',
    surface: '#F5F7FA',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E0E0E0',
    success: '#58CC02',
    successLight: 'rgba(88, 204, 2, 0.1)',
    card: '#FFFFFF',
    shadow: '#000000',
  },
};

const Theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
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
};

interface MealCardProps {
  mealType: string;
  time: string;
  calories: number;
  foods: string[];
  onPress: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, time, calories, foods, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Animated.View 
      entering={FadeInUp.delay(200)} 
      style={styles.mealCardContainer}>
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

export default function MealPlanScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weeklyPlan] = useState<DayPlan[]>(generateWeeklyPlan());
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  
  React.useEffect(() => {
    // Calculate the index of today in the week
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust for Monday start

    // Scroll to today's position with a slight delay to ensure layout is ready
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: adjustedIndex * (48 + Theme.spacing.xs), // width of day button + margin
          animated: true,
        });
      }
    }, 500);
  }, []);

  function generateWeeklyPlan(): DayPlan[] {
    const today = new Date();
    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        date,
        meals: [
          {
            name: 'Oatmeal with Fruits',
            calories: 350,
            protein: 12,
            carbs: 55,
            fats: 8,
            time: '8:00 AM',
          },
          {
            name: 'Greek Yogurt with Nuts',
            calories: 200,
            protein: 15,
            carbs: 12,
            fats: 10,
            time: '11:00 AM',
          },
          {
            name: 'Grilled Chicken Salad',
            calories: 450,
            protein: 35,
            carbs: 25,
            fats: 22,
            time: '2:00 PM',
          },
          {
            name: 'Protein Smoothie',
            calories: 250,
            protein: 20,
            carbs: 30,
            fats: 5,
            time: '5:00 PM',
          },
          {
            name: 'Salmon with Vegetables',
            calories: 550,
            protein: 40,
            carbs: 35,
            fats: 28,
            time: '8:00 PM',
          },
        ],
      };
    });
  }

  const selectedDayPlan = weeklyPlan.find(
    plan => plan.date.toDateString() === selectedDay.toDateString()
  );

  const totalNutrition = selectedDayPlan?.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleMealPress = (mealType: string) => {
    console.log(`${mealType} pressed`);
    // Implement meal details/editing navigation
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Animated.View 
        entering={FadeIn} 
        style={styles.header}>
        <ThemedText type="title">Meal Plan</ThemedText>
        <Text style={styles.subtitle}>Your personalized nutrition schedule</Text>
      </Animated.View>

      {/* Week Day Selector */}
      <Animated.View 
        entering={SlideInRight.delay(200)}
        style={styles.daysWrapper}>
        <Animated.ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContent}
          style={styles.daysContainer}>
          {weeklyPlan.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                day.date.toDateString() === selectedDay.toDateString() && styles.selectedDay,
              ]}
              onPress={() => setSelectedDay(day.date)}
              activeOpacity={0.7}>
              <Text style={[
                styles.dayName,
                day.date.toDateString() === selectedDay.toDateString() && styles.selectedDayText,
              ]}>
                {daysOfWeek[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1].slice(0, 3)}
              </Text>
              <Text style={[
                styles.dayDate,
                day.date.toDateString() === selectedDay.toDateString() && styles.selectedDayText,
              ]}>
                {day.date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </Animated.View>

      {/* Meals List */}
      <Animated.ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        entering={FadeIn.delay(400)}>
        <View style={styles.nutritionSummary}>
          <View style={styles.summaryHeader}>
            <ThemedText type="subtitle">Daily Nutrition</ThemedText>
            <TouchableOpacity 
              style={styles.editButton}
              activeOpacity={0.7}>
              <FontAwesome name="pencil" size={16} color={Colors.light.primary} />
              <Text style={styles.editButtonText}>Edit Goals</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalNutrition?.calories}</Text>
              <Text style={styles.macroLabel}>Calories</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalNutrition?.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalNutrition?.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalNutrition?.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>
        </View>

        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Meals</ThemedText>
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={0.8}>
              <FontAwesome name="plus" size={16} color={Colors.light.background} />
              <Text style={styles.addButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
          {selectedDayPlan?.meals.map((meal, index) => (
            <Animated.View 
              key={index}
              entering={FadeInUp.delay(200 + index * 100)}
              style={styles.mealCardContainer}>
              <TouchableOpacity 
                style={styles.mealCard}
                activeOpacity={0.9}
                onPress={() => handleMealPress(meal.name)}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealMacros}>
                    {meal.calories} cal · {meal.protein}g protein · {meal.carbs}g carbs · {meal.fats}g fats
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.mealEditButton}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <FontAwesome name="ellipsis-v" size={20} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  } as ViewStyle,
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : Theme.spacing.xl,
    backgroundColor: Colors.light.primary,
  } as ViewStyle,
  subtitle: {
    ...Theme.typography.body,
    color: Colors.light.background,
    marginTop: Theme.spacing.xs,
  } as TextStyle,
  daysWrapper: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: Theme.spacing.xs,
  } as ViewStyle,
  daysContainer: {
    flexGrow: 0,
    flexShrink: 0,
  } as ViewStyle,
  daysScrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  } as ViewStyle,
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    marginRight: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.light.surface,
    width: 48,
    height: 56,
    ...Theme.shadows.sm,
  } as ViewStyle,
  selectedDay: {
    backgroundColor: Colors.light.primary,
  } as ViewStyle,
  dayName: {
    ...Theme.typography.caption,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  } as TextStyle,
  dayDate: {
    ...Theme.typography.subtitle,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  } as TextStyle,
  selectedDayText: {
    color: Colors.light.background,
  } as TextStyle,
  nutritionSummary: {
    margin: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  } as ViewStyle,
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  } as ViewStyle,
  editButtonText: {
    ...Theme.typography.caption,
    color: Colors.light.primary,
    marginLeft: Theme.spacing.xs,
  } as TextStyle,
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  macroItem: {
    alignItems: 'center',
  } as ViewStyle,
  macroValue: {
    ...Theme.typography.subtitle,
    color: Colors.light.text,
  } as TextStyle,
  macroLabel: {
    ...Theme.typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Theme.spacing.xs,
  } as TextStyle,
  mealsSection: {
    padding: Theme.spacing.lg,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    ...Theme.shadows.sm,
  } as ViewStyle,
  addButtonText: {
    ...Theme.typography.caption,
    color: Colors.light.background,
    marginLeft: Theme.spacing.xs,
    fontWeight: '600',
  } as TextStyle,
  mealCardContainer: {
    marginBottom: Theme.spacing.md,
    opacity: 0.99,
  } as ViewStyle,
  mealCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  } as ViewStyle,
  mealInfo: {
    flex: 1,
    flexDirection: 'column',
  } as ViewStyle,
  mealTime: {
    ...Theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  } as TextStyle,
  mealName: {
    ...Theme.typography.subtitle,
    color: Colors.light.text,
    marginVertical: Theme.spacing.xs,
  } as TextStyle,
  mealMacros: {
    ...Theme.typography.caption,
    color: Colors.light.textSecondary,
  } as TextStyle,
  mealEditButton: {
    padding: Theme.spacing.sm,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  foodList: {
    marginTop: Theme.spacing.xs,
  } as ViewStyle,
  foodItem: {
    ...Theme.typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Theme.spacing.xs,
  } as TextStyle,
  caloriesBadgeContainer: {
    backgroundColor: Colors.light.successLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.xl,
    alignSelf: 'flex-start',
    marginTop: Theme.spacing.xs,
  } as ViewStyle,
  caloriesText: {
    ...Theme.typography.caption,
    color: Colors.light.success,
    fontWeight: '600',
  } as TextStyle,
}); 