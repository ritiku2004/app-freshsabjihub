import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: moderateScale(22),
    paddingBottom: moderateScale(22),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 1000,
    elevation: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm + 2,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  addressInfo: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  addressLabel: {
    fontSize: theme.typography.sizes.xs - 1,
    fontWeight: theme.typography.weights.bold,
    color: '#DCFCE7', // Light green tint
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  addressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(1),
  },
  addressText: {
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginRight: moderateScale(4),
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
  },
  searchBarCurvy: {
    borderRadius: moderateScale(8),
    height: moderateScale(54),
    backgroundColor: theme.colors.white,
    borderWidth: 0,
    paddingHorizontal: theme.spacing.md + 4,
    ...theme.shadows.md,
  },
  searchResultsList: {
    position: 'absolute',
    top: moderateScale(60),
    left: moderateScale(0),
    right: moderateScale(0),
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 350,
    zIndex: 1000,
    ...theme.shadows.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchResultImage: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  searchResultName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  searchResultPrice: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  // Banners Carousel
  bannersContainer: {
    marginTop: theme.spacing.md,
  },
  bannerCard: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    height: moderateScale(130),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1.2,
    justifyContent: 'center',
  },
  bannerSubtitle: {
    fontSize: rf(10),
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: moderateScale(4),
  },
  bannerTitle: {
    fontSize: theme.typography.sizes.lg - 2,
    fontWeight: theme.typography.weights.bold,
    lineHeight: rf(20),
    marginBottom: moderateScale(4),
  },
  bannerDesc: {
    fontSize: rf(10),
    opacity: 0.8,
  },
  bannerRight: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  carouselIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  carouselDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: theme.colors.border,
    marginHorizontal: moderateScale(3),
  },
  carouselDotActive: {
    backgroundColor: theme.colors.primary,
    width: moderateScale(12),
  },
  // Categories Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg + 4,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg - 2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.sm,
  },
  categoryCircleCard: {
    width: '25%', // 4 columns
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: moderateScale(4),
  },
  categoryImageContainer: {
    width: moderateScale(58),
    height: moderateScale(58),
    borderRadius: moderateScale(29),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: moderateScale(6),
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  categoryCircleImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(29),
  },
  categoryCircleName: {
    fontSize: rf(11),
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: rf(14),
  },
  // Products Row
  productsHorizontalScroll: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  horizontalCardWrapper: {
    width: moderateScale(140),
    marginRight: theme.spacing.md,
  },
});
