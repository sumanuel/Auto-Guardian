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
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { getAllExpenses } from "../services/expenseService";
import { getAllRepairs } from "../services/repairService";
import { formatCurrency } from "../utils/formatUtils";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const StatsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const { vehicles, getAllMaintenances } = useApp();
  const { currencySymbol } = useAppSettings();
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [vehicleStats, setVehicleStats] = useState([]);

  useEffect(() => {
    calculateInvestment();
  }, [vehicles]);

  const calculateInvestment = () => {
    const allMaintenances = getAllMaintenances();

    // Obtener solo los IDs de vehículos existentes
    const existingVehicleIds = vehicles.map((v) => v.id);

    // Obtener todos los gastos y reparaciones, pero solo de vehículos existentes
    const allExpenses = getAllExpenses().filter((e) =>
      existingVehicleIds.includes(e.vehicleId),
    );
    const allRepairs = getAllRepairs().filter((r) =>
      existingVehicleIds.includes(r.vehicleId),
    );

    // Calcular total general (mantenimientos + gastos + reparaciones)
    // getAllMaintenances() ya filtra por vehículos existentes
    const maintenanceTotal = allMaintenances.reduce((sum, maintenance) => {
      return sum + (maintenance.cost || 0);
    }, 0);

    const expenseTotal = allExpenses.reduce((sum, expense) => {
      return sum + (expense.cost || 0);
    }, 0);

    const repairTotal = allRepairs.reduce((sum, repair) => {
      return sum + (repair.cost || 0);
    }, 0);

    const total = maintenanceTotal + expenseTotal + repairTotal;

    setTotalInvestment(total);

    // Calcular por vehículo
    const statsPerVehicle = vehicles.map((vehicle) => {
      const vehicleMaintenances = allMaintenances.filter(
        (m) => m.vehicleId === vehicle.id,
      );
      const vehicleExpenses = allExpenses.filter(
        (e) => e.vehicleId === vehicle.id,
      );
      const vehicleRepairs = allRepairs.filter(
        (r) => r.vehicleId === vehicle.id,
      );

      const maintenanceTotal = vehicleMaintenances.reduce(
        (sum, m) => sum + (m.cost || 0),
        0,
      );
      const expenseTotal = vehicleExpenses.reduce(
        (sum, e) => sum + (e.cost || 0),
        0,
      );
      const repairTotal = vehicleRepairs.reduce(
        (sum, r) => sum + (r.cost || 0),
        0,
      );
      const totalCost = maintenanceTotal + expenseTotal + repairTotal;
      const maintenanceCount = vehicleMaintenances.length;
      const expenseCount = vehicleExpenses.length;
      const repairCount = vehicleRepairs.length;

      return {
        id: vehicle.id,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        totalCost,
        maintenanceCount,
        expenseCount,
        repairCount,
        photo: vehicle.photo,
      };
    });
    // Mantener el mismo orden que en HomeScreen (no ordenar por costo)

    setVehicleStats(statsPerVehicle);
  };

  const handleVehiclePress = (vehicleId) => {
    navigation.navigate("InvestmentDetail", { vehicleId });
  };

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Inversión Total
            </Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() =>
                showDialog({
                  title: "Estadísticas de Inversión",
                  message:
                    "Aquí puedes ver un resumen completo de toda la inversión realizada en tus vehículos. Incluye costos de mantenimientos, reparaciones y otros gastos, organizados por vehículo para que puedas hacer un seguimiento detallado de tus finanzas automotrices.",
                  type: "info",
                })
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={iconSize.md}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Card de inversión total */}
          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Ionicons name="cash-outline" size={iconSize.xl} color="#fff" />
            <Text style={styles.totalLabel}>Total Invertido</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalInvestment, currencySymbol)}
            </Text>
            <Text style={styles.totalSubtitle}>
              En {vehicleStats.reduce((sum, v) => sum + v.maintenanceCount, 0)}{" "}
              mantenimientos •{" "}
              {vehicleStats.reduce((sum, v) => sum + v.repairCount, 0)}{" "}
              reparaciones •{" "}
              {vehicleStats.reduce((sum, v) => sum + v.expenseCount, 0)} otros
            </Text>
          </View>

          {/* Lista de vehículos */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Inversión por Vehículo
          </Text>

          {vehicleStats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="car-outline"
                size={iconSize.xxl}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay vehículos registrados
              </Text>
            </View>
          ) : (
            vehicleStats.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadow,
                  },
                ]}
                onPress={() => handleVehiclePress(vehicle.id)}
              >
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <Text style={[styles.vehicleName, { color: colors.text }]}>
                      {vehicle.name}
                    </Text>
                    {vehicle.brand && vehicle.model && (
                      <Text
                        style={[
                          styles.vehicleDetails,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.brand} {vehicle.model}
                      </Text>
                    )}
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="construct-outline"
                        size={iconSize.sm}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.maintenanceCount}{" "}
                        {vehicle.maintenanceCount === 1
                          ? "servicio"
                          : "servicios"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="build-outline"
                        size={iconSize.sm}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.repairCount}{" "}
                        {vehicle.repairCount === 1
                          ? "reparación"
                          : "reparaciones"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="wallet-outline"
                        size={iconSize.sm}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.expenseCount}{" "}
                        {vehicle.expenseCount === 1 ? "otro" : "otros"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.costContainer}>
                  <Text style={[styles.costAmount, { color: colors.primary }]}>
                    {formatCurrency(vehicle.totalCost, currencySymbol)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={iconSize.sm}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(40),
  },
  title: {
    fontSize: rf(28),
    fontWeight: "bold",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: vs(32),
    elevation: s(4),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: s(8),
  },
  totalLabel: {
    color: "#fff",
    fontSize: rf(14),
    marginTop: spacing.sm,
    opacity: 0.9,
  },
  totalAmount: {
    color: "#fff",
    fontSize: rf(36),
    fontWeight: "bold",
    marginTop: spacing.xs,
  },
  totalSubtitle: {
    color: "#fff",
    fontSize: rf(12),
    marginTop: spacing.xxs,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    marginBottom: spacing.xs,
  },
  vehicleName: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  vehicleDetails: {
    fontSize: rf(14),
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  statText: {
    fontSize: rf(13),
  },
  costContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
  },
  costAmount: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyText: {
    fontSize: rf(16),
    marginTop: spacing.md,
  },
});

export default StatsScreen;
