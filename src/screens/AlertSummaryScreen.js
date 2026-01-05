import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { ms, rf } from "../utils/responsive";

const Tab = createMaterialTopTabNavigator();

// Componente para el tab de Vehículos
const VehiclesTab = ({ summary }) => {
  const { colors } = useTheme();

  if (!summary) {
    return (
      <View
        style={[styles.tabContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          No hay información de alertas disponible
        </Text>
      </View>
    );
  }

  const overdueAlerts = summary.alerts.filter((a) => a.type === "overdue");
  const urgentAlerts = summary.alerts.filter((a) => a.type === "urgent");

  const hasAlerts = overdueAlerts.length > 0 || urgentAlerts.length > 0;

  const renderAlertItem = ({ item }) => (
    <View
      style={[styles.alertItem, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          <Ionicons
            name={item.type === "overdue" ? "alert-circle" : "warning"}
            size={ms(24)}
            color={item.type === "overdue" ? COLORS.danger : COLORS.warning}
          />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertVehicle, { color: colors.text }]}>
            {item.vehicle}
          </Text>
          <Text
            style={[styles.alertMaintenance, { color: colors.textSecondary }]}
          >
            {item.maintenance}
          </Text>
        </View>
      </View>
      <Text style={[styles.alertReason, { color: colors.textSecondary }]}>
        {item.reason}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.tabContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {!hasAlerts ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes mantenimientos pendientes o vencidos en este momento.
          </Text>
        </View>
      ) : (
        <>
          {/* Vencidos */}
          {overdueAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="alert-circle"
                  size={ms(20)}
                  color={COLORS.danger}
                />
                <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
                  Vencidos ({overdueAlerts.length})
                </Text>
              </View>
              <FlatList
                data={overdueAlerts}
                renderItem={renderAlertItem}
                keyExtractor={(item, index) => `overdue-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Urgentes */}
          {urgentAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={ms(20)} color={COLORS.warning} />
                <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
                  Urgentes ({urgentAlerts.length})
                </Text>
              </View>
              <FlatList
                data={urgentAlerts}
                renderItem={renderAlertItem}
                keyExtractor={(item, index) => `urgent-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

// Componente para el tab de Documentos
const DocumentsTab = () => {
  const { colors } = useTheme();
  const { getExpiringDocuments, updateAppBadge } = useApp();
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiringDocuments();
  }, []);

  const loadExpiringDocuments = async () => {
    try {
      setLoading(true);
      const documents = await getExpiringDocuments(30);
      setExpiringDocuments(documents);

      // Actualizar el badge después de cargar los documentos
      await updateAppBadge();
    } catch (error) {
      console.error("Error loading expiring documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentItem = ({ item }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Parse expiry date more carefully
    let expiryDate;
    if (typeof item.expiry_date === "string") {
      // If it's a string like "2025-12-18", parse it correctly
      const [year, month, day] = item.expiry_date.split("-").map(Number);
      expiryDate = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      expiryDate = new Date(item.expiry_date);
    }
    expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Calculate days remaining more accurately
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.round(timeDiff / (1000 * 60 * 60 * 24));

    // Helper function to format date as dd/mm/yyyy
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    };

    // Determine color and status
    let iconColor = COLORS.warning;
    let statusText = "";
    let statusColor = colors.textSecondary;

    if (daysRemaining < 0) {
      // Already expired (shouldn't happen with current filter, but just in case)
      iconColor = COLORS.danger;
      statusText = `Venció hace ${Math.abs(daysRemaining)} día${
        Math.abs(daysRemaining) !== 1 ? "s" : ""
      }`;
      statusColor = COLORS.danger;
    } else if (daysRemaining === 0) {
      // Expires today
      iconColor = COLORS.danger;
      statusText = "¡Vence HOY!";
      statusColor = COLORS.danger;
    } else if (daysRemaining === 1) {
      // Expires tomorrow
      iconColor = COLORS.danger;
      statusText = "Vence mañana";
      statusColor = COLORS.danger;
    } else if (daysRemaining <= 7) {
      // Expires this week
      iconColor = COLORS.warning;
      statusText = `Vence en ${daysRemaining} días`;
      statusColor = COLORS.warning;
    } else {
      // Expires later
      iconColor = COLORS.info || COLORS.primary;
      statusText = `Vence en ${daysRemaining} días`;
      statusColor = colors.textSecondary;
    }

    return (
      <View
        style={[styles.alertItem, { backgroundColor: colors.cardBackground }]}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertIcon}>
            <Ionicons name="document-text" size={ms(24)} color={iconColor} />
          </View>
          <View style={styles.alertContent}>
            <Text style={[styles.alertVehicle, { color: colors.text }]}>
              {item.document_type_name || "Documento"}
            </Text>
            <Text
              style={[styles.alertMaintenance, { color: colors.textSecondary }]}
            >
              {item.vehicle_name || "Vehículo"}
            </Text>
          </View>
        </View>
        <Text style={[styles.alertReason, { color: statusColor }]}>
          {statusText} ({formatDate(item.expiry_date)})
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.tabContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Cargando documentos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.tabContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {expiringDocuments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-outline"
            size={ms(60)}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin documentos urgentes
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes documentos urgentes que requieran atención.
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={ms(20)} color={COLORS.warning} />
            <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
              Urgentes ({expiringDocuments.length})
            </Text>
          </View>
          <FlatList
            data={expiringDocuments}
            renderItem={renderDocumentItem}
            keyExtractor={(item) => `document-${item.id}`}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const AlertSummaryScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { summary } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.cardBackground }]}
      ></View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { backgroundColor: colors.cardBackground },
          tabBarIndicatorStyle: { backgroundColor: colors.primary },
        }}
      >
        <Tab.Screen
          name="Vehículos"
          children={() => <VehiclesTab summary={summary} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="car-sport-outline"
                size={ms(size)}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Documentos"
          component={DocumentsTab}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-outline" size={ms(size)} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: ms(50),
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
    borderBottomWidth: ms(1),
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: ms(8),
    marginRight: ms(8),
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    backgroundColor: COLORS.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(12),
  },
  iconSuccess: {
    backgroundColor: COLORS.success + "20",
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: ms(16),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ms(60),
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginTop: ms(16),
    marginBottom: ms(8),
  },
  emptyText: {
    fontSize: rf(16),
    textAlign: "center",
  },
  errorText: {
    fontSize: rf(16),
    textAlign: "center",
    padding: ms(20),
  },
  tabContainer: {
    flex: 1,
    padding: ms(16),
  },
  section: {
    marginBottom: ms(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ms(12),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginLeft: ms(8),
  },
  alertItem: {
    padding: ms(16),
    marginBottom: ms(8),
    borderRadius: ms(8),
    borderWidth: ms(1),
    borderColor: "#e0e0e0",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ms(8),
  },
  alertIcon: {
    marginRight: ms(12),
  },
  alertContent: {
    flex: 1,
  },
  alertVehicle: {
    fontSize: rf(16),
    fontWeight: "bold",
  },
  alertMaintenance: {
    fontSize: rf(14),
  },
  alertReason: {
    fontSize: rf(14),
    fontStyle: "italic",
  },
});

export default AlertSummaryScreen;
