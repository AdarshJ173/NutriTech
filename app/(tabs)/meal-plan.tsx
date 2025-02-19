import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MealCardProps {
  mealType: string;
  time: string;
  calories: number;
  foods: string[];
  onPress: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, time, calories, foods, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Animated.View entering={FadeInUp.delay(200)} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View>
          <Text style={styles.mealType}>{mealType}</Text>
          <Text style={styles.mealTime}>{time}</Text>
        </View>
        <View style={styles.caloriesBadge}>
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
    </Animated.View>
  </TouchableOpacity>
);

const WeekDayButton: React.FC<{ day: string; isSelected: boolean; onPress: () => void }> = ({
  day,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.weekDayButton, isSelected && styles.weekDayButtonSelected]}
    onPress={onPress}
  >
    <Text style={[styles.weekDayText, isSelected && styles.weekDayTextSelected]}>{day}</Text>
  </TouchableOpacity>
);

export default function MealPlanScreen() {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleMealPress = (mealType: string) => {
    console.log(`${mealType} pressed`);
    // Implement meal details/editing navigation
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Plan</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Week Day Selector */}
      <View style={styles.weekDaySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDays.map((day) => (
            <WeekDayButton
              key={day}
              day={day}
              isSelected={selectedDay === day}
              onPress={() => setSelectedDay(day)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Meals List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nutritionSummary}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>2100</Text>
            <Text style={styles.nutritionLabel}>Daily Goal</Text>
          </View>
          <View style={styles.nutritionDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>1450</Text>
            <Text style={styles.nutritionLabel}>Consumed</Text>
          </View>
          <View style={styles.nutritionDivider} />
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>650</Text>
            <Text style={styles.nutritionLabel}>Remaining</Text>
          </View>
        </View>

        <MealCard
          mealType="Breakfast"
          time="7:30 AM"
          calories={350}
          foods={['Oatmeal with berries', 'Greek yogurt', 'Green tea']}
          onPress={() => handleMealPress('Breakfast')}
        />
        <MealCard
          mealType="Lunch"
          time="12:30 PM"
          calories={550}
          foods={['Grilled chicken salad', 'Quinoa', 'Fresh orange juice']}
          onPress={() => handleMealPress('Lunch')}
        />
        <MealCard
          mealType="Snack"
          time="3:30 PM"
          calories={200}
          foods={['Mixed nuts', 'Apple']}
          onPress={() => handleMealPress('Snack')}
        />
        <MealCard
          mealType="Dinner"
          time="7:00 PM"
          calories={450}
          foods={['Salmon fillet', 'Steamed vegetables', 'Brown rice']}
          onPress={() => handleMealPress('Dinner')}
        />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  addButton: {
    padding: 5,
  },
  weekDaySelector: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  weekDayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  weekDayButtonSelected: {
    backgroundColor: '#58CC02',
  },
  weekDayText: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  weekDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  nutritionSummary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 15,
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mealType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  caloriesBadge: {
    backgroundColor: 'rgba(88, 204, 2, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  caloriesText: {
    color: '#58CC02',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  foodList: {
    marginTop: 5,
  },
  foodItem: {
    fontSize: 15,
    color: '#444',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
}); 