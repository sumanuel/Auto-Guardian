import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
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
import { COLORS } from "../data/constants";
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

  const calculateInvestment = useCallback(() => {
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
  }, [getAllMaintenances, vehicles]);

  useEffect(() => {
    calculateInvestment();
  }, [calculateInvestment]);

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
            <View style={styles.titleWrap}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                Dashboard financiero
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                Inversión Total
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Visualiza costos de mantenimiento, reparaciones y gastos por
                unidad.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.helpButton,
                { backgroundColor: colors.inputBackground },
              ]}
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

          <View style={styles.summaryGrid}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {vehicles.length}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Vehículos
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {vehicleStats.reduce(
                  (sum, vehicle) => sum + vehicle.maintenanceCount,
                  0,
                )}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Servicios
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {vehicleStats.reduce(
                  (sum, vehicle) => sum + vehicle.repairCount,
                  0,
                )}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Reparaciones
              </Text>
            </View>
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
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  },
                ]}
                onPress={() => handleVehiclePress(vehicle.id)}
              >
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleTitleRow}>
                      <Text
                        style={[styles.vehicleName, { color: colors.text }]}
                      >
                        {vehicle.name}
                      </Text>
                      <View
                        style={[
                          styles.costPill,
                          { backgroundColor: colors.inputBackground },
                        ]}
                      >
                        <Text
                          style={[
                            styles.costPillText,
                            { color: colors.primary },
                          ]}
                        >
                          {formatCurrency(vehicle.totalCost, currencySymbol)}
                        </Text>
                      </View>
                    </View>
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
                    <View
                      style={[
                        styles.statItem,
                        { backgroundColor: colors.inputBackground },
                      ]}
                    >
                      <Ionicons
                        name="construct-outline"
                        size={iconSize.sm}
                        color={colors.primary}
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
                    <View
                      style={[
                        styles.statItem,
                        { backgroundColor: colors.inputBackground },
                      ]}
                    >
                      <Ionicons
                        name="build-outline"
                        size={iconSize.sm}
                        color={COLORS.warning}
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
                    <View
                      style={[
                        styles.statItem,
                        { backgroundColor: colors.inputBackground },
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={iconSize.sm}
                        color={COLORS.success}
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
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  eyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
  },
  title: {
    fontSize: rf(28),
    fontWeight: "800",
  },
  subtitle: {
    fontSize: rf(14),
    lineHeight: rf(20),
    marginTop: vs(6),
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  helpButton: {
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: vs(18),
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
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: vs(24),
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: s(2),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: s(8),
  },
  summaryValue: {
    fontSize: rf(20),
    fontWeight: "800",
    marginBottom: vs(2),
  },
  summaryLabel: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    elevation: s(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    marginBottom: spacing.sm,
  },
  vehicleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  vehicleName: {
    fontSize: rf(18),
    fontWeight: "800",
    marginBottom: spacing.xs,
    flex: 1,
  },
  vehicleDetails: {
    fontSize: rf(14),
  },
  costPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
  },
  costPillText: {
    fontSize: rf(12),
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
  },
  statText: {
    fontSize: rf(13),
    fontWeight: "600",
  },
  costContainer: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
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
