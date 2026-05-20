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
  TouchableOpacity,
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

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login, isSyncing } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email.trim(), password);
    } catch (authError) {
      setError(authError.message || "No se pudo iniciar sesión.");
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
          <View style={styles.heroBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={iconSize.xl}
              color="#fff"
            />
          </View>
          <Text style={styles.heroEyebrow}>Acceso seguro</Text>
          <Text style={styles.heroTitle}>Entra a tu garage inteligente</Text>
          <Text style={styles.heroSubtitle}>
            Inicia sesión para respaldar tu información, sincronizar vehículos y
            mantener tu historial protegido.
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
            Iniciar sesión
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Usa tu correo para acceder a tus respaldos y continuar con tu
            información actual.
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
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
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
            placeholder="Contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {isSyncing && (
            <Text style={[styles.syncText, { color: colors.textSecondary }]}>
              Sincronizando tus datos locales con el respaldo remoto...
            </Text>
          )}

          <Button
            title={loading ? "Ingresando..." : "Entrar"}
            onPress={handleLogin}
            loading={loading}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={[styles.linkText, { color: colors.primaryDark }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryLink}
            onPress={() => navigation.navigate("Register")}
          >
            <Text
              style={[
                styles.secondaryLinkText,
                { color: colors.textSecondary },
              ]}
            >
              ¿Aún no tienes cuenta?
            </Text>
            <Text
              style={[
                styles.secondaryLinkAction,
                { color: colors.primaryDark },
              ]}
            >
              Crear cuenta
            </Text>
          </TouchableOpacity>
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
    justifyContent: "center",
  },
  hero: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    width: s(62),
    height: s(62),
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
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
    fontSize: rf(28),
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: rf(14),
    lineHeight: rf(20),
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: s(1),
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  sectionText: {
    fontSize: rf(14),
    lineHeight: rf(20),
    marginBottom: spacing.lg,
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
  primaryButton: {
    marginTop: spacing.xs,
  },
  linkButton: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: rf(14),
    fontWeight: "600",
  },
  secondaryLink: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  secondaryLinkText: {
    fontSize: rf(14),
  },
  secondaryLinkAction: {
    fontSize: rf(14),
    fontWeight: "700",
  },
});

export default LoginScreen;
