import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../components/common/Button";
import QuickMaintenanceButton from "../components/maintenance/QuickMaintenanceButton";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { formatDate, formatRelativeDate } from "../utils/dateUtils";
import {
  formatCurrency,
  formatDaysRemaining,
  formatKm,
  formatKmRemaining,
  getDateUrgencyColor,
  getKmUrgencyColor,
  getMaintenanceUrgency,
  getUrgencyColor,
} from "../utils/formatUtils";

const VehicleDetailScreen = ({ navigation, route }) => {
  const { vehicleId } = route.params;
  const {
    vehicles,
    getRecentMaintenances,
    getUpcomingMaintenances,
    getMaintenanceStats,
    loadVehicles,
    addMaintenance,
  } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();

  const [vehicle, setVehicle] = useState(null);
  const [recentMaintenances, setRecentMaintenances] = useState([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [nextServiceKm, setNextServiceKm] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    loadVehicleData();
  }, [vehicleId, vehicles]);

  // Recargar datos cuando la pantalla obtiene el foco (al volver de agregar mantenimiento)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadVehicles();
      loadVehicleData();
    });

    return unsubscribe;
  }, [navigation, vehicleId]);

  const loadVehicleData = () => {
    const foundVehicle = vehicles.find((v) => v.id === vehicleId);
    setVehicle(foundVehicle);

    if (foundVehicle) {
      const recent = getRecentMaintenances(vehicleId, 5);
      const upcoming = getUpcomingMaintenances(
        vehicleId,
        foundVehicle.currentKm
      );
      const statistics = getMaintenanceStats(vehicleId);

      setRecentMaintenances(recent);
      setUpcomingMaintenances(upcoming);
      setStats(statistics);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    loadVehicleData();
    setRefreshing(false);
  };

  const handleCompleteMaintenance = (maintenance) => {
    setSelectedMaintenance(maintenance);
    // Sugerir próximo servicio basado en el actual
    if (maintenance.nextServiceKm && vehicle.currentKm) {
      const interval =
        maintenance.nextServiceKm - (maintenance.km || vehicle.currentKm);
      setNextServiceKm(String((vehicle.currentKm || 0) + interval));
    }
    setCompleteModalVisible(true);
  };

  const confirmCompleteMaintenance = async () => {
    try {
      const now = new Date().toISOString();

      await addMaintenance({
        vehicleId,
        type: selectedMaintenance.type,
        category: selectedMaintenance.category,
        date: now,
        km: vehicle.currentKm,
        cost: cost ? parseFloat(cost) : null,
        nextServiceKm: nextServiceKm ? parseInt(nextServiceKm) : null,
        nextServiceDate: nextServiceDate || null,
      });

      setCompleteModalVisible(false);
      setSelectedMaintenance(null);
      setNextServiceKm("");
      setNextServiceDate("");
      setCost("");

      await loadVehicles();
      loadVehicleData();

      showDialog({
        title: "✅ Completado",
        message: `Mantenimiento de ${selectedMaintenance.type} registrado correctamente.`,
        type: "success",
      });
    } catch (error) {
      showDialog({
        title: "Error",
        message: "No se pudo completar el mantenimiento",
        type: "error",
      });
    }
  };

  const renderMaintenanceItem = (item) => {
    const urgency = getMaintenanceUrgency(
      vehicle?.currentKm,
      item.nextServiceKm,
      item.nextServiceDate
    );
    const urgencyColor = getUrgencyColor(urgency);

    // Calcular información de próximo servicio
    const nextServiceInfo = [];

    // Agregar info de kilometraje si existe
    const kmInfo = formatKmRemaining(vehicle?.currentKm, item.nextServiceKm);
    if (kmInfo) {
      const kmRemaining = item.nextServiceKm - (vehicle?.currentKm || 0);
      nextServiceInfo.push({
        icon: "speedometer-outline",
        text: kmInfo,
        isOverdue: kmRemaining <= 0,
        color: getKmUrgencyColor(vehicle?.currentKm, item.nextServiceKm),
      });
    }

    // Agregar info de fecha si existe
    const dateInfo = formatDaysRemaining(item.nextServiceDate);
    if (dateInfo) {
      const daysRemaining = Math.floor(
        (new Date(item.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      nextServiceInfo.push({
        icon: "calendar-outline",
        text: dateInfo,
        isOverdue: daysRemaining < 0,
        color: getDateUrgencyColor(item.nextServiceDate),
      });
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.maintenanceItem, { borderBottomColor: colors.border }]}
        onPress={() => {
          navigation.navigate("MaintenanceHistory", {
            vehicleId,
            sortByUrgency: true,
          });
        }}
      >
        <View
          style={[styles.urgencyIndicator, { backgroundColor: urgencyColor }]}
        />
        <View style={styles.maintenanceContent}>
          <Text style={[styles.maintenanceType, { color: colors.text }]}>
            {item.type}
          </Text>
          <Text
            style={[styles.maintenanceDate, { color: colors.textSecondary }]}
          >
            {formatRelativeDate(item.date)}
          </Text>
          {item.km && (
            <Text
              style={[styles.maintenanceKm, { color: colors.textSecondary }]}
            >
              a los {formatKm(item.km)}
            </Text>
          )}

          {/* Información de próximo servicio */}
          {nextServiceInfo.length > 0 && (
            <View style={styles.nextServiceContainer}>
              {nextServiceInfo.map((info, index) => (
                <View key={index} style={styles.nextServiceItem}>
                  <Ionicons name={info.icon} size={14} color={info.color} />
                  <Text
                    style={[
                      styles.nextServiceText,
                      { color: info.color, fontWeight: "600" },
                    ]}
                  >
                    {info.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {item.cost && (
          <Text style={styles.maintenanceCost}>
            {formatCurrency(item.cost)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const quickMaintenanceTypes = [
    {
      id: 1,
      icon: "water-outline",
      label: "Cambio de Aceite",
      color: "#FF9800",
    },
    { id: 2, icon: "car-outline", label: "Filtros", color: "#4CAF50" },
    { id: 3, icon: "flash-outline", label: "Bujías", color: "#F44336" },
    { id: 4, icon: "disc-outline", label: "Frenos", color: "#9C27B0" },
    { id: 5, icon: "stats-chart-outline", label: "Revisión", color: "#2196F3" },
  ];

  const handleQuickMaintenance = (maintenanceType) => {
    navigation.navigate("AddMaintenance", {
      vehicleId,
      quickType: maintenanceType.label,
    });
  };

  if (!vehicle) {
    return (
      <DialogComponent>
        <View style={styles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      </DialogComponent>
    );
  }

  return (
    <DialogComponent>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con imagen del vehículo */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {vehicle.photo ? (
            <Image
              source={{ uri: vehicle.photo }}
              style={styles.vehicleImage}
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Ionicons name="car" size={60} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {vehicle.name}
            </Text>
            <Text
              style={[styles.vehicleDetails, { color: colors.textSecondary }]}
            >
              {vehicle.brand} {vehicle.model}{" "}
              {vehicle.year ? `(${vehicle.year})` : ""}
            </Text>
            {vehicle.plate && (
              <Text
                style={[styles.vehiclePlate, { color: colors.textSecondary }]}
              >
                Placa: {vehicle.plate}
              </Text>
            )}
          </View>
        </View>

        {/* Kilometraje actual */}
        <View
          style={[
            styles.kmSection,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.kmInfo}>
            <Ionicons name="speedometer" size={32} color={colors.primary} />
            <View style={styles.kmTextContainer}>
              <Text style={[styles.kmLabel, { color: colors.textSecondary }]}>
                Kilometraje actual
              </Text>
              <Text style={[styles.kmValue, { color: colors.text }]}>
                {formatKm(vehicle.currentKm)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editKmButton}
            onPress={() => navigation.navigate("UpdateKm", { vehicle })}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Acciones rápidas de mantenimiento */}
        <View
          style={[
            styles.quickActionsSection,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones Rápidas
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {quickMaintenanceTypes.map((type) => (
              <QuickMaintenanceButton
                key={type.id}
                icon={type.icon}
                label={type.label}
                color={type.color}
                onPress={() => handleQuickMaintenance(type)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Estadísticas */}
        {stats && stats.totalServices > 0 && (
          <View
            style={[
              styles.statsSection,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Estadísticas
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalServices}</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(stats.totalCost)}
                </Text>
                <Text style={styles.statLabel}>Gasto total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Próximos mantenimientos */}
        {upcomingMaintenances.length > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Próximos Mantenimientos
            </Text>
            {upcomingMaintenances.slice(0, 3).map(renderMaintenanceItem)}
          </View>
        )}

        {/* Historial reciente */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Historial Reciente
            </Text>
          </View>

          {recentMaintenances.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="clipboard-outline"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay mantenimientos registrados
              </Text>
              <Button
                title="Agregar Primer Mantenimiento"
                onPress={() =>
                  navigation.navigate("AddMaintenance", { vehicleId })
                }
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            <View style={styles.historyButtonContainer}>
              <Text
                style={[styles.historyCount, { color: colors.textSecondary }]}
              >
                {recentMaintenances.length}{" "}
                {recentMaintenances.length === 1 ? "registro" : "registros"}
              </Text>
              <Button
                title="Ver Historial Completo"
                onPress={() => {
                  navigation.navigate("MaintenanceHistory", {
                    vehicleId,
                  });
                }}
                variant="outline"
              />
            </View>
          )}
        </View>

        {/* Botón de acción principal */}
        <View style={styles.actions}>
          <Button
            title="Agregar Mantenimiento"
            onPress={() => navigation.navigate("AddMaintenance", { vehicleId })}
            style={styles.actionButton}
          />
        </View>

        {/* Modal de completar mantenimiento */}
        <Modal
          visible={completeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCompleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Completar Mantenimiento
              </Text>

              {selectedMaintenance && (
                <View style={styles.modalBody}>
                  <Text
                    style={[styles.modalLabel, { color: colors.textSecondary }]}
                  >
                    Tipo:
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {selectedMaintenance.type}
                  </Text>

                  <Text
                    style={[styles.modalLabel, { color: colors.textSecondary }]}
                  >
                    Fecha actual:
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {formatDate(new Date())}
                  </Text>

                  <Text
                    style={[styles.modalLabel, { color: colors.textSecondary }]}
                  >
                    Kilometraje actual:
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {formatKm(vehicle?.currentKm)}
                  </Text>

                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: colors.border },
                    ]}
                  />

                  <Text style={styles.modalSectionTitle}>Próximo Servicio</Text>

                  <Text
                    style={[styles.modalLabel, { color: colors.textSecondary }]}
                  >
                    Kilometraje próximo (opcional):
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={nextServiceKm}
                    onChangeText={setNextServiceKm}
                    placeholder="Ej: 195000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />

                  <Text
                    style={[styles.modalLabel, { color: colors.textSecondary }]}
                  >
                    Costo (opcional):
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={cost}
                    onChangeText={setCost}
                    placeholder="Ej: 500"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => {
                        setCompleteModalVisible(false);
                        setSelectedMaintenance(null);
                        setNextServiceKm("");
                        setCost("");
                      }}
                    >
                      <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonConfirm]}
                      onPress={confirmCompleteMaintenance}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.modalButtonTextConfirm}>
                        Completar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 16,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  kmSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kmInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  kmTextContainer: {
    marginLeft: 12,
  },
  kmLabel: {
    fontSize: 14,
  },
  kmValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editKmButton: {
    padding: 8,
  },
  quickActionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsScroll: {
    paddingVertical: 8,
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  maintenanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  urgencyIndicator: {
    width: 4,
    height: "100%",
    marginRight: 12,
    borderRadius: 2,
  },
  maintenanceContent: {
    flex: 1,
    marginRight: 8,
  },
  maintenanceType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  maintenanceDate: {
    fontSize: 14,
  },
  maintenanceKm: {
    fontSize: 12,
  },
  nextServiceContainer: {
    marginTop: 6,
    gap: 4,
  },
  nextServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nextServiceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  overdueText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
  maintenanceCost: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  historyButtonContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  historyCount: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalBody: {
    gap: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  modalValue: {
    fontSize: 16,
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonConfirm: {
    backgroundColor: "#00C851",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default VehicleDetailScreen;
