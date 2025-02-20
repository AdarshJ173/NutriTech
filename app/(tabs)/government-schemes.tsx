import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

// Colors configuration matching the app theme
const Colors = {
  light: {
    primary: '#2E7D32',
    primaryLight: '#E8F5E9',
    background: '#FFFFFF',
    surface: '#F5F7FA',
    text: '#1A1A1A',
    textSecondary: '#595959',
    border: '#E0E0E0',
    card: '#FFFFFF',
    shadow: '#000000',
  },
  dark: {
    primary: '#81C784',
    primaryLight: '#1B5E20',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#2C2C2C',
    card: '#1E1E1E',
    shadow: '#000000',
  },
};

interface UserProfile {
  name: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  bmi: string;
  location: string;
  income?: string;
  dietaryPreference?: string;
  healthConditions?: string;
}

interface Scheme {
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  url: string;
  deadline?: string;
}

const GovernmentSchemesScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfileFromFirestore = async (): Promise<UserProfile | null> => {
    try {
      // Skip Firestore if auth is not initialized
      if (!auth || !auth.currentUser) {
        return null;
      }

      const userRef = collection(db, 'users');
      const q = query(userRef, where('id', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        // Store the profile in AsyncStorage for future use
        const profile = {
          name: userData.name || '',
          age: userData.age?.toString() || '',
          sex: userData.sex || '',
          height: userData.height?.toString() || '',
          weight: userData.weight?.toString() || '',
          bmi: userData.bmi?.toString() || '',
          location: userData.location || '',
          income: userData.income?.toString(),
          dietaryPreference: userData.dietaryPreference,
          healthConditions: userData.healthConditions,
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      return null;
    }
  };

  const fetchUserProfileFromStorage = async (): Promise<UserProfile | null> => {
    try {
      const userData = await AsyncStorage.getItem('userProfile');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error fetching from AsyncStorage:', error);
      return null;
    }
  };

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      // Always try AsyncStorage first
      let profile = await fetchUserProfileFromStorage();
      if (profile) {
        setUserProfile(profile);
        return profile;
      }

      // Only try Firestore if AsyncStorage fails
      profile = await fetchUserProfileFromFirestore();
      if (profile) {
        setUserProfile(profile);
        return profile;
      }

      // If no profile is found, show error
      setError('Please complete your profile in the settings to get personalized recommendations.');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Error loading profile. Please try again.');
      return null;
    }
  };

  const fetchSchemeRecommendations = async (profile: UserProfile) => {
    const API_KEY = 'AIzaSyARKf53F1gWMLw68YHgCLG36zFL1Kunbv4'; // Using Firebase API key
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please provide a list of 5 relevant Indian government schemes in the following JSON format:
              {
                "schemes": [
                  {
                    "name": "Scheme Name",
                    "description": "Brief description",
                    "eligibility": "Bullet points of eligibility criteria",
                    "benefits": "Bullet points of benefits",
                    "url": "Official government website URL"
                  }
                ]
              }

              Consider these user details for personalization:
              - Age: ${profile.age}
              - Gender: ${profile.sex}
              - Location: ${profile.location}
              - BMI: ${profile.bmi}
              ${profile.income ? `- Income: ${profile.income}` : ''}
              ${profile.dietaryPreference ? `- Dietary Preferences: ${profile.dietaryPreference}` : ''}
              ${profile.healthConditions ? `- Health Conditions: ${profile.healthConditions}` : ''}
              
              Focus on health, nutrition, and welfare schemes. Only include official government schemes with verified information.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => null);
        console.error('API Error Details:', errorData);
        return { schemes: getDefaultSchemes() };
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.warn('Invalid API response format');
        return { schemes: getDefaultSchemes() };
      }

      try {
        const recommendationsText = data.candidates[0].content.parts[0].text;
        const recommendations = JSON.parse(recommendationsText);
        
        if (!recommendations.schemes || !Array.isArray(recommendations.schemes)) {
          console.warn('Invalid schemes format in API response');
          return { schemes: getDefaultSchemes() };
        }

        // Validate each scheme has required properties
        const validSchemes = recommendations.schemes.every(scheme => 
          scheme.name && 
          scheme.description && 
          scheme.eligibility && 
          scheme.benefits && 
          scheme.url
        );

        if (!validSchemes) {
          console.warn('Missing required properties in schemes');
          return { schemes: getDefaultSchemes() };
        }

        return recommendations;
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        return { schemes: getDefaultSchemes() };
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { schemes: getDefaultSchemes() };
    }
  };

  // Helper function to get default schemes
  const getDefaultSchemes = (): Scheme[] => [
    {
      name: "PM-JAY (Ayushman Bharat)",
      description: "Flagship health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.",
      eligibility: "• Families in bottom 40% of Indian economy\n• Based on deprivation criteria in SECC database\n• No cap on family size or age",
      benefits: "• Cashless and paperless treatment at empanelled hospitals\n• Coverage up to ₹5 lakhs per family per year\n• Includes pre and post hospitalization expenses",
      url: "https://pmjay.gov.in/",
    },
    {
      name: "PM Poshan (Mid-Day Meal Scheme)",
      description: "School meal program providing hot cooked meals to enhance nutrition levels and attendance in government schools.",
      eligibility: "• Children studying in classes I-VIII in government schools\n• Government-aided schools\n• Special training centers",
      benefits: "• Free hot cooked meals on school days\n• Nutritional support to students\n• Encourages school attendance",
      url: "https://mdm.gov.in/",
    },
    {
      name: "National Food Security Mission",
      description: "Program aimed at increasing production of rice, wheat, pulses, coarse cereals and commercial crops through area expansion and productivity enhancement.",
      eligibility: "• Small and marginal farmers\n• Focus on low-productivity regions\n• Priority to rain-fed areas",
      benefits: "• Subsidized food grains\n• Technical and financial assistance\n• Access to quality seeds",
      url: "https://www.nfsm.gov.in/",
    },
    {
      name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      description: "Direct income support scheme providing financial assistance to small and marginal farmers.",
      eligibility: "• Small and marginal farmers\n• Land holding up to 2 hectares\n• Valid bank account and KYC",
      benefits: "• ₹6,000 per year in three installments\n• Direct bank transfer\n• No intermediaries",
      url: "https://pmkisan.gov.in/",
    },
    {
      name: "National Health Mission",
      description: "Comprehensive healthcare initiative focusing on rural and urban health services.",
      eligibility: "• All citizens\n• Special focus on vulnerable groups\n• Priority to maternal and child health",
      benefits: "• Free essential healthcare services\n• Immunization programs\n• Maternal and child care",
      url: "https://nhm.gov.in/",
    }
  ];

  const loadRecommendations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const profile = await fetchUserProfile();
      
      if (!profile) {
        setError('Please complete your profile in the settings to get personalized recommendations.');
        return;
      }

      const recommendations = await fetchSchemeRecommendations(profile);
      setSchemes(recommendations.schemes);
    } catch (error) {
      console.error('Error in loadRecommendations:', error);
      // Don't show error to user if we have fallback schemes
      if (schemes.length === 0) {
        setSchemes(getDefaultSchemes());
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await loadRecommendations();
  };

  useFocusEffect(
    useCallback(() => {
      loadRecommendations();
    }, [])
  );

  const handleSchemePress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Cannot open this website. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        'Failed to open the website. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={handleRetry}
      >
        <Ionicons name="reload" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <Animated.View entering={FadeIn} style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Government Schemes
        </ThemedText>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Personalized recommendations based on your profile
        </Text>
      </Animated.View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding relevant schemes...
          </Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {schemes.map((scheme, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(index * 100)}
              style={[styles.schemeCard, { backgroundColor: colors.card }]}
            >
              <TouchableOpacity
                style={styles.schemeContent}
                onPress={() => handleSchemePress(scheme.url)}
              >
                <View style={styles.schemeHeader}>
                  <Text style={[styles.schemeName, { color: colors.text }]}>
                    {scheme.name}
                  </Text>
                  <MaterialIcons
                    name="open-in-new"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                
                <Text style={[styles.schemeDescription, { color: colors.textSecondary }]}>
                  {scheme.description}
                </Text>
                
                <View style={styles.schemeDetails}>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    Eligibility:
                  </Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {scheme.eligibility}
                  </Text>
                  
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    Benefits:
                  </Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {scheme.benefits}
                  </Text>
                  
                  {scheme.deadline && (
                    <>
                      <Text style={[styles.detailTitle, { color: colors.text }]}>
                        Deadline:
                      </Text>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {scheme.deadline}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.light.primary,
    minHeight: 120,
  },
  headerTitle: {
    color: Colors.light.background,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: Colors.light.background,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85, // Adjusted for bottom tab bar height
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  schemeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  schemeContent: {
    padding: 20,
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  schemeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  schemeDetails: {
    gap: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GovernmentSchemesScreen; 