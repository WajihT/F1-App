import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  ViewStyle,
} from 'react-native';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
  glassmorphism?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  delay = 0,
  glassmorphism = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.animation.timing.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: theme.animation.timing.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <Animated.View
      style={[
        styles.container,
        glassmorphism && styles.glassmorphism,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {glassmorphism && (
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  glassmorphism: {
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    overflow: 'hidden',
  },
});