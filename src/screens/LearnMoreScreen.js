import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const LearnMoreScreen = () => {
  const { colors } = useTheme();

  const learnOptions = [
    {
      id: 1,
      title: "Consejos",
      icon: "bulb-outline",
      description: "Consejos útiles para el cuidado de tu vehículo",
    },
    {
      id: 2,
      title: "Recomendaciones",
      icon: "book-outline",
      description: "Recomendaciones generales sobre mantenimiento",
    },
    {
      id: 3,
      title: "Aprende sobre tu auto",
      icon: "search-outline",
      description: "Información detallada sobre componentes del vehículo",
    },
    {
      id: 4,
      title: "Tips de Mantenimiento",
      icon: "construct-outline",
      description: "Tips prácticos para el mantenimiento preventivo",
    },
  ];

  const handleOptionPress = (option) => {
    // Por ahora solo mostrar un mensaje, después se pueden implementar las pantallas específicas
    alert(`Próximamente: ${option.title}\n\n${option.description}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Saber más</Text>

        <View
          style={[
            styles.menuContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          {learnOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={() => handleOptionPress(option)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={colors.primary}
                  style={styles.menuItemIcon}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuContainer: {
    borderRadius: 12,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default LearnMoreScreen;
