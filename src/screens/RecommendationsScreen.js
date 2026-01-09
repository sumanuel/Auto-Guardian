import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, ms, rf, spacing } from "../utils/responsive";

const RecommendationsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const maintenanceTips = [
    {
      title: "Aceite y Filtros",
      content:
        "¿Cada cuánto cambiar el aceite? No solo depende de los kilómetros, sino también del tipo de conducción (ciudad vs. carretera).",
    },
    {
      title: "Neumáticos",
      content:
        "La presión incorrecta desgasta los neumáticos hasta un 20% más rápido y gasta más combustible. Revísala cada 15 días.",
    },
    {
      title: "Frenos",
      content:
        "Un sonido metálico al frenar suele indicar que las pastillas están gastadas. No esperes a perder eficacia.",
    },
    {
      title: "Batería",
      content:
        "La mayoría de las fallas de batería ocurren en climas extremos (calor o frío intenso). Anticípate y revísala.",
    },
    {
      title: "Aire Acondicionado",
      content:
        "Para mantenerlo en buen estado, enciéndelo al menos 10 minutos cada semana, incluso en invierno.",
    },
  ];

  const seasonalRecommendations = [
    {
      title: "Verano",
      content:
        "Con el calor extremo, revisa el nivel de líquido refrigerante y la presión de los neumáticos (aumenta con la temperatura).",
    },
    {
      title: "Invierno/Lluvia",
      content:
        "Antes de la temporada de lluvias, verifica el estado de los limpiaparabrisas y la profundidad del dibujo de tus neumáticos (aquaplaning).",
    },
    {
      title: "Viajes Largos (Pre-Viaje)",
      content:
        "¡Checklist imprescindible antes de un viaje por carretera! Revisa: niveles, neumáticos (presión y desgaste), luces y kit de emergencia.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Recomendaciones por Tipo de Mantenimiento
        </Text>

        {maintenanceTips.map((tip, index) => (
          <View
            key={index}
            style={[styles.recCard, { backgroundColor: colors.cardBackground }]}
          >
            <Text style={[styles.recTitle, { color: colors.primary }]}>
              {tip.title}
            </Text>
            <Text style={[styles.recContent, { color: colors.text }]}>
              {tip.content}
            </Text>
          </View>
        ))}

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.primary, marginTop: ms(30) },
          ]}
        >
          Recomendaciones por Estación del Año / Clima
        </Text>

        {seasonalRecommendations.map((rec, index) => (
          <View
            key={index}
            style={[styles.recCard, { backgroundColor: colors.cardBackground }]}
          >
            <Text style={[styles.recTitle, { color: colors.primary }]}>
              {rec.title}
            </Text>
            <Text style={[styles.recContent, { color: colors.text }]}>
              {rec.content}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  recCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  recContent: {
    fontSize: rf(14),
    lineHeight: rf(20),
  },
});

export default RecommendationsScreen;
