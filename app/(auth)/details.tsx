import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOut,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  withTiming
} from 'react-native-reanimated';
import { Shadow } from 'react-native-shadow-2';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserDetails {
  age: string;
  sex: string;
  height: string;
  weight: string;
  bmi: string;
  location: string;
}

const { width, height } = Dimensions.get('window');

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function DetailsScreen() {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    age: '',
    sex: '',
    height: '',
    weight: '',
    bmi: '',
    location: '',
  });

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const headerHeight = useSharedValue(70);
  const inputScale = useSharedValue(1);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
      headerHeight.value = withTiming(50);
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
      headerHeight.value = withTiming(70);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      transform: [
        {
          scale: interpolate(
            headerHeight.value,
            [50, 70],
            [0.9, 1]
          )
        }
      ]
    };
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

  const handleNext = () => {
    // Save user profile to AsyncStorage
    const userProfile = {
      name: 'John Doe', // This should be fetched from previous screens
      age: userDetails.age,
      sex: userDetails.sex,
      height: userDetails.height,
      weight: userDetails.weight,
      bmi: userDetails.bmi,
      location: userDetails.location,
    };

    AsyncStorage.setItem('userProfile', JSON.stringify(userProfile))
      .then(() => {
        // Navigate to the tabs/dashboard
        router.replace('/(tabs)/dashboard');
      })
      .catch(error => {
        console.error('Error saving user profile:', error);
        Alert.alert(
          'Error',
          'Failed to save your profile. Please try again.',
          [{ text: 'OK' }]
        );
      });
  };

  const handleBack = () => {
    router.back();
  };

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant location permission to automatically detect your location.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);
      const hasPermission = await getLocationPermission();
      
      if (!hasPermission) {
        setIsLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Get the address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (address) {
        const locationString = [
          address.district,
          address.city,
          address.region,
        ].filter(Boolean).join(', ');

        setUserDetails(prev => ({ ...prev, location: locationString }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch your location. Please try again or enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLocationLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: any = 'default',
    editable: boolean = true,
    index: number
  ) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(100 * index).springify()}
        style={styles.inputContainer}
      >
        <Text style={styles.label}>{label}</Text>
        <Shadow distance={5} startColor={'#00000010'} offset={[0, 3]}>
          <AnimatedTextInput
            style={[
              styles.input,
              !editable && styles.disabledInput
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            editable={editable}
            placeholderTextColor="#666"
            onFocus={() => {
              inputScale.value = withSpring(1.02);
            }}
            onBlur={() => {
              inputScale.value = withSpring(1);
            }}
          />
        </Shadow>
      </Animated.View>
    );
  };

  const renderLocationInput = (index: number) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(100 * index).springify()}
        style={styles.inputContainer}
      >
        <Text style={styles.label}>LOCATION (DISTRICT)</Text>
        <Shadow distance={5} startColor={'#00000010'} offset={[0, 3]}>
          <View style={styles.locationContainer}>
            <AnimatedTextInput
              style={[styles.locationInput]}
              value={userDetails.location}
              onChangeText={(text) => setUserDetails(prev => ({ ...prev, location: text }))}
              placeholder="Enter your location"
              placeholderTextColor="#666"
              onFocus={getCurrentLocation}
              editable={!isLocationLoading}
            />
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLocationLoading}
            >
              {isLocationLoading ? (
                <ActivityIndicator size="small" color="#28a745" />
              ) : (
                <Ionicons name="location" size={24} color="#28a745" />
              )}
            </TouchableOpacity>
          </View>
        </Shadow>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#A0E8AF', '#3AB795']}
        start={{ x: 0.064, y: 0 }}
        end={{ x: 0.609, y: 1 }}
        style={styles.container}
      >
        <StatusBar style="light" backgroundColor="#28a745" />
        
        <View style={styles.headerContainer}>
          <Shadow 
            distance={6} 
            startColor={'#00000020'} 
            offset={[0, 3]}
            style={styles.headerShadow}
          >
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
              <LinearGradient
                colors={['#28a745', '#218838']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <Text style={styles.headerText}>PROFILE</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </Shadow>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {renderInput('AGE', userDetails.age, 
            (text) => setUserDetails(prev => ({ ...prev, age: text })),
            'Enter your age', 'numeric', true, 1)}
            
          {renderInput('SEX', userDetails.sex,
            (text) => setUserDetails(prev => ({ ...prev, sex: text })),
            'Enter your sex', 'default', true, 2)}
            
          {renderInput('HEIGHT', userDetails.height,
            (text) => {
              setUserDetails(prev => ({ ...prev, height: text }));
              calculateBMI(userDetails.weight, text);
            },
            'Enter your height (cm)', 'numeric', true, 3)}
            
          {renderInput('WEIGHT', userDetails.weight,
            (text) => {
              setUserDetails(prev => ({ ...prev, weight: text }));
              calculateBMI(text, userDetails.height);
            },
            'Enter your weight (kg)', 'numeric', true, 4)}
            
          {renderInput('CALCULATED BMI', userDetails.bmi,
            () => {}, 'Your BMI will appear here', 'default', false, 5)}
            
          {renderLocationInput(6)}
        </ScrollView>

        <Animated.View 
          style={styles.buttonContainer}
          entering={FadeInUp.springify()}
        >
          <TouchableOpacity 
            style={styles.button}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    backgroundColor: '#28a745',
  },
  headerShadow: {
    width: '100%',
  },
  header: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  headerGradient: {
    width: '100%',
    height: 90,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter',
    fontWeight: '700',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter',
    fontWeight: '800',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    width: width - 32,
    alignSelf: 'center',
    color: '#000000',
  },
  disabledInput: {
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: width * 0.35,
    height: 45,
    justifyContent: 'center',
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
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter',
    fontWeight: '800',
    fontSize: 24,
    color: '#58CC02',
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
    width: width - 32,
    alignSelf: 'center',
  },
  locationInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  locationButton: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
}); 