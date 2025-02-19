// @ts-ignore
import { StyleSheet, TouchableOpacity, Platform, Alert, Dimensions, ScrollView, View, Pressable, Image, Switch, Text } from 'react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

// Theme Configuration
const theme = {
  light: {
    primary: '#2E7D32',
    secondary: '#1976D2',
    accent: '#9C27B0',
    warning: '#F57C00',
    background: ['#FFFFFF', '#F5F5F5'] as const,
    surface: ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)'] as const,
    text: {
      primary: '#212121',
      secondary: '#424242',
      tertiary: 'rgba(33, 33, 33, 0.6)',
    },
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.12)',
    danger: '#D32F2F',
    success: '#2E7D32',
  },
  dark: {
    primary: '#4CAF50',
    secondary: '#42A5F5',
    accent: '#BA68C8',
    warning: '#FFA726',
    background: ['#121212', '#1E1E1E'] as const,
    surface: ['rgba(30, 30, 30, 0.98)', 'rgba(30, 30, 30, 0.95)'] as const,
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      tertiary: 'rgba(255, 255, 255, 0.7)',
    },
    card: '#1E1E1E',
    border: 'rgba(255, 255, 255, 0.12)',
    danger: '#EF5350',
    success: '#4CAF50',
  },
};

// Reusable Components
interface MenuItemProps {
  icon: keyof typeof FontAwesome.glyphMap | keyof typeof Ionicons.glyphMap;
  iconType?: 'Ionicons' | 'FontAwesome';
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  isToggled?: boolean;
  isDanger?: boolean;
  delay?: number;
}

const MenuItem = ({
  icon,
  iconType = 'FontAwesome',
  title,
  subtitle,
  value,
  onPress,
  isToggle,
  isToggled,
  isDanger,
  delay = 0,
}: MenuItemProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPressed, setIsPressed] = useState(false);
  const colors = isDark ? theme.dark : theme.light;
  const hapticFeedback = useHapticFeedback();

  const scaleAnimation = useSharedValue(1);
  const opacityAnimation = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
    opacity: opacityAnimation.value,
  }));

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    hapticFeedback.impactAsync(hapticFeedback.ImpactFeedbackStyle.Light);
    scaleAnimation.value = withSpring(0.98, {
      mass: 0.5,
      damping: 12,
      stiffness: 100
    });
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    scaleAnimation.value = withSpring(1, {
      mass: 0.5,
      damping: 12,
      stiffness: 100
    });
  }, []);

  const IconComponent = iconType === 'Ionicons' ? Ionicons : FontAwesome;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().duration(400)}
      style={[animatedStyle, styles.menuItemContainer]}
    >
      <Pressable
        accessible={true}
        accessibilityRole={isToggle ? "switch" : "button"}
        accessibilityState={{ 
          checked: isToggle ? isToggled : undefined,
          disabled: !onPress
        }}
        accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}${value ? `, ${value}` : ''}`}
        accessibilityHint={isToggle ? `Double tap to ${isToggled ? 'disable' : 'enable'} ${title}` : `Double tap to open ${title}`}
        style={[
          styles.menuItem,
          isDanger && { backgroundColor: `${colors.danger}10` },
          { borderColor: colors.border }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={colors.surface}
          style={StyleSheet.absoluteFill}
        />
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: `${colors.primary}15` }
          ]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          <IconComponent
            name={icon as any}
            size={20}
            color={isDanger ? colors.danger : colors.primary}
          />
        </View>
        
        <View style={styles.menuItemContent}>
          <ThemedText 
            style={[
              styles.menuItemTitle,
              isDanger && { color: colors.danger }
            ]}
            accessibilityRole="header"
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText 
              style={styles.menuItemSubtitle}
              accessibilityRole="text"
            >
              {subtitle}
            </ThemedText>
          )}
        </View>

        {isToggle ? (
          <Switch
            value={isToggled}
            onValueChange={onPress}
            trackColor={{ 
              false: isDark ? '#3A3A3A' : '#E0E0E0',
              true: `${colors.primary}50`
            }}
            thumbColor={isToggled ? colors.primary : isDark ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor={isDark ? '#3A3A3A' : '#E0E0E0'}
            accessibilityRole="switch"
            accessibilityState={{ checked: isToggled }}
          />
        ) : value ? (
          <View 
            style={styles.valueContainer}
            accessibilityElementsHidden={true}
          >
            <ThemedText style={styles.valueText}>{value}</ThemedText>
            <IconComponent name={'chevron-right' as any} size={16} color={colors.text.tertiary} />
          </View>
        ) : (
          <IconComponent 
            name={'chevron-right' as any}
            size={16} 
            color={colors.text.tertiary}
            accessibilityElementsHidden={true}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const Section = ({ title, children, delay = 0 }: SectionProps) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.section}
  >
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </Animated.View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.dark : theme.light;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  const [useMetricSystem, setUseMetricSystem] = useState(true);

  // Update system UI colors when theme changes
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(darkMode ? colors.background[0] : colors.background[0]);
      NavigationBar.setButtonStyleAsync(darkMode ? 'light' : 'dark');
    }
  }, [darkMode]);

  // Sync darkMode state with system theme
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
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
  }, [router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => router.replace('/')
        }
      ]
    );
  }, [router]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <ScrollView
        style={[styles.scrollView]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + Math.min(width * 0.02, 8),
            paddingBottom: insets.bottom + Math.min(width * 0.1, 40) 
          }
        ]}
      >
        <Section title="Profile" delay={100}>
          <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require('@/assets/images/default-avatar.png')}
                style={styles.profileImage}
              />
              <TouchableOpacity 
                style={[styles.editPhotoButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.profileName}>John Doe</ThemedText>
            <ThemedText style={styles.profileEmail}>john.doe@example.com</ThemedText>
            <TouchableOpacity 
              style={[styles.editProfileButton, { backgroundColor: `${colors.primary}15` }]}
            >
              <FontAwesome name="pencil" size={16} color={colors.primary} />
              <ThemedText style={[styles.editProfileText, { color: colors.primary }]}>
                Edit Profile
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="Preferences" delay={200}>
          <MenuItem
            icon="bell"
            title="Notifications"
            subtitle="Manage your notifications"
            isToggle
            isToggled={notifications}
            onPress={() => setNotifications(!notifications)}
          />
          <MenuItem
            icon={darkMode ? "moon-o" : "sun-o"}
            title="Dark Mode"
            subtitle="Switch app theme"
            isToggle
            isToggled={darkMode}
            onPress={toggleTheme}
          />
          <MenuItem
            icon="balance-scale"
            title="Measurement System"
            subtitle="Choose your preferred units"
            isToggle
            isToggled={useMetricSystem}
            onPress={() => setUseMetricSystem(!useMetricSystem)}
          />
        </Section>

        <Section title="Account" delay={300}>
          <MenuItem
            icon="user"
            title="Personal Information"
            onPress={() => {}}
          />
          <MenuItem
            icon="lock"
            title="Security"
            subtitle="Password and authentication"
            onPress={() => {}}
          />
          <MenuItem
            icon="credit-card"
            title="Payment Methods"
            onPress={() => {}}
          />
        </Section>

        <Section title="Support" delay={400}>
          <MenuItem
            icon="question-circle"
            title="Help Center"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-text"
            title="Terms of Service"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield"
            title="Privacy Policy"
            onPress={() => {}}
          />
          <MenuItem
            icon="info-circle"
            title="About"
            value="Version 1.0.0"
            onPress={() => {}}
          />
        </Section>

        <TouchableOpacity
          style={[styles.logoutButton, { marginTop: 20, backgroundColor: colors.danger }]}
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <ThemedText style={[styles.deleteAccountText, { color: colors.danger }]}>
            Delete Account
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Math.min(width * 0.05, 20),
  },
  section: {
    marginBottom: Math.min(width * 0.06, 24),
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '600',
    marginBottom: Math.min(width * 0.04, 16),
    marginLeft: Math.min(width * 0.03, 12),
    opacity: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  sectionContent: {
    borderRadius: Math.min(width * 0.04, 16),
    overflow: 'hidden',
  },
  menuItemContainer: {
    marginBottom: Math.min(width * 0.025, 10),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Math.min(width * 0.04, 16),
    backgroundColor: '#FFFFFF',
    borderRadius: Math.min(width * 0.0375, 15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: Math.min(width * 0.125, 50),
    height: Math.min(width * 0.125, 50),
    borderRadius: Math.min(width * 0.0625, 25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: Math.min(width * 0.04, 16),
  },
  menuItemTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  menuItemSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
    marginTop: Math.min(width * 0.005, 2),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
    marginRight: Math.min(width * 0.02, 8),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  profileCard: {
    alignItems: 'center',
    padding: Math.min(width * 0.06, 24),
    borderRadius: Math.min(width * 0.04, 16),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Math.min(width * 0.04, 16),
  },
  profileImage: {
    width: Math.min(width * 0.25, 100),
    height: Math.min(width * 0.25, 100),
    borderRadius: Math.min(width * 0.125, 50),
  },
  editPhotoButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: Math.min(width * 0.08, 32),
    height: Math.min(width * 0.08, 32),
    borderRadius: Math.min(width * 0.04, 16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    marginBottom: Math.min(width * 0.01, 4),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  profileEmail: {
    fontSize: Math.min(width * 0.04, 16),
    opacity: 0.7,
    marginBottom: Math.min(width * 0.04, 16),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.min(width * 0.04, 16),
    paddingVertical: Math.min(width * 0.02, 8),
    borderRadius: Math.min(width * 0.05, 20),
  },
  editProfileText: {
    marginLeft: Math.min(width * 0.02, 8),
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Math.min(width * 0.04, 16),
    borderRadius: Math.min(width * 0.0375, 15),
    marginHorizontal: Math.min(width * 0.03, 12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    marginLeft: Math.min(width * 0.03, 12),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  deleteAccountButton: {
    alignItems: 'center',
    padding: Math.min(width * 0.04, 16),
    marginTop: Math.min(width * 0.02, 8),
  },
  deleteAccountText: {
    fontSize: Math.min(width * 0.035, 14),
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
});
