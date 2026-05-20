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

const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const { requestPasswordReset, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const handleRequest = async () => {
    if (!email.trim()) {
      setError("Ingresa el correo asociado a tu cuenta.");
      return;
    }

    try {
      setLoadingRequest(true);
      setError("");
      const result = await requestPasswordReset(email.trim());
      setDevToken(result?.devResetToken || "");
      setInfo(
        result?.emailConfigured
          ? "Te enviamos un correo con el enlace para restablecer tu contraseña."
          : "El backend quedó preparado para correo. Mientras configuras SMTP, en desarrollo verás un token de prueba abajo.",
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo iniciar la recuperación.");
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleReset = async () => {
    if (!token.trim() || !password.trim()) {
      setError("Ingresa el token y la nueva contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoadingReset(true);
      setError("");
      await resetPassword(token.trim(), password);
      setInfo(
        "Tu contraseña fue actualizada. Ya puedes volver a iniciar sesión.",
      );
      setToken("");
      setPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(resetError.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoadingReset(false);
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
          <View style={styles.heroBadge}>
            <Ionicons
              name="mail-unread-outline"
              size={iconSize.xl}
              color="#fff"
            />
          </View>
          <Text style={styles.heroTitle}>Recupera tu acceso</Text>
          <Text style={styles.heroSubtitle}>
            Solicita el correo de recuperación y luego restablece tu contraseña
            con el token recibido.
          </Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Solicitar recuperación
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
            placeholder="Correo electrónico"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Button
            title={loadingRequest ? "Solicitando..." : "Enviar correo"}
            onPress={handleRequest}
            loading={loadingRequest}
          />

          <View style={styles.divider} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Restablecer contraseña
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
            placeholder="Token recibido"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Nueva contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            title={
              loadingReset ? "Actualizando..." : "Guardar nueva contraseña"
            }
            onPress={handleReset}
            loading={loadingReset}
            variant="secondary"
          />

          {!!devToken && (
            <View
              style={[
                styles.devBox,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.devLabel, { color: colors.textSecondary }]}>
                Token de desarrollo
              </Text>
              <Text style={[styles.devToken, { color: colors.text }]}>
                {devToken}
              </Text>
            </View>
          )}

          {!!info && (
            <Text style={[styles.infoText, { color: colors.primaryDark }]}>
              {info}
            </Text>
          )}
          {!!error && <Text style={styles.errorText}>{error}</Text>}
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
  heroBadge: {
    width: s(60),
    height: s(60),
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: "#fff",
    fontSize: rf(26),
    fontWeight: "800",
    marginBottom: spacing.sm,
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
  sectionTitle: {
    fontSize: rf(17),
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.md,
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
    fontSize: rf(15),
    marginBottom: spacing.md,
  },
  divider: {
    height: s(1),
    backgroundColor: "rgba(148,163,184,0.2)",
    marginVertical: spacing.lg,
  },
  devBox: {
    borderWidth: s(1),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  devLabel: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  devToken: {
    fontSize: rf(14),
    fontWeight: "700",
  },
  infoText: {
    marginTop: spacing.md,
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  errorText: {
    color: "#E53935",
    marginTop: spacing.md,
    fontSize: rf(13),
  },
});

export default ForgotPasswordScreen;
