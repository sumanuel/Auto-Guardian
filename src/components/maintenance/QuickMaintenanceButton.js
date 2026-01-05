import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";
import { isTablet, ms, rf } from "../../utils/responsive";

const QuickMaintenanceButton = ({
  icon,
  label,
  onPress,
  color = COLORS.primary,
}) => {
  const { colors } = useTheme();
  const tablet = isTablet();

  const circleSize = tablet ? ms(64, 1) : ms(64);
  const iconSize = tablet ? ms(24, 1) : ms(24);
  const itemWidth = tablet ? ms(105, 1) : ms(105);

  return (
    <TouchableOpacity
      style={[styles.container, { width: itemWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: color + "20",
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        <Ionicons name={icon} size={iconSize} color={color} />
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
    marginHorizontal: ms(8),
  },
  iconCircle: {
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
