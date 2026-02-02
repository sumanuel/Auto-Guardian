import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "../components/common/DatePicker";
import { useApp } from "../context/AppContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import {
  deleteExpense,
  getExpensesByVehicle,
} from "../services/expenseService";
import { deleteRepair, getRepairsByVehicle } from "../services/repairService";
import { formatDate } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatUtils";
import { getMaintenanceIcon } from "../utils/maintenanceIcons";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const InvestmentDetailScreen = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const { colors } = useTheme();
  const { currencySymbol } = useAppSettings();
  const { vehicles, getAllMaintenances } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const [vehicle, setVehicle] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [activeTab, setActiveTab] = useState("mantenimientos");
  const [dateFilterModal, setDateFilterModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [vehicleId, vehicles]),
  );

  useEffect(() => {
    loadData();
  }, [vehicleId, vehicles]);

  const loadData = (filterFrom = null, filterTo = null) => {
    const vehicleData = vehicles.find((v) => v.id === vehicleId);
    setVehicle(vehicleData);

    const allMaintenances = getAllMaintenances();
    let vehicleMaintenances = allMaintenances
      .filter((m) => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Obtener movimientos particulares
    let vehicleExpenses = getExpensesByVehicle(vehicleId);

    // Obtener reparaciones
    let vehicleRepairs = getRepairsByVehicle(vehicleId);

    // Aplicar filtro de fechas si existe
    if (filterFrom && filterTo) {
      // Función helper para comparar solo fechas (sin hora ni zona horaria)
      const isDateInRange = (dateStr) => {
        // Extraer la fecha como string YYYY-MM-DD
        let itemDateStr;
        if (dateStr.includes("T")) {
          itemDateStr = dateStr.split("T")[0];
        } else {
          itemDateStr = dateStr;
        }

        // Extraer las fechas del filtro como strings YYYY-MM-DD
        const fromDateStr = filterFrom.toISOString().split("T")[0];
        const toDateStr = filterTo.toISOString().split("T")[0];

        // Comparar las strings de fecha
        return itemDateStr >= fromDateStr && itemDateStr <= toDateStr;
      };

      vehicleMaintenances = vehicleMaintenances.filter((m) =>
        isDateInRange(m.date),
      );
      vehicleExpenses = vehicleExpenses.filter((e) => isDateInRange(e.date));
      vehicleRepairs = vehicleRepairs.filter((r) => isDateInRange(r.date));
    }

    setMaintenances(vehicleMaintenances);
    setExpenses(vehicleExpenses);
    setRepairs(vehicleRepairs);

    // Calcular total (mantenimientos + movimientos + reparaciones)
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
    setTotalCost(maintenanceTotal + expenseTotal + repairTotal);

    // Calcular estadísticas de servicios, reparaciones y otros
    const stats = [];

    // Mantenimientos (mantenimientos con costo)
    const servicesWithCost = vehicleMaintenances.filter(
      (m) => m.cost && m.cost > 0,
    );
    const servicesTotal = servicesWithCost.reduce(
      (sum, m) => sum + (m.cost || 0),
      0,
    );
    if (servicesWithCost.length > 0) {
      stats.push({
        name: "Mantenimientos",
        total: servicesTotal,
        count: servicesWithCost.length,
      });
    }

    // Reparaciones
    const repairsTotal = vehicleRepairs.reduce(
      (sum, r) => sum + (r.cost || 0),
      0,
    );
    if (vehicleRepairs.length > 0) {
      stats.push({
        name: "Reparaciones",
        total: repairsTotal,
        count: vehicleRepairs.length,
      });
    }

    // Otros (gastos)
    const expensesTotal = vehicleExpenses.reduce(
      (sum, e) => sum + (e.cost || 0),
      0,
    );
    if (vehicleExpenses.length > 0) {
      stats.push({
        name: "Otros",
        total: expensesTotal,
        count: vehicleExpenses.length,
      });
    }

    setCategoryStats(stats);
  };

  const openDateFilter = () => {
    setDateFilterModal(true);
  };

  const applyDateFilter = () => {
    if (dateFrom && dateTo) {
      loadData(dateFrom, dateTo);
      setIsFiltered(true);
      setDateFilterModal(false);
    } else {
      showDialog({
        title: "Fechas requeridas",
        message:
          "Por favor selecciona tanto la fecha desde como la fecha hasta.",
        type: "warning",
      });
    }
  };

  const clearDateFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    setIsFiltered(false);
    loadData();
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

  const handleDeleteRepair = (repairId, description) => {
    showDialog({
      title: "Eliminar reparación",
      message: `¿Deseas eliminar la reparación "${description}"?`,
      type: "confirm",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRepair(repairId);
              loadData();
              showDialog({
                title: "Eliminado",
                message: "La reparación fue eliminada correctamente.",
                type: "success",
              });
            } catch (error) {
              showDialog({
                title: "Error",
                message: "No se pudo eliminar la reparación",
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
            <View style={styles.headerLeft}>
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
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.filterIcon}
                onPress={openDateFilter}
              >
                <Ionicons
                  name="calendar-outline"
                  size={iconSize.md}
                  color={isFiltered ? COLORS.success : colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterIcon}
                onPress={clearDateFilter}
              >
                <Ionicons
                  name="refresh-outline"
                  size={iconSize.md}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterIcon}
                onPress={() =>
                  showDialog({
                    title: "📅 Filtro por fechas",
                    message:
                      "Utiliza el calendario para filtrar los movimientos financieros por un rango de fechas específico. El total mostrado se actualizará automáticamente para reflejar solo los gastos, reparaciones y mantenimientos dentro del período seleccionado. Usa el botón de refrescar para limpiar el filtro y ver todos los movimientos.",
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
          </View>

          {/* Tarjeta de total */}
          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Ionicons name="cash-outline" size={iconSize.xl} color="#fff" />
            <Text style={styles.totalLabel}>Total Invertido</Text>
            {isFiltered && (
              <Text
                style={[styles.totalLabel, { fontSize: rf(12), opacity: 0.9 }]}
              >
                Desde {formatDate(dateFrom)} hasta {formatDate(dateTo)}
              </Text>
            )}
            <Text style={styles.totalAmount}>
              {formatCurrency(totalCost, currencySymbol)}
            </Text>
            <Text style={styles.totalSubtitle}>
              {maintenances.length}{" "}
              {maintenances.length === 1 ? "mantenimiento" : "mantenimientos"} •{" "}
              {repairs.length}{" "}
              {repairs.length === 1 ? "reparación" : "reparaciones"} •{" "}
              {expenses.length} {expenses.length === 1 ? "otro" : "otros"}
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
                        size={iconSize.md}
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
                      {formatCurrency(category.total, currencySymbol)}
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
                activeTab === "mantenimientos" && styles.tabActive,
                {
                  backgroundColor:
                    activeTab === "mantenimientos"
                      ? colors.primary
                      : colors.cardBackground,
                },
              ]}
              onPress={() => setActiveTab("mantenimientos")}
            >
              <Ionicons
                name="construct"
                size={iconSize.md}
                color={activeTab === "mantenimientos" ? "#fff" : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "reparaciones" && styles.tabActive,
                {
                  backgroundColor:
                    activeTab === "reparaciones"
                      ? colors.primary
                      : colors.cardBackground,
                },
              ]}
              onPress={() => setActiveTab("reparaciones")}
            >
              <Ionicons
                name="build"
                size={iconSize.md}
                color={activeTab === "reparaciones" ? "#fff" : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "otros" && styles.tabActive,
                {
                  backgroundColor:
                    activeTab === "otros"
                      ? colors.primary
                      : colors.cardBackground,
                },
              ]}
              onPress={() => setActiveTab("otros")}
            >
              <Ionicons
                name="cart"
                size={iconSize.md}
                color={activeTab === "otros" ? "#fff" : colors.text}
              />
            </TouchableOpacity>
          </View>

          {activeTab === "mantenimientos" && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Mantenimientos
              </Text>
              {maintenances.filter((m) => m.cost && m.cost > 0).length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="construct-outline"
                    size={iconSize.xxl}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No hay mantenimientos registrados
                  </Text>
                </View>
              ) : (
                maintenances
                  .filter((m) => m.cost && m.cost > 0)
                  .slice(0, 5)
                  .map((maintenance) => (
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
                            size={iconSize.sm}
                            color={colors.primary}
                          />
                          <Text
                            style={[
                              styles.maintenanceType,
                              { color: colors.text },
                            ]}
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
                          {formatCurrency(maintenance.cost, currencySymbol)}
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
            </>
          )}

          {activeTab === "reparaciones" && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Reparaciones
              </Text>
              {repairs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="build-outline"
                    size={iconSize.xxl}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No hay reparaciones registradas
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Presiona el botón + para agregar una reparación
                  </Text>
                </View>
              ) : (
                repairs.map((repair) => (
                  <View
                    key={repair.id}
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
                          name="build-outline"
                          size={iconSize.sm}
                          color={colors.primary}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.maintenanceType,
                              { color: colors.text },
                            ]}
                          >
                            {repair.description}
                          </Text>
                          {repair.workshop && (
                            <Text
                              style={[
                                styles.expenseCategory,
                                { color: colors.textSecondary },
                              ]}
                            >
                              🔧 {repair.workshop}
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteRepair(repair.id, repair.description)
                        }
                        style={styles.deleteButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={iconSize.sm}
                          color={COLORS.danger}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.maintenanceCost,
                          { color: colors.primary },
                        ]}
                      >
                        {formatCurrency(repair.cost, currencySymbol)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.maintenanceDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDate(repair.date)}
                    </Text>
                    {repair.notes && (
                      <Text
                        style={[
                          styles.maintenanceDescription,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {repair.notes}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </>
          )}

          {activeTab === "otros" && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Otros
              </Text>
              {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="wallet-outline"
                    size={iconSize.xxl}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    No hay movimientos registrados
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: colors.textSecondary },
                    ]}
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
                          size={iconSize.sm}
                          color={colors.primary}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.maintenanceType,
                              { color: colors.text },
                            ]}
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
                          size={iconSize.sm}
                          color={COLORS.danger}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.maintenanceCost,
                          { color: colors.primary },
                        ]}
                      >
                        {formatCurrency(expense.cost, currencySymbol)}
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
            </>
          )}
        </ScrollView>

        {/* Botón flotante para agregar gasto o reparación */}
        {(activeTab === "otros" || activeTab === "reparaciones") && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() =>
              activeTab === "otros"
                ? navigation.navigate("AddExpense", { vehicleId })
                : navigation.navigate("AddRepair", { vehicleId })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={iconSize.lg} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para filtro de fechas */}
      <Modal
        visible={dateFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDateFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Filtrar por fechas
              </Text>
              <TouchableOpacity onPress={() => setDateFilterModal(false)}>
                <Ionicons name="close" size={iconSize.md} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <DatePicker
                label="Fecha desde"
                value={dateFrom}
                onChange={setDateFrom}
                maximumDate={dateTo || new Date()}
              />

              <DatePicker
                label="Fecha hasta"
                value={dateTo}
                onChange={setDateTo}
                minimumDate={dateFrom}
                maximumDate={new Date()}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDateFilterModal(false)}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.primary }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={applyDateFilter}
              >
                <Text style={styles.modalButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing.lg,
    paddingBottom: vs(100),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterIcon: {
    padding: spacing.xs,
  },
  vehicleName: {
    fontSize: rf(28),
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  vehicleDetails: {
    fontSize: rf(16),
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
  categoryCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.xxs,
  },
  categoryCount: {
    fontSize: rf(12),
  },
  categoryAmount: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: s(6),
    borderRadius: borderRadius.xs,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: borderRadius.xs,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: vs(10),
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    gap: spacing.xxs,
  },
  tabActive: {
    elevation: s(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
  },
  tabText: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: rf(14),
    fontWeight: "600",
  },
  maintenanceCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
  },
  maintenanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  maintenanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  maintenanceType: {
    fontSize: rf(16),
    fontWeight: "600",
  },
  maintenanceCost: {
    fontSize: rf(16),
    fontWeight: "bold",
  },
  maintenanceDate: {
    fontSize: rf(13),
    marginBottom: spacing.xs,
  },
  maintenanceDescription: {
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyText: {
    fontSize: rf(16),
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: rf(14),
    marginTop: spacing.xs,
    textAlign: "center",
  },
  expenseCategory: {
    fontSize: rf(12),
    marginTop: spacing.xxs,
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: COLORS.primary,
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: s(4),
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: s(420),
    maxHeight: "80%",
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  modalBody: {
    marginBottom: spacing.lg,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: vs(12),
    paddingHorizontal: hs(24),
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: s(1),
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#fff",
  },
});

export default InvestmentDetailScreen;
