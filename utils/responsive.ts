import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (you can adjust these based on your design)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const getResponsiveWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const getResponsiveHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const getResponsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.max(12, PixelRatio.roundToNearestPixel(newSize));
};

export const getHorizontalPadding = (percentage: number = 4): number => {
  return Math.max(12, SCREEN_WIDTH * (percentage / 100));
};

export const getResponsiveSpacing = (baseSpacing: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.2);
  return Math.max(8, baseSpacing * scale);
};

export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 375;
};

export const isMediumScreen = (): boolean => {
  return SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
};

export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH >= 414;
};

export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen(),
  isMedium: isMediumScreen(),
  isLarge: isLargeScreen(),
};