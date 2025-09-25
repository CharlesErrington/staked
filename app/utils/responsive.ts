import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device size categories
export const DeviceSize = {
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  isTablet: screenWidth >= 768,
} as const;

// Responsive scaling functions
export const responsive = {
  // Scale based on device width (for horizontal elements)
  wp: (percentage: number) => {
    return PixelRatio.roundToNearestPixel((screenWidth * percentage) / 100);
  },
  
  // Scale based on device height (for vertical elements)
  hp: (percentage: number) => {
    return PixelRatio.roundToNearestPixel((screenHeight * percentage) / 100);
  },
  
  // Scale font size based on device
  fontSize: (size: number) => {
    const scale = screenWidth / 375; // Base iPhone SE width
    const newSize = size * Math.min(scale, 1.4); // Cap scaling at 1.4x
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  },
  
  // Scale spacing/padding based on device
  spacing: (size: number) => {
    const scale = screenWidth / 375;
    return Math.round(PixelRatio.roundToNearestPixel(size * Math.min(scale, 1.3)));
  },
};

// Breakpoint utilities
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const useBreakpoint = () => {
  if (screenWidth >= breakpoints.xl) return 'xl';
  if (screenWidth >= breakpoints.lg) return 'lg';
  if (screenWidth >= breakpoints.md) return 'md';
  if (screenWidth >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Responsive value selector
export function responsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T {
  const breakpoint = useBreakpoint();
  
  switch (breakpoint) {
    case 'xl':
      return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs ?? values.default;
    case 'lg':
      return values.lg ?? values.md ?? values.sm ?? values.xs ?? values.default;
    case 'md':
      return values.md ?? values.sm ?? values.xs ?? values.default;
    case 'sm':
      return values.sm ?? values.xs ?? values.default;
    default:
      return values.xs ?? values.default;
  }
}

// Common responsive patterns
export const responsiveStyles = {
  // Container with responsive padding
  container: {
    paddingHorizontal: responsiveValue({
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      default: 16,
    }),
  },
  
  // Responsive grid columns
  gridCols: responsiveValue({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    default: 1,
  }),
  
  // Responsive text sizes
  textSize: {
    xs: responsive.fontSize(12),
    sm: responsive.fontSize(14),
    base: responsive.fontSize(16),
    lg: responsive.fontSize(18),
    xl: responsive.fontSize(20),
    '2xl': responsive.fontSize(24),
    '3xl': responsive.fontSize(30),
    '4xl': responsive.fontSize(36),
  },
};

// Safe area utilities
export const safeAreaInsets = {
  top: 44, // Default iOS status bar
  bottom: 34, // Default iOS home indicator
};

// Orientation utilities
export const isPortrait = () => screenHeight > screenWidth;
export const isLandscape = () => screenWidth > screenHeight;

// Platform-specific responsive utilities
import { Platform } from 'react-native';

export const platformStyles = <T extends Record<string, any>>(styles: {
  ios?: T;
  android?: T;
  default: T;
}): T => {
  return Platform.select({
    ios: styles.ios ?? styles.default,
    android: styles.android ?? styles.default,
    default: styles.default,
  }) as T;
};