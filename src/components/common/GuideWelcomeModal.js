import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../../utils/responsive";

// Bienvenida que se muestra una sola vez para ofrecer la guía de primeros pasos
const GuideWelcomeModal = ({ visible, onStart, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar"
          >
            <Ionicons
              name="close"
              size={iconSize.md}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <LinearGradient
            colors={[colors.primary, "#0F5FD2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBadge}
          >
            <Ionicons name="rocket-outline" size={iconSize.xl} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            ¡Bienvenido a Auto-Guardian!
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Te mostramos en pocos pasos cómo registrar tu vehículo, programar
            mantenimientos y controlar tus gastos. Puedes volver a verlo cuando
            quieras desde el botón del cohete en Inicio.
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primaryDark },
            ]}
            onPress={onStart}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>Ver guía paso a paso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text
              style={[styles.secondaryText, { color: colors.textSecondary }]}
            >
              Ahora no
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: s(420),
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  iconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: s(38),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: rf(20),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: rf(14),
    lineHeight: rf(20),
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  primaryButton: {
    alignSelf: "stretch",
    minHeight: vs(48),
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontSize: rf(15), fontWeight: "700" },
  secondaryButton: {
    minHeight: vs(44),
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  secondaryText: { fontSize: rf(14), fontWeight: "600" },
});

export default GuideWelcomeModal;
