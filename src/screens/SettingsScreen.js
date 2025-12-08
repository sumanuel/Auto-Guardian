import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Modo oscuro</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? colors.primary : "#ccc"}
          trackColor={{ false: "#eee", true: colors.primaryDark }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default SettingsScreen;
