import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";
import { borderRadius, ms, rf } from "../../utils/responsive";

/**
 * CustomDialog - Reemplazo moderno para Alert.alert
 *
 * Uso:
 * showDialog({
 *   title: "Título",
 *   message: "Mensaje",
 *   type: "success" | "error" | "warning" | "info" | "confirm",
 *   buttons: [{ text: "OK", onPress: () => {} }]
 * })
 */

const CustomDialog = ({ visible, onClose, config }) => {
  const { colors } = useTheme();

  if (!config) return null;

  const {
    title = "Atención",
    message = "",
    type = "info",
    buttons = [{ text: "OK", onPress: onClose }],
  } = config;

  // Configuración de iconos y colores según el tipo
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: COLORS.success,
          bgColor: "#f0fdf4",
        };
      case "error":
        return {
          icon: "close-circle",
          color: COLORS.danger,
          bgColor: "#fef2f2",
        };
      case "warning":
        return {
          icon: "alert-circle",
          color: COLORS.warning,
          bgColor: "#fffbeb",
        };
      case "confirm":
        return {
          icon: "help-circle",
          color: colors.primaryDark,
          bgColor: "rgba(15,95,210,0.12)",
        };
      default: // info
        return {
          icon: "information-circle",
          color: colors.primaryDark,
          bgColor: "rgba(15,95,210,0.12)",
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={() => {
            // Solo cerrar si hay un botón de cancelar
            const cancelButton = buttons.find(
              (b) => b.style === "cancel" || b.text === "Cancelar",
            );
            if (cancelButton) {
              handleButtonPress(cancelButton);
            }
          }}
        />
        <View style={styles.dialogContainer}>
          <View
            style={[
              styles.dialogSurface,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: typeConfig.bgColor },
              ]}
            >
              <Ionicons
                name={typeConfig.icon}
                size={ms(34)}
                color={typeConfig.color}
              />
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
              {message && (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                  {message}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.buttonContainer,
                buttons.length > 2 && styles.buttonContainerColumn,
              ]}
            >
              {buttons.map((button, index) => {
                const isDestructive = button.style === "destructive";
                const isCancel = button.style === "cancel";
                const isPrimary =
                  !isDestructive && !isCancel && index === buttons.length - 1;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      buttons.length === 1 && styles.buttonFull,
                      buttons.length === 2 && styles.buttonHalf,
                      buttons.length > 2 && styles.buttonColumn,
                      {
                        backgroundColor: isPrimary
                          ? colors.primaryDark
                          : colors.inputBackground,
                        borderColor: isDestructive
                          ? colors.danger
                          : colors.border,
                      },
                      isCancel && styles.buttonCancel,
                      isDestructive && styles.buttonDestructive,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: isPrimary
                            ? "#fff"
                            : isDestructive
                              ? colors.danger
                              : colors.text,
                        },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: ms(20),
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: ms(400),
  },
  dialogSurface: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: ms(22),
    elevation: ms(10),
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.18,
    shadowRadius: ms(18),
  },
  iconContainer: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  content: {
    paddingTop: ms(18),
    paddingBottom: ms(20),
  },
  title: {
    fontSize: rf(20),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: ms(8),
  },
  message: {
    fontSize: rf(15),
    textAlign: "center",
    lineHeight: ms(24),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: ms(10),
  },
  buttonContainerColumn: {
    flexDirection: "column",
  },
  button: {
    paddingVertical: ms(16),
    paddingHorizontal: ms(14),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  buttonFull: {
    flex: 1,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonColumn: {
    width: "100%",
  },
  buttonCancel: {
    opacity: 0.96,
  },
  buttonDestructive: {},
  buttonText: {
    fontSize: rf(15),
    fontWeight: "700",
  },
});

export default CustomDialog;
