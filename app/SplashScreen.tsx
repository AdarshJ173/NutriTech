import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.circle}>
          <Text style={styles.logoText}>NutriTech</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#58CC02',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    width: 214,
    height: 214,
    left: width / 2 - 107, // Center horizontally (214/2)
    top: height / 2 - 107, // Center vertically (214/2)
  },
  circle: {
    width: 214,
    height: 214,
    backgroundColor: '#FFFFFF',
    borderRadius: 107,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'System',
    fontWeight: '800',
    fontSize: 32,
    lineHeight: 39,
    textAlign: 'center',
    color: '#58CC02',
  },
}); 