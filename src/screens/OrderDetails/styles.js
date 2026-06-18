import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  // Animated wrapper for scroll-based fade/slide
  headerAnimWrapper: {
    position: 'absolute',
    top: moderateScale(0),
    left: moderateScale(0),
    right: moderateScale(0),
    zIndex: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: moderateScale(22),
    paddingBottom: moderateScale(22),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 101, 52, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(19),
    fontWeight: '800',
    color: theme.colors.white,
    marginLeft: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + 20,
  },
  // Status Tracker Card
  trackerCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  trackerTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  timeline: {
    marginTop: theme.spacing.xs,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: moderateScale(20),
  },
  timelineDot: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: theme.colors.border,
    borderWidth: 2,
    borderColor: theme.colors.white,
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  timelineLine: {
    width: moderateScale(2),
    flex: 1,
    backgroundColor: theme.colors.border,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  stepTitleActive: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: moderateScale(2),
  },
  // Details Card
  detailsCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.xl,
  },
  // Items Card
  itemsCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemImageWrapper: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderRadius: moderateScale(8),
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: theme.spacing.md,
  },
  itemImage: {
    width: '85%',
    height: '85%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  itemMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: moderateScale(2),
  },
  itemTotal: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  // Bill Details Card
  billCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  billLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  billValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  billValueDiscount: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  billDivider: {
    height: moderateScale(1),
    backgroundColor: '#F3F4F6',
    marginVertical: theme.spacing.sm,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  billTotalValue: {
    fontSize: theme.typography.sizes.md + 1,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  paymentWarningCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  paymentWarningTitle: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: theme.spacing.xs,
  },
  paymentWarningSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: '#B45309',
    lineHeight: 18,
  },
  footerContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: rf(15),
    fontWeight: '800',
  },
});
