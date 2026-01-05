import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { useResponsive } from "../hooks/useResponsive";
import { getAllExpenses } from "../services/expenseService";
import { getAllRepairs } from "../services/repairService";
import { formatCurrency } from "../utils/formatUtils";

const StatsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const { vehicles, getAllMaintenances } = useApp();
  const { scale, verticalScale, moderateScale } = useResponsive();
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
      existingVehicleIds.includes(e.vehicleId)
    );
    const allRepairs = getAllRepairs().filter((r) =>
      existingVehicleIds.includes(r.vehicleId)
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
    });
    // Mantener el mismo orden que en HomeScreen (no ordenar por costo)

    setVehicleStats(statsPerVehicle);
  };

  const handleVehiclePress = (vehicleId) => {
    navigation.navigate("InvestmentDetail", { vehicleId });
  };

  const responsiveStyles = {
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: scale(20),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(24),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: "bold",
    },
    totalInvestmentCard: {
      borderRadius: scale(12),
      padding: scale(20),
      marginBottom: verticalScale(24),
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    totalInvestmentTitle: {
      fontSize: moderateScale(18),
      fontWeight: "600",
      marginBottom: verticalScale(8),
    },
    totalInvestmentAmount: {
      fontSize: moderateScale(32),
      fontWeight: "bold",
    },
    vehiclesList: {
      gap: verticalScale(16),
    },
    vehicleCard: {
      borderRadius: scale(12),
      padding: scale(16),
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    vehicleHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(12),
    },
    vehicleInfo: {
      flex: 1,
    },
    vehicleName: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
      marginBottom: verticalScale(4),
    },
    vehicleDetails: {
      fontSize: moderateScale(14),
    },
    statsRow: {
      flexDirection: "row",
      gap: scale(16),
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    statText: {
      fontSize: moderateScale(13),
    },
    costContainer: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: scale(8),
    },
    costAmount: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: verticalScale(60),
    },
    emptyText: {
      fontSize: moderateScale(16),
      marginTop: verticalScale(16),
    },
  };

  return (
    <DialogComponent>
      <View
        style={[
          responsiveStyles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <ScrollView
          style={responsiveStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={responsiveStyles.header}>
            <Text style={[responsiveStyles.title, { color: colors.text }]}>
              Estadísticas
            </Text>
          </View>

          <View
            style={[
              responsiveStyles.totalInvestmentCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[
                responsiveStyles.totalInvestmentTitle,
                { color: colors.text },
              ]}
            >
              Inversión Total
            </Text>
            <Text
              style={[
                responsiveStyles.totalInvestmentAmount,
                { color: colors.primary },
              ]}
            >
              {formatCurrency(totalInvestment)}
            </Text>
          </View>

          <View style={responsiveStyles.vehiclesList}>
            {vehicleStats.length > 0 ? (
              vehicleStats.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    responsiveStyles.vehicleCard,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                >
                  <View style={responsiveStyles.vehicleHeader}>
                    <View style={responsiveStyles.vehicleInfo}>
                      <Text
                        style={[
                          responsiveStyles.vehicleName,
                          { color: colors.text },
                        ]}
                      >
                        {vehicle.name}
                      </Text>
                      <Text
                        style={[
                          responsiveStyles.vehicleDetails,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.brand} {vehicle.model} • {vehicle.plate}
                      </Text>
                    </View>
                    <View style={responsiveStyles.costContainer}>
                      <Text
                        style={[
                          responsiveStyles.costAmount,
                          { color: colors.primary },
                        ]}
                      >
                        {formatCurrency(vehicle.totalCost)}
                      </Text>
                    </View>
                  </View>

                  <View style={responsiveStyles.statsRow}>
                    <View style={responsiveStyles.statItem}>
                      <Ionicons
                        name="construct-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          responsiveStyles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.maintenanceCount} mantenimientos
                      </Text>
                    </View>
                    <View style={responsiveStyles.statItem}>
                      <Ionicons
                        name="cash-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          responsiveStyles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {vehicle.expenseCount} gastos
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={responsiveStyles.emptyState}>
                <Ionicons
                  name="stats-chart-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    responsiveStyles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No hay datos para mostrar
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </DialogComponent>
  );
};

export default StatsScreen;
