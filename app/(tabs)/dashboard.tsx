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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, ...accessibilityProps }) => {
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
        <Ionicons name={icon} size={24} color="white" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
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
    // Implement navigation or action handling
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
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
            color="#58CC02"
            accessibilityLabel="Current BMI is 22.5"
            accessibilityRole="text"
          />
          <StatCard
            title="Daily Calories"
            value="2100"
            icon="flame-outline"
            color="#FF9500"
            accessibilityLabel="Daily calories target is 2100"
            accessibilityRole="text"
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
        <ActionCard
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
        />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#58CC02',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Math.min(width * 0.05, 20),
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  profileButton: {
    marginLeft: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Math.min(width * 0.06, 24),
  },
  statCard: {
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    backfaceVisibility: 'hidden', // Performance optimization
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  statTitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(88, 204, 2, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  preparePlanCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#58CC02',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  preparePlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  preparePlanIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  preparePlanTextContainer: {
    flex: 1,
  },
  preparePlanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  preparePlanDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
}); 