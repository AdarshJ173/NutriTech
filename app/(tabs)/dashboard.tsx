import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Animated.View entering={FadeInUp.delay(200)} style={[styles.statCard, { backgroundColor: color }]}>
    <Ionicons name={icon} size={24} color="white" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Animated.View>
);

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
  const handleActionPress = (action: string) => {
    console.log(`${action} pressed`);
    // Implement navigation or action handling
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.name}>John Doe</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Current BMI"
            value="22.5"
            icon="body-outline"
            color="#58CC02"
          />
          <StatCard
            title="Daily Calories"
            value="2100"
            icon="flame-outline"
            color="#FF9500"
          />
          <StatCard
            title="Water Intake"
            value="2.5L"
            icon="water-outline"
            color="#32ADE6"
          />
          <StatCard
            title="Activity"
            value="Active"
            icon="fitness-outline"
            color="#AF52DE"
          />
        </View>

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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
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
}); 