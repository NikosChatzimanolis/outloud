import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.textPrimary : colors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.electricViolet,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.hairline + '99',
  },
  destructive: {
    backgroundColor: colors.warmRose,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: colors.textPrimary,
  },
  text_primary: {
    color: colors.textPrimary,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_destructive: {
    color: colors.midnightNavy,
  },
});

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({
  onPress,
  icon,
  style,
  disabled = false,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[iconButtonStyles.btn, style]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const iconButtonStyles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.deepInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface FABProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
}

export function FAB({ onPress, icon, style }: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[fabStyles.fab, style]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const fabStyles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.electricViolet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
});
