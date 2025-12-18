import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";

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
            size={24}
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
                <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
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
                <Ionicons name="warning" size={20} color={COLORS.warning} />
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
  const { getExpiringDocuments } = useApp();
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiringDocuments();
  }, []);

  const loadExpiringDocuments = async () => {
    try {
      setLoading(true);
      const documents = await getExpiringDocuments();
      setExpiringDocuments(documents);
    } catch (error) {
      console.error("Error loading expiring documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentItem = ({ item }) => {
    const daysRemaining = Math.ceil(
      (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View
        style={[styles.alertItem, { backgroundColor: colors.cardBackground }]}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertIcon}>
            <Ionicons
              name="document-text"
              size={24}
              color={daysRemaining <= 7 ? COLORS.danger : COLORS.warning}
            />
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
        <Text style={[styles.alertReason, { color: colors.textSecondary }]}>
          Vence en {daysRemaining} día{daysRemaining !== 1 ? "s" : ""} (
          {new Date(item.expiry_date).toLocaleDateString()})
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
            size={60}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin documentos próximos a vencer
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tienes documentos que venzan en los próximos 30 días.
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color={COLORS.warning} />
            <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
              Próximos a vencer ({expiringDocuments.length})
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
              <Ionicons name="car-sport-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Documentos"
          component={DocumentsTab}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-outline" size={size} color={color} />
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.warning + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconSuccess: {
    backgroundColor: COLORS.success + "20",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  tabContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  alertItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertVehicle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alertMaintenance: {
    fontSize: 14,
  },
  alertReason: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default AlertSummaryScreen;
