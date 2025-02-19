import * as Haptics from 'expo-haptics';

export const useHapticFeedback = () => {
  return {
    impactAsync: Haptics.impactAsync,
    ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
    notificationAsync: Haptics.notificationAsync,
    NotificationFeedbackType: Haptics.NotificationFeedbackType,
    selectionAsync: Haptics.selectionAsync,
  };
}; 