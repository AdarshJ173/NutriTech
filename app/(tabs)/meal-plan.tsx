import React, { useState, useCallback, useMemo } from 'react';
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

const MealPlanScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => createTheme(windowWidth), [windowWidth]);
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weeklyPlan] = useState<DayPlan[]>(generateWeeklyPlan());
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const headerHeight = useSharedValue(0);
  
  React.useEffect(() => {
    // Calculate the index of today in the week
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust for Monday start

    // Scroll to today's position with a slight delay to ensure layout is ready
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: adjustedIndex * (48 + 4), // width of day button + margin (4px)
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

  // Memoized calculations
  const selectedDayPlan = useMemo(() => 
    weeklyPlan.find(plan => plan.date.toDateString() === selectedDay.toDateString()),
    [weeklyPlan, selectedDay]
  );

  const totalNutrition = useMemo(() => 
    selectedDayPlan?.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    ),
    [selectedDayPlan]
  );

  // Scroll handling with performance optimization
  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerHeight.value = withSpring(
      Math.max(0, 120 - scrollY),
      { damping: 20, stiffness: 200 }
    );
  }, []);

  const handleMealPress = (mealType: string) => {
    console.log(`${mealType} pressed`);
    // Implement meal details/editing navigation
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Enhanced header with collapsible animation */}
      <Animated.View 
        entering={FadeIn} 
        style={[styles.header, { height: headerHeight }]}>
        <ThemedText type="title" style={styles.headerTitle}>Meal Plan</ThemedText>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your personalized nutrition schedule
        </Text>
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
        style={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
        entering={FadeIn.delay(400)}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
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
    margin: 24,
    marginTop: 16,
    padding: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    ...Platform.select({
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
  } as ViewStyle,
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
  mealsSection: {
    padding: 24,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
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
  addButtonText: {
    fontSize: 14,
    color: Colors.light.background,
    marginLeft: 4,
    fontWeight: '600',
  } as TextStyle,
  mealCardContainer: {
    marginBottom: 16,
    opacity: 0.99,
  } as ViewStyle,
  mealCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
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
  mealInfo: {
    flex: 1,
    flexDirection: 'column',
  } as ViewStyle,
  mealTime: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  } as TextStyle,
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginVertical: 4,
  } as TextStyle,
  mealMacros: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  } as TextStyle,
  mealEditButton: {
    padding: 8,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  foodList: {
    marginTop: 4,
  } as ViewStyle,
  foodItem: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  caloriesBadgeContainer: {
    backgroundColor: Colors.light.successLight,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginTop: 4,
  } as ViewStyle,
  caloriesText: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: '600',
  } as TextStyle,
}); 