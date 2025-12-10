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
import { getAllExpenses } from "../services/expenseService";
import { getAllRepairs } from "../services/repairService";
import { formatCurrency } from "../utils/formatUtils";

const StatsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { vehicles, getAllMaintenances } = useApp();
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [vehicleStats, setVehicleStats] = useState([]);

  useEffect(() => {
    calculateInvestment();
  }, [vehicles]);

  const calculateInvestment = () => {
    const allMaintenances = getAllMaintenances();
    const allExpenses = getAllExpenses();
    const allRepairs = getAllRepairs();

    // Calcular total general (mantenimientos + gastos + reparaciones)
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
    const statsPerVehicle = vehicles
      .map((vehicle) => {
        const vehicleMaintenances = allMaintenances.filter(
          (m) => m.vehicleId === vehicle.id
        );
        const vehicleExpenses = allExpenses.filter(
          (e) => e.vehicleId === vehicle.id
        );
        const vehicleRepairs = allRepairs.filter(
          (r) => r.vehicleId === vehicle.id
        );

        const maintenanceTotal = vehicleMaintenances.reduce(
          (sum, m) => sum + (m.cost || 0),
          0
        );
        const expenseTotal = vehicleExpenses.reduce(
          (sum, e) => sum + (e.cost || 0),
          0
        );
        const repairTotal = vehicleRepairs.reduce(
          (sum, r) => sum + (r.cost || 0),
          0
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
      })
      .sort((a, b) => b.totalCost - a.totalCost); // Ordenar por mayor gasto

    setVehicleStats(statsPerVehicle);
  };

  const handleVehiclePress = (vehicleId) => {
    navigation.navigate("InvestmentDetail", { vehicleId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Inversión Total
        </Text>

        {/* Card de inversión total */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Ionicons name="cash-outline" size={48} color="#fff" />
          <Text style={styles.totalLabel}>Total Invertido</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalInvestment)}
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
              size={60}
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
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[styles.statText, { color: colors.textSecondary }]}
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
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[styles.statText, { color: colors.textSecondary }]}
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
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[styles.statText, { color: colors.textSecondary }]}
                    >
                      {vehicle.expenseCount}{" "}
                      {vehicle.expenseCount === 1 ? "otro" : "otros"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.costContainer}>
                <Text style={[styles.costAmount, { color: colors.primary }]}>
                  {formatCurrency(vehicle.totalCost)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
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
  vehicleCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  costContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  costAmount: {
    fontSize: 20,
    fontWeight: "bold",
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

export default StatsScreen;
