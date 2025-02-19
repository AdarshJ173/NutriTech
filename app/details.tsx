import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

interface UserDetails {
  age: string;
  sex: string;
  height: string;
  weight: string;
  bmi: string;
  location: string;
  income: string;
  dietaryPreference: string;
  healthConditions: string;
}

export default function DetailsScreen() {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    age: '',
    sex: '',
    height: '',
    weight: '',
    bmi: '',
    location: '',
    income: '',
    dietaryPreference: '',
    healthConditions: '',
  });

  const calculateBMI = (weight: string, height: string) => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (weightNum && heightNum) {
      const heightInMeters = heightNum / 100;
      const bmi = (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
      setUserDetails(prev => ({ ...prev, bmi }));
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    // TODO: Save user details to storage/state management
    router.push('/(tabs)/dashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>PROFILE</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.label}>AGE</Text>
        <TextInput
          style={styles.input}
          value={userDetails.age}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, age: text }))}
          keyboardType="numeric"
          placeholder="Enter your age"
        />

        <Text style={styles.label}>SEX</Text>
        <TextInput
          style={styles.input}
          value={userDetails.sex}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, sex: text }))}
          placeholder="Enter your sex"
        />

        <Text style={styles.label}>HEIGHT</Text>
        <TextInput
          style={styles.input}
          value={userDetails.height}
          onChangeText={(text) => {
            setUserDetails(prev => ({ ...prev, height: text }));
            calculateBMI(userDetails.weight, text);
          }}
          keyboardType="numeric"
          placeholder="Enter your height (cm)"
        />

        <Text style={styles.label}>WEIGHT</Text>
        <TextInput
          style={styles.input}
          value={userDetails.weight}
          onChangeText={(text) => {
            setUserDetails(prev => ({ ...prev, weight: text }));
            calculateBMI(text, userDetails.height);
          }}
          keyboardType="numeric"
          placeholder="Enter your weight (kg)"
        />

        <Text style={styles.label}>CALCULATED BMI</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={userDetails.bmi}
          editable={false}
          placeholder="Your BMI will appear here"
        />

        <Text style={styles.label}>LOCATION</Text>
        <TextInput
          style={styles.input}
          value={userDetails.location}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, location: text }))}
          placeholder="Enter your location"
        />

        <Text style={styles.label}>INCOME</Text>
        <TextInput
          style={styles.input}
          value={userDetails.income}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, income: text }))}
          keyboardType="numeric"
          placeholder="Enter your income"
        />

        <Text style={styles.label}>DIETARY PREFERENCE</Text>
        <TextInput
          style={styles.input}
          value={userDetails.dietaryPreference}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, dietaryPreference: text }))}
          placeholder="Enter your dietary preferences"
        />

        <Text style={styles.label}>HEALTH CONDITIONS</Text>
        <TextInput
          style={styles.input}
          value={userDetails.healthConditions}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, healthConditions: text }))}
          placeholder="Enter any health conditions"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58CC02',
  },
  header: {
    backgroundColor: '#FFFFFF',
    height: 90,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 0,
  },
  headerText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    fontWeight: '800',
    fontSize: 32,
    color: '#58CC02',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 23,
    marginTop: 20,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    fontWeight: '800',
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    paddingBottom: 30,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 136,
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
    fontWeight: '800',
    fontSize: 32,
    color: '#58CC02',
  },
}); 