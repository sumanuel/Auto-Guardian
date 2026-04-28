import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { ms, rf } from "../../utils/responsive";

const Button = ({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case "outline":
        return [
          styles.button,
          styles.buttonOutline,
          { borderColor: colors.primaryDark },
          style,
        ];
      case "danger":
        return [
          styles.button,
          styles.buttonDanger,
          { backgroundColor: colors.danger },
          style,
        ];
      case "secondary":
        return [
          styles.button,
          styles.buttonSecondary,
          { backgroundColor: colors.primaryDark },
          style,
        ];
      default:
        return [
          styles.button,
          styles.buttonPrimary,
          { backgroundColor: colors.primaryDark },
          style,
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return [
          styles.buttonText,
          styles.textOutline,
          { color: colors.primaryDark },
        ];
      case "danger":
        return [styles.buttonText, styles.textDanger];
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <Text style={getTextStyle()}>Cargando...</Text>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={ms(20)}
              color={variant === "outline" ? colors.primaryDark : "#fff"}
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ms(14),
    paddingHorizontal: ms(24),
    borderRadius: ms(8),
    minHeight: ms(50),
  },
  buttonPrimary: {},
  buttonSecondary: {},
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: ms(2),
  },
  buttonDanger: {},
  buttonText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#fff",
  },
  textOutline: {},
  textDanger: {
    color: "#fff",
  },
  icon: {
    marginRight: ms(8),
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});

export default Button;
