import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const TipsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const tips = [
    "Mantener los neumáticos con la presión correcta puede mejorar tu rendimiento de combustible hasta en un 3%.",
    "Una carga excesiva en el maletero aumenta el consumo. Lleva solo lo necesario.",
    "Los mantenimientos preventivos programados son más baratos que reparar una avería mayor por descuido.",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Consejos para Ahorrar Dinero y Combustible
        </Text>

        {tips.map((tip, index) => (
          <View
            key={index}
            style={[styles.tipCard, { backgroundColor: colors.cardBackground }]}
          >
            <Ionicons
              name="bulb"
              size={20}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={[styles.tipContent, { color: colors.text }]}>
              {tip}
            </Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default TipsScreen;
