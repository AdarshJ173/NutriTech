import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Define colors directly since we don't have access to the constants file
const Colors = {
  primary: '#58CC02',
  background: '#fff',
  text: '#333',
  textSecondary: '#666',
  border: '#E5E5E5',
  cardBackground: '#f5f5f5',
};

// TypeScript interfaces
interface NutritionStats {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyGoal {
  current: number;
  target: number;
  unit: string;
}

export default function NutritionScreen() {
  const router = useRouter();
  
  // Example data - In a real app, this would come from your state management
  const dailyGoals: Record<string, DailyGoal> = {
    calories: { current: 1200, target: 2000, unit: 'kcal' },
    protein: { current: 45, target: 60, unit: 'g' },
    carbs: { current: 150, target: 250, unit: 'g' },
    fats: { current: 35, target: 65, unit: 'g' },
  };

  const renderProgressBar = (current: number, target: number) => {
    const progress = Math.min((current / target) * 100, 100);
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Let's make your nutrition journey successful and affordable</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => router.push('/(tabs)/meal-plan')}
        >
          <Text style={styles.generateButtonText}>Generate My Meal Plan</Text>
          <Ionicons name="restaurant-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Daily Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.statsContainer}>
          {Object.entries(dailyGoals).map(([key, goal]) => (
            <View key={key} style={styles.statCard}>
              <Text style={styles.statLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.statValue}>
                {goal.current}/{goal.target} {goal.unit}
              </Text>
              {renderProgressBar(goal.current, goal.target)}
            </View>
          ))}
        </View>
      </View>

      {/* Today's Meal Plan Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/meal-plan')}>
            <Text style={styles.viewAll}>View Full Plan</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mealPlanCard}>
          <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
          <View style={styles.mealPlanInfo}>
            <Text style={styles.mealPlanTitle}>Your meal plan is ready!</Text>
            <Text style={styles.mealPlanDescription}>
              Tap to view your personalized meal plan for today
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    padding: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  mealPlanCard: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealPlanInfo: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
}); 