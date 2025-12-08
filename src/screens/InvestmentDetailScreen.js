import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import {
  deleteExpense,
  getExpensesByVehicle,
} from "../services/expenseService";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatUtils";
import { getMaintenanceIcon } from "../utils/maintenanceIcons";

const InvestmentDetailScreen = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const { colors } = useTheme();
  const { vehicles, getAllMaintenances } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const [vehicle, setVehicle] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [showExpenses, setShowExpenses] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [vehicleId, vehicles])
  );

  useEffect(() => {
    loadData();
  }, [vehicleId, vehicles]);

  const loadData = () => {
    const vehicleData = vehicles.find((v) => v.id === vehicleId);
    setVehicle(vehicleData);

    const allMaintenances = getAllMaintenances();
    const vehicleMaintenances = allMaintenances
      .filter((m) => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setMaintenances(vehicleMaintenances);

    // Obtener movimientos particulares
    const vehicleExpenses = getExpensesByVehicle(vehicleId);
    setExpenses(vehicleExpenses);

    // Calcular total (mantenimientos + movimientos)
    const maintenanceTotal = vehicleMaintenances.reduce(
      (sum, m) => sum + (m.cost || 0),
      0
    );
    const expenseTotal = vehicleExpenses.reduce(
      (sum, e) => sum + (e.cost || 0),
      0
    );
    setTotalCost(maintenanceTotal + expenseTotal);

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

    const categoryArray = Object.values(categories)
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total);
    setCategoryStats(categoryArray);
  };

  const handleDeleteExpense = (expenseId, description) => {
    showDialog({
      title: "Eliminar movimiento",
      message: `¿Deseas eliminar el movimiento "${description}"?`,
      type: "confirm",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              loadData();
              showDialog({
                title: "Eliminado",
                message: "El movimiento fue eliminado correctamente.",
                type: "success",
              });
            } catch (error) {
              showDialog({
                title: "Error",
                message: "No se pudo eliminar el movimiento",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  if (!vehicle) {
    return (
      <DialogComponent>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <Text style={{ color: colors.text }}>Cargando...</Text>
        </View>
      </DialogComponent>
    );
  }

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
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
              {maintenances.length === 1 ? "mantenimiento" : "mantenimientos"} •{" "}
              {expenses.length}{" "}
              {expenses.length === 1 ? "movimiento" : "movimientos"}
            </Text>
          </View>

          {/* Movimientos por categoría */}
          {categoryStats.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Movimientos por Categoría
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
                        name={getMaintenanceIcon(category.name)}
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

          {/* Tabs para filtrar */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                !showExpenses && styles.tabActive,
                {
                  backgroundColor: !showExpenses
                    ? colors.primary
                    : colors.cardBackground,
                },
              ]}
              onPress={() => setShowExpenses(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !showExpenses ? "#fff" : colors.text },
                ]}
              >
                Mantenimientos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                showExpenses && styles.tabActive,
                {
                  backgroundColor: showExpenses
                    ? colors.primary
                    : colors.cardBackground,
                },
              ]}
              onPress={() => setShowExpenses(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: showExpenses ? "#fff" : colors.text },
                ]}
              >
                Otros
              </Text>
            </TouchableOpacity>
          </View>

          {!showExpenses ? (
            // Mostrar Mantenimientos
            maintenances.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="construct-outline"
                  size={60}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
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
                        name={getMaintenanceIcon(maintenance.type)}
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
                      style={[
                        styles.maintenanceCost,
                        { color: colors.primary },
                      ]}
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
            )
          ) : // Mostrar Movimientos Particulares
          expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="wallet-outline"
                size={60}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay movimientos registrados
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Presiona el botón + para agregar un movimiento
              </Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <View
                key={expense.id}
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
                      name="wallet-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.maintenanceType, { color: colors.text }]}
                      >
                        {expense.description}
                      </Text>
                      {expense.category && (
                        <Text
                          style={[
                            styles.expenseCategory,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {expense.category}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteExpense(expense.id, expense.description)
                    }
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.danger}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.maintenanceCost, { color: colors.primary }]}
                  >
                    {formatCurrency(expense.cost)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.maintenanceDate,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatDate(expense.date)}
                </Text>
                {expense.notes && (
                  <Text
                    style={[
                      styles.maintenanceDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {expense.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Botón flotante para agregar gasto */}
        {showExpenses && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate("AddExpense", { vehicleId })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
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
  tabsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
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
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  expenseCategory: {
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
});

export default InvestmentDetailScreen;
