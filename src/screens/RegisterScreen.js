import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const RegisterScreen = () => {
  const { colors } = useTheme();
  const { register, isSyncing } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completa nombre, correo y contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register(name.trim(), email.trim(), password);
    } catch (registerError) {
      setError(registerError.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroBadge}>
              <Ionicons
                name="person-add-outline"
                size={iconSize.xl}
                color="#fff"
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Cuenta protegida</Text>
              <Text style={styles.heroTitle}>Crea tu acceso</Text>
              <Text style={styles.heroSubtitle}>
                El respaldo en la nube quedará vinculado a tu correo para
                conservar tu historial y tus vehículos.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: colors.text }]}>Correo</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="correo@dominio.com"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Confirmar contraseña
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Repite tu contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {isSyncing && (
            <Text style={[styles.syncText, { color: colors.textSecondary }]}>
              Preparando la sincronización inicial de tu información...
            </Text>
          )}

          <Button
            title={loading ? "Creando cuenta..." : "Crear cuenta"}
            onPress={handleRegister}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  hero: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  heroBadge: {
    width: s(60),
    height: s(60),
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCopy: { flex: 1 },
  heroEyebrow: {
    color: "rgba(255,255,255,0.74)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: rf(12),
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: "#fff",
    fontSize: rf(26),
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: rf(14),
    lineHeight: rf(20),
  },
  card: {
    borderWidth: s(1),
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  label: {
    fontSize: rf(14),
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.md,
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
    fontSize: rf(15),
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#E53935",
    fontSize: rf(13),
    marginBottom: spacing.sm,
  },
  syncText: {
    fontSize: rf(13),
    marginBottom: spacing.sm,
  },
});

export default RegisterScreen;
