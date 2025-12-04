import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatUtils";

const InvestmentDetailScreen = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const { colors } = useTheme();
  const { vehicles, getAllMaintenances } = useApp();
  const [vehicle, setVehicle] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    const vehicleData = vehicles.find((v) => v.id === vehicleId);
    setVehicle(vehicleData);

    const allMaintenances = getAllMaintenances();
    const vehicleMaintenances = allMaintenances
      .filter((m) => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setMaintenances(vehicleMaintenances);

    const total = vehicleMaintenances.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );
    setTotalCost(total);

    // Agrupar por categoría
    const categories = {};
    vehicleMaintenances.forEach((m) => {
      const category = m.type || "Otros";
      if (!categories[category]) {
        categories[category] = {
          name: category,
          total: 0,
          count: 0,
        };
      }
      categories[category].total += m.cost || 0;
      categories[category].count += 1;
    });

    const categoryArray = Object.values(categories).sort(
      (a, b) => b.total - a.total
    );
    setCategoryStats(categoryArray);
  }, [vehicleId, vehicles]);

  const getCategoryIcon = (type) => {
    const icons = {
      "Cambio de aceite": "water-outline",
      Frenos: "hand-left-outline",
      Llantas: "ellipse-outline",
      Batería: "battery-charging-outline",
      Transmisión: "settings-outline",
      "Sistema eléctrico": "flash-outline",
      "Sistema de refrigeración": "thermometer-outline",
      Suspensión: "git-compare-outline",
      Filtros: "funnel-outline",
      "Alineación y balanceo": "options-outline",
    };
    return icons[type] || "build-outline";
  };

  if (!vehicle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Header del vehículo */}
        <View style={styles.header}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {vehicle.name}
          </Text>
          {vehicle.brand && vehicle.model && (
            <Text
              style={[styles.vehicleDetails, { color: colors.textSecondary }]}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
          )}
        </View>

        {/* Tarjeta de total */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Ionicons name="cash-outline" size={40} color="#fff" />
          <Text style={styles.totalLabel}>Total Invertido</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalCost)}</Text>
          <Text style={styles.totalSubtitle}>
            {maintenances.length}{" "}
            {maintenances.length === 1 ? "servicio" : "servicios"} realizados
          </Text>
        </View>

        {/* Estadísticas por categoría */}
        {categoryStats.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Gastos por Categoría
            </Text>
            {categoryStats.map((category, index) => (
              <View
                key={index}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Ionicons
                      name={getCategoryIcon(category.name)}
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.categoryTextContainer}>
                      <Text
                        style={[styles.categoryName, { color: colors.text }]}
                      >
                        {category.name}
                      </Text>
                      <Text
                        style={[
                          styles.categoryCount,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {category.count}{" "}
                        {category.count === 1 ? "servicio" : "servicios"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.categoryAmount, { color: colors.primary }]}
                  >
                    {formatCurrency(category.total)}
                  </Text>
                </View>
                {/* Barra de progreso */}
                <View
                  style={[
                    styles.progressBarContainer,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: colors.primary,
                        width: `${(category.total / totalCost) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Historial detallado */}
        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Historial Detallado
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MaintenanceHistory", { vehicleId })
            }
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>

        {maintenances.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay mantenimientos registrados
            </Text>
          </View>
        ) : (
          maintenances.slice(0, 5).map((maintenance) => (
            <View
              key={maintenance.id}
              style={[
                styles.maintenanceCard,
                {
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <View style={styles.maintenanceHeader}>
                <View style={styles.maintenanceInfo}>
                  <Ionicons
                    name={getCategoryIcon(maintenance.type)}
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.maintenanceType, { color: colors.text }]}
                  >
                    {maintenance.type}
                  </Text>
                </View>
                <Text
                  style={[styles.maintenanceCost, { color: colors.primary }]}
                >
                  {formatCurrency(maintenance.cost)}
                </Text>
              </View>
              <Text
                style={[
                  styles.maintenanceDate,
                  { color: colors.textSecondary },
                ]}
              >
                {formatDate(maintenance.date)}
              </Text>
              {maintenance.description && (
                <Text
                  style={[
                    styles.maintenanceDescription,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {maintenance.description}
                </Text>
              )}
            </View>
          ))
        )}
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  vehicleName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 16,
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  totalLabel: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    opacity: 0.9,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  totalSubtitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  maintenanceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  maintenanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  maintenanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  maintenanceType: {
    fontSize: 16,
    fontWeight: "600",
  },
  maintenanceCost: {
    fontSize: 16,
    fontWeight: "bold",
  },
  maintenanceDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  maintenanceDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default InvestmentDetailScreen;
