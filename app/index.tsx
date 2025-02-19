import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import SplashScreen from './SplashScreen';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/details');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      return bmi.toFixed(2);
    }
    return null;
  };

  const togglePreference = (preference: string) => {
    if (preferences.includes(preference)) {
      setPreferences(preferences.filter(p => p !== preference));
    } else {
      setPreferences([...preferences, preference]);
    }
  };

  const handleContinue = () => {
    const bmi = calculateBMI();
    if (bmi) {
      // Store BMI and preferences in AsyncStorage or your preferred state management
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to NutriTech</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Let's calculate your BMI</Text>
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map((pref) => (
          <TouchableOpacity
            key={pref}
            style={[
              styles.preferenceButton,
              preferences.includes(pref) && styles.preferenceButtonActive
            ]}
            onPress={() => togglePreference(pref)}
          >
            <Text style={[
              styles.preferenceButtonText,
              preferences.includes(pref) && styles.preferenceButtonTextActive
            ]}>
              {pref}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueButton, (!height || !weight) && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!height || !weight}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  preferenceButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  preferenceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  preferenceButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  preferenceButtonTextActive: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 