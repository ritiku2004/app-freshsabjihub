import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5', // Soft, fresh emerald tint
    justifyContent: 'space-between',
  },

  slideList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: rf(24),
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 10,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    width: moderateScale(60),
  },
  actionTextActive: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    width: moderateScale(60),
    textAlign: 'right',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: moderateScale(8),
    width: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.border,
    marginHorizontal: moderateScale(4),
  },
  indicatorActive: {
    width: moderateScale(20),
    backgroundColor: theme.colors.primary,
  },
});
