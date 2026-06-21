import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerAnimWrapper: {
    position: 'absolute',
    top: moderateScale(0),
    left: moderateScale(0),
    right: moderateScale(0),
    zIndex: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 101, 52, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(19),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginLeft: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl + 40,
  },
  imageCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(250),
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: '80%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginLeft: moderateScale(4),
  },
  stockWarning: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
  },
  name: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    lineHeight: rf(26),
    marginBottom: moderateScale(4),
  },
  unit: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  priceLayout: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discountPrice: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  originalPrice: {
    fontSize: theme.typography.sizes.md,
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  savingsLabel: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.md,
  },
  savingsText: {
    color: theme.colors.accent,
    fontSize: rf(10),
    fontWeight: theme.typography.weights.bold,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.sizes.sm + 1,
    color: theme.colors.textSecondary,
    lineHeight: rf(22),
  },
  trustContainer: {
    backgroundColor: '#F0FDF4', // Extremely soft green background
    borderWidth: 1,
    borderColor: '#DCFCE7', // Very light green border
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md + 2,
    marginTop: theme.spacing.sm,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md + 2,
  },
  trustRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#DCFCE7', // Green circle wrapper for the icon
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: moderateScale(2), // Align icon circle with the first line of text
  },
  trustTextContainer: {
    flex: 1,
  },
  trustFeatureTitle: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: moderateScale(2),
  },
  trustFeatureDesc: {
    fontSize: theme.typography.sizes.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: rf(16),
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: moderateScale(0),
    left: moderateScale(0),
    right: moderateScale(0),
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  stickyPriceLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  stickyPriceText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: moderateScale(2),
  },
  stickyQuantityControl: {
    width: moderateScale(130),
    height: moderateScale(44),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsScroll: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockText: {
    color: '#FFFFFF',
    backgroundColor: theme.colors.error || '#EF4444',
    fontSize: rf(14),
    fontWeight: '800',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(6),
    letterSpacing: 0.5,
  },
  disabledStickyButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: theme.borderRadius.sm,
    width: moderateScale(130),
    height: moderateScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledStickyButtonText: {
    color: '#94A3B8',
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.5,
  },
});
