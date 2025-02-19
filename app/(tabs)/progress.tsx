import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';

const Colors = {
  light: {
    tint: '#4CAF50',
    background: '#FFFFFF',
    text: '#000000',
    secondaryText: '#666666',
    card: '#f5f5f5',
  },
  dark: {
    tint: '#66BB6A',
    background: '#121212',
    text: '#FFFFFF',
    secondaryText: '#AAAAAA',
    card: '#1E1E1E',
  }
};

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const weightData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [75, 74, 73, 72, 71, 70],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const caloriesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [2100, 1950, 2200, 1800, 2000, 1900, 2150],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

export default function Progress() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Progress Tracking</ThemedText>
        <Text style={styles.subtitle}>Monitor your health journey</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Weight Progress</ThemedText>
          <Text style={styles.sectionSubtitle}>Last 6 months</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={weightData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>-5 kg</Text>
            <Text style={styles.statLabel}>Total Loss</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0.8 kg</Text>
            <Text style={styles.statLabel}>Monthly Avg</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>70 kg</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Calorie Intake</ThemedText>
          <Text style={styles.sectionSubtitle}>This week</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={caloriesData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>2000</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>1950</Text>
            <Text style={styles.statLabel}>Daily Avg</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Goal Met</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.light.tint,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.secondaryText,
    marginTop: 5,
  },
}); 