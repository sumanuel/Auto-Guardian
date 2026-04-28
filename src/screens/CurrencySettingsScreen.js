import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroMediaRow}>
            <View style={[styles.iconBadge, styles.heroIconBadge]}>
              <Ionicons
                name="cash-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.eyebrow}>Parámetros regionales</Text>
              <Text style={styles.title}>Moneda</Text>
              <Text style={styles.subtitle}>
                Define el símbolo visible en montos, reportes y tarjetas
                financieras de la aplicación.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Option symbol="$" label="Dólar" />
        <Option symbol="€" label="Euro" />

        <View style={styles.note}>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Esto cambia sólo el símbolo mostrado y no modifica los valores ya
            registrados.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroIconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: borderRadius.lg,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  eyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6E7FF",
  },
  title: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "#D6E7FF",
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
