import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, AccessibilityInfo, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  withTiming
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Enhanced accessibility props interface
interface AccessibleTouchableProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole: 'button' | 'header' | 'text' | 'image';
}

interface StatCardProps extends AccessibleTouchableProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  showBmiStatus?: boolean;
  showCalorieStatus?: boolean;
  bmiValue?: string;
}

const getBmiStatus = (bmi: number): { status: string; color: string } => {
  if (bmi < 18.5) return { status: 'Underweight', color: '#FFB74D' };
  if (bmi < 24.9) return { status: 'Healthy', color: '#81C784' };
  if (bmi < 29.9) return { status: 'Overweight', color: '#FF8A65' };
  return { status: 'Obese', color: '#E57373' };
};

// Calculate daily calorie needs based on BMI
// Using Mifflin-St Jeor Equation with moderate activity level
const calculateDailyCalories = (bmi: number): { calories: number; status: string; color: string } => {
  // Base calorie calculation (assuming average height of 170cm and moderate activity)
  let baseWeight = 170 * 170 * bmi / 10000; // Calculate weight from BMI
  let baseCalories = (10 * baseWeight) + (6.25 * 170) - (5 * 30) + 5; // Using average age of 30
  baseCalories *= 1.55; // Moderate activity multiplier

  // Adjust calories based on BMI status
  if (bmi < 18.5) {
    return {
      calories: Math.round(baseCalories * 1.2), // Increase for weight gain
      status: 'Gain Weight',
      color: '#FFB74D'
    };
  } else if (bmi < 24.9) {
    return {
      calories: Math.round(baseCalories),
      status: 'Maintain',
      color: '#81C784'
    };
  } else if (bmi < 29.9) {
    return {
      calories: Math.round(baseCalories * 0.85), // Decrease for weight loss
      status: 'Reduce',
      color: '#FF8A65'
    };
  } else {
    return {
      calories: Math.round(baseCalories * 0.7), // Significant decrease for weight loss
      status: 'Weight Loss',
      color: '#E57373'
    };
  }
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  showBmiStatus = false,
  showCalorieStatus = false,
  bmiValue = "0",
  ...accessibilityProps 
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bmiStatus = showBmiStatus ? getBmiStatus(parseFloat(value)) : null;
  const calorieInfo = showCalorieStatus ? calculateDailyCalories(parseFloat(bmiValue)) : null;

  return (
    <TouchableOpacity 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...accessibilityProps}
    >
      <Animated.View 
        entering={FadeInUp.springify().damping(15)}
        style={[styles.statCard, { backgroundColor: color }, animatedStyle]}
      >
        {showBmiStatus && (
          <View style={styles.bmiStatusContainer}>
            <Text style={[styles.bmiStatus, { color: bmiStatus?.color }]}>
              {bmiStatus?.status}
            </Text>
          </View>
        )}
        {showCalorieStatus && calorieInfo && (
          <View style={styles.bmiStatusContainer}>
            <Text style={[styles.bmiStatus, { color: calorieInfo.color }]}>
              {calorieInfo.status}
            </Text>
          </View>
        )}
        <View style={[
          styles.statContent, 
          (showBmiStatus || showCalorieStatus) && styles.statContentWithStatus
        ]}>
          <Ionicons name={icon} size={24} color="white" />
          <Text style={styles.statValue}>
            {showCalorieStatus ? `${calorieInfo?.calories}` : value}
          </Text>
          <Text style={styles.statTitle}>{title}</Text>
          {showCalorieStatus && (
            <Text style={styles.calorieSubtext}>calories/day</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Animated.View entering={FadeInUp.delay(400)} style={styles.actionCard}>
      <View style={styles.actionIconContainer}>
        <Ionicons name={icon} size={24} color="#58CC02" />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#58CC02" />
    </Animated.View>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      // Announce screen to screen readers
      AccessibilityInfo.announceForAccessibility('Dashboard screen loaded');
      
      // Reset animations
      headerOpacity.value = withTiming(1);
      return () => {
        headerOpacity.value = withTiming(0);
      };
    }, [])
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          'clamp'
        )
      }
    ]
  }));

  const handleActionPress = (action: string) => {
    console.log(`${action} pressed`);
    if (action === 'track-meal') {
      router.push('/(tabs)/meal-plan');
    } else if (action === 'progress') {
      router.push('/(tabs)/progress');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Text 
            style={styles.greeting}
            accessibilityRole="text"
          >
            Welcome back!
          </Text>
          <Text 
            style={styles.name}
            accessibilityRole="header"
          >
            John Doe
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <Ionicons name="person-circle-outline" size={40} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.min(width * 0.02, 8),
            paddingBottom: insets.bottom + Math.min(width * 0.1, 40)
          }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }, [])}
        scrollEventThrottle={16}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Current BMI"
            value="22.5"
            icon="body-outline"
            color="#52734D"
            accessibilityLabel="Current BMI is 22.5"
            accessibilityRole="text"
            showBmiStatus={true}
          />
          <StatCard
            title="Daily Calories"
            value="2100"
            icon="flame-outline"
            color="#52734D"
            accessibilityLabel="Recommended daily calories"
            accessibilityRole="text"
            showCalorieStatus={true}
            bmiValue="22.5"
          />
          <StatCard
            title="Water Intake"
            value="2.5L"
            icon="water-outline"
            color="#32ADE6"
            accessibilityLabel="Water intake is 2.5 liters"
            accessibilityRole="text"
          />
          <StatCard
            title="Activity"
            value="Active"
            icon="fitness-outline"
            color="#AF52DE"
            accessibilityLabel="Activity level is Active"
            accessibilityRole="text"
          />
        </View>

        {/* Prepare a Plan Special Box */}
        <TouchableOpacity 
          onPress={() => router.push('/prepare-plan')}
          style={styles.preparePlanCard}
          accessibilityLabel="Prepare a personalized meal plan"
          accessibilityRole="button"
        >
          <Animated.View 
            entering={FadeInUp.delay(500)}
            style={styles.preparePlanContent}
          >
            <View style={styles.preparePlanIconContainer}>
              <Ionicons name="restaurant-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.preparePlanTextContainer}>
              <Text style={styles.preparePlanTitle}>Prepare a Plan</Text>
              <Text style={styles.preparePlanDescription}>
                Create a personalized meal plan based on your profile and preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionCard
          title="Track Meal"
          description="Log your breakfast, lunch, or dinner"
          icon="restaurant-outline"
          onPress={() => handleActionPress('track-meal')}
        />
        {/* <ActionCard
          title="Daily Exercise"
          description="Record your physical activities"
          icon="fitness-outline"
          onPress={() => handleActionPress('exercise')}
        />
        <ActionCard
          title="Water Tracking"
          description="Update your water intake"
          icon="water-outline"
          onPress={() => handleActionPress('water')}
        /> */}
        <ActionCard
          title="View Progress"
          description="Check your health journey"
          icon="trending-up-outline"
          onPress={() => handleActionPress('progress')}
        />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFFDE', // Light background from palette
  },
  header: {
    backgroundColor: '#52734D', // Dark green from palette
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    color: '#DDFFBC', // Light accent from palette
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.5,
  },
  name: {
    color: '#FEFFDE', // Lightest shade from palette
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Math.min(width * 0.06, 24),
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Math.min(width * 0.08, 32),
    marginTop: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 7,
    backfaceVisibility: 'hidden',
    backgroundColor: '#91C788',
    position: 'relative',
    minHeight: 180,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 8,
  },
  statContentWithStatus: {
    paddingTop: 32,
  },
  bmiStatusContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  bmiStatus: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(254, 255, 222, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#FEFFDE',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.5,
  },
  statTitle: {
    color: '#E0FBE2',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#52734D', // Dark green from palette
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#E0FBE2', // Light green from palette
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#91C788', // Medium green from palette
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#52734D', // Dark green from palette
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.3,
  },
  actionDescription: {
    fontSize: 14,
    color: '#91C788', // Medium green from palette
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.2,
  },
  preparePlanCard: {
    marginVertical: 24,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#52734D', // Dark green from palette
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  preparePlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  preparePlanIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#91C788', // Medium green from palette
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  preparePlanTextContainer: {
    flex: 1,
  },
  preparePlanTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FEFFDE', // Lightest shade from palette
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  preparePlanDescription: {
    fontSize: 15,
    color: '#DDFFBC', // Light accent from palette
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  profileButton: {
    marginLeft: 20,
    backgroundColor: '#91C788', // Medium green from palette
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieSubtext: {
    color: '#E0FBE2',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    letterSpacing: 0.2,
    opacity: 0.9,
  },
}); 