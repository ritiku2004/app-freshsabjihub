import { moderateScale, rf } from '../utils/responsive';

export const theme = {
  colors: {
    primary: '#15803D',       // Darker Rich Green
    secondary: '#166534',     // Darker Forest Green
    accent: '#F59E0B',        // Orange for offers
    background: '#F8FAFC',    // Light grey-blue background
    cardBackground: '#FFFFFF',// White cards
    textPrimary: '#111827',   // Dark text
    textSecondary: '#6B7280', // Slate gray text
    success: '#15803D',       // Green success indicator
    error: '#EF4444',         // Red error/warning
    border: '#E2E8F0',        // Subtle border
    white: '#FFFFFF',
    lightGray: '#F1F5F9',
    overlay: 'rgba(0, 0, 0, 0.5)',
    primaryLight: '#DCFCE7',  // Light green tint matching new theme
    accentLight: '#FEF3C7',   // For offer labels
  },
  spacing: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
  },
  borderRadius: {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    md: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    lg: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  typography: {
    sizes: {
      xs: rf(10),
      sm: rf(12),
      md: rf(14),
      lg: rf(16),
      xl: rf(18),
      xxl: rf(22),
      xxxl: rf(28),
    },
    weights: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
  },
};
