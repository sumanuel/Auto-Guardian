import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { authenticate } from "../services/appLockService";
import { iconSize, rf, s, spacing } from "../utils/responsive";

const LockScreen = ({ onUnlock }) => {
  const { colors } = useTheme();

  const tryUnlock = useCallback(async () => {
    if (await authenticate()) onUnlock();
  }, [onUnlock]);

  // Pide la autenticación al mostrarse
  useEffect(() => {
    tryUnlock();
  }, [tryUnlock]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="lock-closed" size={iconSize.xl} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Auto Guardian</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Autentícate para ver tus vehículos y documentos.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={tryUnlock}
      >
        <Text style={styles.buttonText}>Desbloquear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: { fontSize: rf(24), fontWeight: "700", marginTop: spacing.md },
  subtitle: {
    fontSize: rf(14),
    textAlign: "center",
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  button: {
    marginTop: spacing.xl,
    paddingVertical: s(12),
    paddingHorizontal: s(32),
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontSize: rf(16), fontWeight: "600" },
});

export default LockScreen;
