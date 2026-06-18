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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: rf(19),
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    width: '25%', // 4 columns
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    width: moderateScale(58),
    height: moderateScale(58),
    borderRadius: moderateScale(29), // Circle
    backgroundColor: '#F1F5F9', // Light modern background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: rf(11),
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: rf(14),
    paddingHorizontal: moderateScale(2),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
