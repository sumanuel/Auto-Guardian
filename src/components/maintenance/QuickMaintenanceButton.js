import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";
import { ms, rf } from "../../utils/responsive";

const QuickMaintenanceButton = ({
  icon,
  label,
  onPress,
  color = COLORS.primary,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={ms(24)} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: ms(105),
    marginHorizontal: ms(8),
  },
  iconCircle: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: ms(8),
  },
  label: {
    fontSize: rf(12),
    textAlign: "center",
    fontWeight: "500",
  },
});

export default QuickMaintenanceButton;
