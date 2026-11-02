import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DecimalsSelector from "../components/common/DecimalsSelector";
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
  const { setCurrencySymbol, setCurrencyDecimals, currencyDecimals } =
    useAppSettings();
  const [symbol, setSymbol] = useState(null);
  const [decimals, setDecimals] = useState(currencyDecimals);

  const confirm = async () => {
    if (!symbol) return;
    // Los decimales primero: al fijar el símbolo la app sale de esta pantalla
    await setCurrencyDecimals(decimals);
    await setCurrencySymbol(symbol);
    onDone?.();
  };

  const renderSymbolOption = (value) => {
    const selected = symbol === value;
    return (
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: colors.inputBackground,
          },
        ]}
        onPress={() => setSymbol(value)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <Text
          style={[
            styles.optionText,
            { color: selected ? colors.primary : colors.text },
          ]}
        >
          {value}
        </Text>
      </TouchableOpacity>
    );
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
          {renderSymbolOption("$")}
          {renderSymbolOption("€")}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Decimales en los montos
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Algunos países, como Portugal, usan 3.
        </Text>
        <View style={styles.decimalsWrap}>
          <DecimalsSelector value={decimals} onChange={setDecimals} />
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary, opacity: symbol ? 1 : 0.4 },
          ]}
          onPress={confirm}
          disabled={!symbol}
        >
          <Text style={styles.continueText}>Continuar</Text>
        </TouchableOpacity>
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
    borderWidth: s(1.5),
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: rf(26),
    fontWeight: "800",
  },
  sectionLabel: {
    marginTop: vs(22),
    fontSize: rf(16),
    fontWeight: "700",
  },
  hint: {
    marginTop: vs(2),
    marginBottom: vs(10),
    fontSize: rf(13),
    textAlign: "center",
  },
  decimalsWrap: { alignSelf: "stretch" },
  continueButton: {
    alignSelf: "stretch",
    marginTop: vs(22),
    paddingVertical: vs(14),
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  continueText: { color: "#fff", fontSize: rf(16), fontWeight: "700" },
});

export default CurrencySetupScreen;
