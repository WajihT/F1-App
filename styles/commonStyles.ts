import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#FF0000',      // F1 Red
  secondary: '#1a1a1a',    // Dark Gray
  accent: '#ffffff',       // White
  background: '#0f0f0f',   // Very Dark Gray
  backgroundAlt: '#1a1a1a', // Dark Gray
  text: '#ffffff',         // White
  textSecondary: '#cccccc', // Light Gray
  grey: '#666666',         // Medium Gray
  card: '#1a1a1a',         // Dark Gray
  success: '#00ff00',      // Green
  warning: '#ffaa00',      // Orange
  border: '#333333',       // Border Gray
  darkCard: '#111112', // Dark Card Background
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({

    input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundAlt,
  },
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
		marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    fontFamily: 'Roboto_600SemiBold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'Roboto_400Regular',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Roboto_400Regular',
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },
  header: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Roboto_700Bold',
  },
});