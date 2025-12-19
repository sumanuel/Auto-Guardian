import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const LearnCarScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const alerts = [
    {
      title: "Luz de advertencia en el tablero",
      content: "¡Nunca la ignores! Identifica qué significa cada símbolo.",
    },
    {
      title: "Vibración en el volante",
      content: "Puede indicar problemas en los neumáticos, balanceo o frenos.",
    },
    {
      title: "Humos anormales en el escape",
      content:
        "Azul (quema aceite), Blanco denso (posible problema del motor), Negro (mezcla incorrecta).",
    },
  ];

  const practices = [
    "Calentar el motor en ralentí por mucho tiempo en frío es innecesario con los motores modernos. Conduce suavemente los primeros minutos.",
    "Lavar el auto no es solo estética. La sal de la carretera o el barro pueden corroer la pintura y partes metálicas.",
    "¿Dónde estacionar? A la sombra siempre que puedas para preservar la pintura y los interiores.",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Señales de Alerta que No Debes Ignorar
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          (Convierte al usuario en un conductor más alerta).
        </Text>
        <Text style={[styles.introText, { color: colors.text }]}>
          &apos;Si ves, escuchas o sientes esto, revisa tu auto:&apos;
        </Text>

        {alerts.map((alert, index) => (
          <View
            key={index}
            style={[
              styles.alertCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Ionicons
              name="warning"
              size={20}
              color="#ff6b35"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.alertTitle, { color: colors.text }]}>
                {alert.title}
              </Text>
              <Text
                style={[styles.alertContent, { color: colors.textSecondary }]}
              >
                {alert.content}
              </Text>
            </View>
          </View>
        ))}

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.primary, marginTop: 30 },
          ]}
        >
          Buenas Prácticas de Conducción y Cuidado
        </Text>

        {practices.map((practice, index) => (
          <View
            key={index}
            style={[
              styles.practiceCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={[styles.practiceContent, { color: colors.text }]}>
              {practice}
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
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    fontStyle: "italic",
  },
  introText: {
    fontSize: 14,
    marginBottom: 15,
    fontStyle: "italic",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  practiceCard: {
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
  textContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  alertContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  practiceContent: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default LearnCarScreen;
