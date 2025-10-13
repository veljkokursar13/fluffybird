import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export const backgroundGradient = {
  bgGradientTop: '#3a1c71',
  bgGradientUpperMid: '#ff5f6d',
  bgGradientLowerMid: '#ffc371',
  bgGradientBottom: '#fffacd',
};
// Color Palette
export const colors = {
  // Primary Game Colors
  primary: '#FFD700', // Golden yellow for fancy buttons
  primaryDark: '#FFA500', // Darker yellow for pressed states
  secondary: '#4CAF50', // Green for play buttons
  secondaryDark: '#45a049',
  white: '#FFFFFF',
  black: '#000000',
  


  
  // UI Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  success: '#4CAF50',
  danger: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#0b1020',
  textMuted: '#666666',
  
  // Shadow Colors
  shadowColor: '#000000',
};

// Typography Scale
export const typography = {
  fontFamily: {
    primary: 'fff-forward.regular',
    system: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 52,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  pill: 25,
};

// Shadow Presets
export const shadows = {
  sm: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Screen Dimensions
export const layout = {
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 375,
  isLargeScreen: screenWidth > 414,
};

// Base Styles
export const baseStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    position: 'absolute',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  
  // Background Styles
  backgroundSky: {
    backgroundColor: backgroundGradient.bgGradientTop,
    position: 'absolute',
  },
  backgroundDark: {
    backgroundColor: backgroundGradient.bgGradientUpperMid,
  },
  backgroundWhite: {
    backgroundColor: backgroundGradient.bgGradientLowerMid,
    position: 'absolute',
  },
  
  // Text Styles
  textBase: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  textTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: 68,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    zIndex: 1,
    position: 'absolute',
    marginTop: spacing['6xl'] * 2,
    // Ensure full-width for centering and add breathing room
    left: 0,
    right: 0,
    alignSelf: 'center',
    lineHeight: spacing['6xl'] * 2,
    backgroundColor: 'transparent',
    includeFontPadding: false,
    // 3D look via shadow (subtle outline + drop shadow)
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 2,
  },
  
  textSubtitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
    textAlign: 'center',
      position: 'absolute',
  },
  textButton: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    position: 'absolute',
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    position: 'absolute',
  },
});

// Button Styles (Fancy Yellow Pill Design)
export const buttonStyles = StyleSheet.create({
  // Base Button Container
  fancyButton: {
    position: 'relative',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
    minWidth: 150,
    backgroundColor: colors.primary,
    ...shadows.lg,
    // Fancy gradient-like effect with border
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  
  fancyButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.95 }],
    ...shadows.md,
  },
  
  fancyButtonText: {
    ...baseStyles.textButton,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  
  // Standard Green Button
  primaryButton: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.secondary,
    ...shadows.md,
    minWidth: 150,
  },
  
  primaryButtonPressed: {
    backgroundColor: colors.secondaryDark,
    transform: [{ scale: 0.95 }],
  },
  
  primaryButtonText: {
    ...baseStyles.textButton,
    color: colors.textPrimary,
  },
  
  // Small Button (for pause, etc.)
  smallButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: backgroundGradient.bgGradientBottom,
    ...shadows.sm,
  },
  
  smallButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  
  smallButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Link-style button
  linkButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: 'absolute',
  },
  
  linkButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
    position: 'absolute',
  },
});

// Overlay Styles
export const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
    zIndex: 1000,
    // Ensure top-most on Android too
    elevation: 1000,
    // Intercept touches so the game underneath doesn't receive them
    pointerEvents: 'auto',
  },
  
  modal: {
    
    borderRadius: borderRadius.xl,
    padding: spacing['3xl'],
    margin: spacing.xl,
    ...shadows.xl,
    minWidth: screenWidth * 0.8,
  },
  
  modalTitle: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.primary,
    
    
  
  },
  
  modalContent: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
  },
  
  verticalButtonContainer: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
});
//sun styles
export const sunStyles = StyleSheet.create({
  sun: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
// HUD Styles
export const hudStyles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: spacing['5xl'],
    zIndex: 10,
  },
  
  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing['2xl'],
  },
  
  scoreContainer: {
    backgroundColor: 'transparent',
    // Slightly more padding for better touch target and legibility
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    paddingTop: spacing.md,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scoreText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.white,
    // Use the app font family
    fontFamily: typography.fontFamily.primary,
    includeFontPadding: false,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Game-specific Styles
export const gameStyles = StyleSheet.create({
  gameContainer: {
    flex: 1,
  },

  gameArea: {
    flex: 1,
  },

  tapCatcher: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 8,
  },

  iconRow: {
    position: 'absolute',
    right: 12,
    top: spacing['5xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconRight: {
    marginLeft: 12,
  },

  iconText: {
    fontSize: 22,
    color: backgroundGradient.bgGradientBottom,
  },
  
  titleContainer: {
    marginTop: screenHeight * 0.15,
    alignItems: 'center',
  },
  
  menuButtonContainer: {
    position: 'absolute',
    bottom: screenHeight * 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

// Utility Functions
export const createButtonStyle = (variant: 'fancy' | 'primary' | 'small' = 'primary') => {
  switch (variant) {
    case 'fancy':
      return buttonStyles.fancyButton;
    case 'small':
      return buttonStyles.smallButton;
    default:
      return buttonStyles.primaryButton;
  }
};

// Safe Area Styles
export const safeAreaStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

// Subtitle Styles
export const subtitleStyles = StyleSheet.create({
  textSubtitle: {
    ...baseStyles.textSubtitle,
    marginTop: spacing.lg,
    position: 'absolute',
  },
});

export const createTextStyle = (variant: 'title' | 'subtitle' | 'button' | 'small' | 'base' = 'base') => {
  switch (variant) {
    case 'title':
      return baseStyles.textTitle;
    case 'subtitle':
      return baseStyles.textSubtitle;
    case 'button':
      return baseStyles.textButton;
    case 'small':
      return baseStyles.textSmall;
    default:
      return baseStyles.textBase;
  }
};