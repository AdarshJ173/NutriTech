import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Platform, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const Colors = {
  light: {
    primary: '#2E7D32',
    tint: '#4CAF50',
    background: '#FFFFFF',
    text: '#1A1A1A',
    secondaryText: '#666666',
    inactive: '#9E9E9E',
    card: '#FFFFFF',
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Custom tab button component to fix React Hook usage
const TabButton = (props: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(props.accessibilityState?.selected ? 1.1 : 1, {
            damping: 15,
            mass: 1,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, animatedStyle]}
    />
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.inactive,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 0,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginBottom: Platform.OS === 'ios' ? 12 : 8,
        },
        tabBarButton: (props) => <TabButton {...props} />,
      })}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: 'Meal Plan',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="government-schemes"
        options={{
          title: 'Schemes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="policy" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prepare-plan"
        options={{
          title: 'Prepare Plan',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cutlery" size={size - 2} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="line-chart" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cog" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
