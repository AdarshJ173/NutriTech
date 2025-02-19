// @ts-ignore
import { StyleSheet, TouchableOpacity, Platform, Alert, Dimensions, ScrollView, View, Pressable } from 'react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isToggle?: boolean;
  isToggled?: boolean;
  isDanger?: boolean;
  delay?: number;
}

const SettingItem = ({ icon, title, subtitle, onPress, isToggle, isToggled, isDanger, delay = 0 }: SettingItemProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isPressed ? 0.98 : 1) }],
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={animatedStyle}
    >
      <Pressable
        style={[
          styles.settingItem,
          isDanger && styles.dangerItem,
          isDark && styles.settingItemDark
        ]}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
      >
        <LinearGradient
          colors={isDark ? 
            ['rgba(42, 42, 42, 0.9)', 'rgba(58, 58, 58, 0.9)'] : 
            ['rgba(255, 255, 255, 0.9)', 'rgba(245, 245, 245, 0.9)']}
          style={StyleSheet.absoluteFill}
        />
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.settingContent}>
          <View style={[
            styles.iconContainer,
            isDark && styles.iconContainerDark
          ]}>
            <Ionicons
              name={icon}
              size={24}
              color={isDanger ? '#FF3B30' : isDark ? '#FFFFFF' : '#000000'}
            />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={[styles.title, isDanger && styles.dangerText]}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            )}
          </View>
          {isToggle ? (
            <Animated.View entering={SlideInRight.delay(delay + 200)}>
              <Ionicons
                name={isToggled ? "checkmark-circle" : "ellipse-outline"}
                size={28}
                color={isToggled ? '#4CAF50' : isDark ? '#FFFFFF' : '#000000'}
                style={styles.toggleIcon}
              />
            </Animated.View>
          ) : (
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => router.replace('/')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => router.replace('/')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? 
          ['#1A1A1A', '#2D2D2D'] : 
          ['#F4F6F8', '#E8ECF0']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[
        styles.headerContainer, 
        { 
          paddingTop: insets.top + 20,
          backgroundColor: isDark ? '#1A1A1A' : '#F4F6F8'
        }
      ]}>
        <Animated.View 
          entering={FadeIn.delay(100)} 
          style={styles.header}
        >
          <ThemedText style={styles.headerText}>Settings</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Customize your experience</ThemedText>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 }
        ]}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account & Preferences</ThemedText>
          <SettingItem
            icon="person-circle-outline"
            title="Profile"
            subtitle="Manage your personal information"
            delay={100}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Control your notification preferences"
            isToggle
            isToggled={notifications}
            onPress={() => setNotifications(!notifications)}
            delay={200}
          />
          <SettingItem
            icon={darkMode ? "moon-outline" : "sunny-outline"}
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            isToggle
            isToggled={darkMode}
            onPress={() => setDarkMode(!darkMode)}
            delay={300}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="Choose your preferred language"
            delay={400}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Manage your privacy settings"
            delay={500}
          />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get assistance and support"
            delay={600}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Actions</ThemedText>
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            delay={700}
          />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            isDanger
            onPress={handleDeleteAccount}
            delay={800}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    width: width,
    paddingBottom: 16,
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerText: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    paddingTop: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 12,
    opacity: 0.8,
  },
  settingItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingItemDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  dangerItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  dangerText: {
    color: '#FF3B30',
  },
  toggleIcon: {
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  version: {
    fontSize: 13,
    opacity: 0.4,
  },
});
