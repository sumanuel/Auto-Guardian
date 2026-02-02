import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, iconSize, rf, s, spacing } from "../utils/responsive";

const CurrencySettingsScreen = () => {
  const { colors } = useTheme();
  const { currencySymbol, setCurrencySymbol } = useAppSettings();

  const Option = ({ symbol, label }) => {
    const selected = currencySymbol === symbol;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: colors.cardBackground,
            borderColor: selected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setCurrencySymbol(symbol)}
        activeOpacity={0.85}
      >
        <View style={styles.optionLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: selected ? colors.primary : colors.disabled },
            ]}
          >
            <Text style={styles.symbol}>{symbol}</Text>
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Símbolo usado en montos
            </Text>
          </View>
        </View>

        {selected ? (
          <Ionicons
            name="checkmark-circle"
            size={iconSize.md}
            color={colors.primary}
          />
        ) : (
          <Ionicons
            name="ellipse-outline"
            size={iconSize.md}
            color={colors.textTertiary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Moneda</Text>

      <Option symbol="$" label="Dólar" />
      <Option symbol="€" label="Euro" />

      <View style={styles.note}>
        <Text style={[styles.noteText, { color: colors.textSecondary }]}>
          Esto cambia solo el símbolo mostrado (no convierte valores).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: rf(24),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  option: {
    borderRadius: borderRadius.md,
    borderWidth: s(1),
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: s(46),
    height: s(46),
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    color: "#fff",
    fontSize: rf(18),
    fontWeight: "bold",
  },
  label: {
    fontSize: rf(16),
    fontWeight: "700",
  },
  sub: {
    fontSize: rf(12),
    marginTop: 2,
  },
  note: {
    marginTop: spacing.sm,
  },
  noteText: {
    fontSize: rf(12),
  },
});

export default CurrencySettingsScreen;
