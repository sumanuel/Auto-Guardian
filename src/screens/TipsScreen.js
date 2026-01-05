import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ms, rf } from "../utils/responsive";

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
              size={ms(20)}
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
    paddingHorizontal: ms(20),
    paddingTop: ms(20),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: ms(20),
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: ms(12),
  },
  icon: {
    marginRight: ms(12),
    marginTop: ms(2),
  },
  tipContent: {
    fontSize: rf(14),
    lineHeight: ms(20),
    flex: 1,
  },
});

export default TipsScreen;
