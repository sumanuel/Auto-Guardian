import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  borderRadius,
  hs,
  iconSize,
  ms,
  rf,
  s,
  spacing,
  vs,
} from "../../utils/responsive";

export const QUICK_ACTION_COLORS = [
  "#FF9800",
  "#4CAF50",
  "#F44336",
  "#9C27B0",
  "#1976D2",
];

const QuickActionCard = ({ icon, label, color, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.quickActionCard,
      {
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.quickActionTopRow}>
      <View
        style={[styles.quickActionIconWrap, { backgroundColor: `${color}20` }]}
      >
        <Ionicons name={icon} size={iconSize.sm} color={color} />
      </View>
      <Ionicons
        name="chevron-forward"
        size={iconSize.xs}
        color={colors.textSecondary}
      />
    </View>
    <Text
      style={[styles.quickActionLabel, { color: colors.text }]}
      numberOfLines={2}
    >
      {label}
    </Text>
    <Text
      style={[styles.quickActionCaption, { color: colors.textSecondary }]}
      numberOfLines={1}
    >
      Programar servicio
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quickActionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(14),
  },
  quickActionCard: {
    width: ms(148),
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: vs(124),
    marginRight: hs(12),
  },
  quickActionIconWrap: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: rf(15),
    fontWeight: "700",
    marginBottom: vs(4),
    lineHeight: rf(20),
  },
  quickActionCaption: {
    fontSize: rf(12),
    fontWeight: "600",
  },
});

export default QuickActionCard;
