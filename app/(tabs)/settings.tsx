// @ts-ignore
import { StyleSheet, TouchableOpacity, Platform, Alert, Dimensions, ScrollView, View, Pressable, Image, Switch, Text } from 'react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInRight, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

// Theme Configuration
const theme = {
  light: {
    primary: '#58CC02',
    secondary: '#32ADE6',
    accent: '#AF52DE',
    warning: '#FF9500',
    background: ['#F8F9FA', '#F4F6F8'] as const,
    surface: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)'] as const,
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: 'rgba(26, 26, 26, 0.5)',
    },
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.1)',
    danger: '#FF453A',
    success: '#58CC02',
  },
  dark: {
    primary: '#58CC02',
    secondary: '#32ADE6',
    accent: '#AF52DE',
    warning: '#FF9500',
    background: ['#FFFFFF', '#F8F9FA'] as const,
    surface: ['rgba(255, 255, 255, 0.95)', 'rgba(245, 245, 245, 0.9)'] as const,
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: 'rgba(26, 26, 26, 0.5)',
    },
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.1)',
    danger: '#FF453A',
    success: '#58CC02',
  },
};

// Reusable Components
interface MenuItemProps {
  icon: string;
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed ? 0.98 : 1) }],
  }));

  const IconComponent = iconType === 'Ionicons' ? Ionicons : FontAwesome;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[animatedStyle, styles.menuItemContainer]}
    >
      <Pressable
        style={[
          styles.menuItem,
          isDanger && { backgroundColor: `${colors.danger}10` },
          { borderColor: colors.border }
        ]}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
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
        
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <IconComponent
            // @ts-ignore
            name={icon}
            size={20}
            color={isDanger ? colors.danger : colors.primary}
          />
        </View>
        
        <View style={styles.menuItemContent}>
          <ThemedText style={[
            styles.menuItemTitle,
            isDanger && { color: colors.danger }
          ]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.menuItemSubtitle}>
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
          />
        ) : value ? (
          <View style={styles.valueContainer}>
            <ThemedText style={styles.valueText}>{value}</ThemedText>
            {/* @ts-ignore */}
            <IconComponent name="chevron-right" size={16} color={colors.text.tertiary} />
          </View>
        ) : (
          // @ts-ignore
          <IconComponent name="chevron-right" size={16} color={colors.text.tertiary} />
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
      NavigationBar.setBackgroundColorAsync(darkMode ? '#FFFFFF' : '#F4F6F8');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, [darkMode]);

  // Sync darkMode state with system theme
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
    // Here you would typically dispatch an action to update the app-wide theme
    // For example: dispatch(setTheme(!darkMode));
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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={[styles.headerBackground, { height: insets.top + 120 }]}
      />
      
      <View style={[
        styles.header,
        { paddingTop: insets.top + 20 }
      ]}>
        <Animated.View entering={FadeIn.delay(100)}>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            Customize your experience
          </ThemedText>
        </Animated.View>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background[0] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 }
        ]}
      >
        <Section title="Profile" delay={200}>
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

        <Section title="Preferences" delay={300}>
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

        <Section title="Account" delay={400}>
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

        <Section title="Support" delay={500}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  scrollView: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 12,
    opacity: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItemContainer: {
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
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
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPhotoButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginHorizontal: 12,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
  deleteAccountButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  deleteAccountText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Roboto',
  },
});
