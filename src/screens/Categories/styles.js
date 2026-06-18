import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Premium off-white background
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
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 101, 52, 0.2)',
  },
  headerTitle: {
    fontSize: rf(19),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: theme.spacing.md,
    borderWidth: 0, // Borderless card
    // Premium soft card shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rowImageContainer: {
    width: moderateScale(76), // Restored large width
    height: moderateScale(76), // Restored large height
    borderRadius: moderateScale(14), // Matches large size
    backgroundColor: theme.colors.primary, // Dark green matching header
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0, // Borderless container
    marginRight: theme.spacing.md,
  },
  rowImage: {
    width: '85%', // Sized inside large backing
    height: '85%',
    borderRadius: moderateScale(10), // Rounded corners for image
  },
  rowTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rowName: {
    fontSize: rf(14.5), // Restored large name font
    fontWeight: '700',
    color: '#1E293B', // Slate 800
  },
  rowSubtitle: {
    fontSize: rf(11.5), // Restored large subtitle font
    fontWeight: '600',
    color: theme.colors.primary, // Primary green link
    marginTop: moderateScale(2),
  },
  rowActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: moderateScale(8),
  },
  chevronCircle: {
    width: moderateScale(30), // Restored large action button
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
