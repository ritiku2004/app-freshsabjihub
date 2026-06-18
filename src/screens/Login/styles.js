import { StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { moderateScale, rf } from '../../utils/responsive';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl + 10,
  },
  logoContainer: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoImage: {
    width: moderateScale(75),
    height: moderateScale(75),
    resizeMode: 'contain',
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.xxl + 2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    height: moderateScale(50),
    width: moderateScale(65),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  countryCodeText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  footerText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: rf(18),
    paddingHorizontal: theme.spacing.md,
  },
});
