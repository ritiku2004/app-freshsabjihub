import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

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
    paddingTop: moderateScale(22),
    paddingBottom: moderateScale(22),
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
  subcategoriesBar: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subcategoriesScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  subcategoryPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: moderateScale(6),
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.lightGray,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subcategoryPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  subcategoryText: {
    fontSize: theme.typography.sizes.xs + 1,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  subcategoryTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  sortFilterBar: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sortLabel: {
    fontSize: rf(11),
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  sortScroll: {
    flex: 1,
  },
  sortBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: moderateScale(4),
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: moderateScale(6),
  },
  sortBadgeActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  sortBadgeText: {
    fontSize: rf(10),
    color: theme.colors.textSecondary,
  },
  sortBadgeTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  productsGrid: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    marginTop: moderateScale(50),
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  filterOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterOptionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
  },
  filterOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
});
