import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  hs,
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

  const totalMaintenances = vehicleStats.reduce(
    (sum, vehicle) => sum + vehicle.maintenanceCount,
    0,
  );
  const totalRepairs = vehicleStats.reduce(
    (sum, vehicle) => sum + vehicle.repairCount,
    0,
  );
  const totalExtras = vehicleStats.reduce(
    (sum, vehicle) => sum + vehicle.expenseCount,
    0,
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroMediaRow}>
                <View
                  style={[styles.imagePlaceholder, styles.heroImagePlaceholder]}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={s(44)}
                    color="#D6E7FF"
                  />
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.eyebrow}>Control financiero</Text>
                  <Text style={styles.title}>Inversión Total</Text>
                  <Text style={styles.subtitle}>
                    Visualiza costos de mantenimiento, reparaciones y gastos por
                    unidad.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.helpButtonHero}
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
                  size={iconSize.lg}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Card de inversión total */}
          <LinearGradient
            colors={[COLORS.primary, "#0F5FD2", "#1673E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalCard}
          >
            <View style={styles.totalIconBadge}>
              <Ionicons name="cash-outline" size={iconSize.xl} color="#fff" />
            </View>
            <Text style={styles.totalLabel}>Total invertido</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalInvestment, currencySymbol)}
            </Text>
            <View style={styles.totalBreakdownRow}>
              <View style={styles.totalBreakdownPill}>
                <Text style={styles.totalBreakdownText}>
                  {vehicles.length} vehículos
                </Text>
              </View>
              <View style={styles.totalBreakdownPill}>
                <Text style={styles.totalBreakdownText}>
                  {totalMaintenances} servicios
                </Text>
              </View>
              <View style={styles.totalBreakdownPill}>
                <Text style={styles.totalBreakdownText}>
                  {totalRepairs} reparaciones
                </Text>
              </View>
              <View style={styles.totalBreakdownPill}>
                <Text style={styles.totalBreakdownText}>
                  {totalExtras} otros
                </Text>
              </View>
            </View>
          </LinearGradient>

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
                  <View style={styles.statsColumn}>
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
    paddingBottom: vs(40),
  },
  heroGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(18),
    paddingBottom: vs(18),
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(12),
  },
  heroImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerInfo: {
    flex: 1,
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
    color: "rgba(255,255,255,0.74)",
  },
  title: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    marginTop: vs(4),
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.84)",
  },
  helpButtonHero: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: hs(12),
  },
  totalCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: vs(24),
    marginHorizontal: spacing.lg,
    elevation: s(4),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: s(14),
    overflow: "hidden",
  },
  totalIconBadge: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  totalLabel: {
    color: "#fff",
    fontSize: rf(14),
    marginTop: spacing.sm,
    opacity: 0.88,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "700",
  },
  totalAmount: {
    color: "#fff",
    fontSize: rf(36),
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  totalBreakdownRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  totalBreakdownPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  totalBreakdownText: {
    color: "#fff",
    fontSize: rf(12),
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "800",
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  vehicleCard: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
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
  statsColumn: {
    gap: spacing.xs,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
    alignSelf: "flex-start",
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
