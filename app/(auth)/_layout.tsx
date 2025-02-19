import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login"
        options={{
          title: 'Login',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="register"
        options={{
          title: 'Register',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="forgot-password"
        options={{
          title: 'Forgot Password',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
} 