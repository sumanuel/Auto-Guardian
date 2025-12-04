import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../data/constants';

const Button = ({ title, onPress, variant = 'primary', icon, loading, disabled, style }) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.button, styles.buttonOutline, style];
      case 'danger':
        return [styles.button, styles.buttonDanger, style];
      case 'secondary':
        return [styles.button, styles.buttonSecondary, style];
      default:
        return [styles.button, styles.buttonPrimary, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.textOutline];
      case 'danger':
        return [styles.buttonText, styles.textDanger];
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <Text style={getTextStyle()}>Cargando...</Text>
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={20} color={variant === 'outline' ? COLORS.primary : '#fff'} style={styles.icon} />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  textOutline: {
    color: COLORS.primary,
  },
  textDanger: {
    color: '#fff',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
