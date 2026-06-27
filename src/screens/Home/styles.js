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
  searchBarCurvyButton: {
    borderRadius: moderateScale(8),
    height: moderateScale(46),
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md + 4,
    position: 'relative',
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
    width: '23%', // 4 columns
    marginHorizontal: '1%',
    backgroundColor: theme.colors.primary, // Dark green matching header
    borderRadius: moderateScale(16), // Extra rounded premium corners
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 3.0, // Twice as thick border
    borderColor: theme.colors.primary, // Same green color as card background and header
    // Premium soft shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryImageContainer: {
    width: '100%', // Spans full card width
    height: moderateScale(68), // Fixed height for image area
    backgroundColor: '#FFFFFF', // Pure white backing to make category images pop
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: moderateScale(15), // Matches parent card's outer roundness
    borderTopRightRadius: moderateScale(15),
    borderBottomLeftRadius: moderateScale(6), // Subtle roundness on bottom of image section
    borderBottomRightRadius: moderateScale(6),
    overflow: 'hidden', // Clips the image to the white section's rounded corners
  },
  categoryCircleImage: {
    width: '100%',
    height: '100%',
  },
  categoryCircleName: {
    fontSize: rf(11),
    fontWeight: '800',
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: rf(14),
    paddingHorizontal: moderateScale(2),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(8),
    width: '100%', // Span full width for text container
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

  // Trending / Best Deal special sections
  specialSectionWrapper: {
    marginTop: theme.spacing.lg + 4,
    marginBottom: theme.spacing.xs,
    borderRadius: moderateScale(16),
    marginHorizontal: theme.spacing.lg,
    overflow: 'hidden',
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg + 4,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    marginLeft: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  trendingBadgeText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bestDealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg + 4,
  },
  bestDealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    marginLeft: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bestDealBadgeText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
