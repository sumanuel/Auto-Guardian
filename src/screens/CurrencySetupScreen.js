import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const CurrencySetupScreen = ({ onDone }) => {
  const { colors } = useTheme();
  const { setCurrencySymbol } = useAppSettings();

  const pick = async (symbol) => {
    await setCurrencySymbol(symbol);
    onDone?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Ionicons
          name="cash-outline"
          size={iconSize.lg}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Selecciona tu moneda
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Podrás cambiarla luego en Configuración.
        </Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
              },
            ]}
            onPress={() => pick("$")}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>$</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
              },
            ]}
            onPress={() => pick("€")}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>€</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  title: {
    marginTop: spacing.md,
    fontSize: rf(22),
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: rf(14),
    textAlign: "center",
    marginBottom: vs(18),
  },
  optionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  optionButton: {
    width: s(90),
    height: s(60),
    borderRadius: borderRadius.md,
    borderWidth: s(1),
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: rf(26),
    fontWeight: "800",
  },
});

export default CurrencySetupScreen;
