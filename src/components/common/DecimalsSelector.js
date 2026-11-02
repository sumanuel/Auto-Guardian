import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { MAX_DECIMALS, MIN_DECIMALS } from "../../utils/currencyConfig";
import { borderRadius, rf, s, spacing, vs } from "../../utils/responsive";

const OPTIONS = Array.from(
  { length: MAX_DECIMALS - MIN_DECIMALS + 1 },
  (_, i) => MIN_DECIMALS + i,
);

const sample = (decimals) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(1234.5678);

// Selector de la cantidad de decimales (0 a 3) con un ejemplo de cada una
const DecimalsSelector = ({ value, onChange }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((decimals) => {
        const selected = value === decimals;
        return (
          <TouchableOpacity
            key={decimals}
            style={[
              styles.option,
              {
                backgroundColor: colors.inputBackground,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange(decimals)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${decimals} decimales`}
          >
            <Text
              style={[
                styles.number,
                { color: selected ? colors.primary : colors.text },
              ]}
            >
              {decimals}
            </Text>
            <Text style={[styles.sample, { color: colors.textSecondary }]}>
              {sample(decimals)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  option: {
    flex: 1,
    alignItems: "center",
    paddingVertical: vs(10),
    borderWidth: s(1.5),
    borderRadius: borderRadius.md,
  },
  number: { fontSize: rf(20), fontWeight: "800" },
  sample: { fontSize: rf(11), marginTop: vs(2) },
});

export default DecimalsSelector;
