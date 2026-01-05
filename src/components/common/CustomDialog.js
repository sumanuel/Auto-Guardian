import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../data/constants";
import { ms, rf } from "../../utils/responsive";

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
          color: COLORS.primary,
          bgColor: "#eff6ff",
        };
      default: // info
        return {
          icon: "information-circle",
          color: COLORS.primary,
          bgColor: "#eff6ff",
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
              (b) => b.style === "cancel" || b.text === "Cancelar"
            );
            if (cancelButton) {
              handleButtonPress(cancelButton);
            }
          }}
        />
        <View style={styles.dialogContainer}>
          {/* Icono superior */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: typeConfig.bgColor },
            ]}
          >
            <Ionicons
              name={typeConfig.icon}
              size={ms(48)}
              color={typeConfig.color}
            />
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {/* Botones */}
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
                    isPrimary && styles.buttonPrimary,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isPrimary && styles.buttonTextPrimary,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel,
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
    backgroundColor: "#fff",
    borderRadius: ms(20),
    width: "100%",
    maxWidth: ms(400),
    overflow: "hidden",
    elevation: ms(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.3,
    shadowRadius: ms(8),
  },
  iconContainer: {
    paddingVertical: ms(24),
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: ms(24),
    paddingBottom: ms(24),
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: ms(8),
  },
  message: {
    fontSize: rf(16),
    color: "#666",
    textAlign: "center",
    lineHeight: ms(24),
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: ms(1),
    borderTopColor: "#f0f0f0",
  },
  buttonContainerColumn: {
    flexDirection: "column",
  },
  button: {
    paddingVertical: ms(16),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFull: {
    flex: 1,
  },
  buttonHalf: {
    flex: 1,
    borderRightWidth: ms(0.5),
    borderRightColor: "#f0f0f0",
  },
  buttonColumn: {
    borderBottomWidth: ms(0.5),
    borderBottomColor: "#f0f0f0",
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonDestructive: {
    backgroundColor: "#fef2f2",
  },
  buttonCancel: {
    backgroundColor: "#f9fafb",
  },
  buttonText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333",
  },
  buttonTextPrimary: {
    color: "#fff",
  },
  buttonTextDestructive: {
    color: COLORS.danger,
  },
  buttonTextCancel: {
    color: "#666",
  },
});

export default CustomDialog;
