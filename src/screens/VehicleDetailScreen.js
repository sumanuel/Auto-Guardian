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
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { getMaintenanceTypes } from "../services/maintenanceService";
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
import {
  borderRadius,
  hs,
  iconSize,
  isTablet,
  ms,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

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
  const { currencySymbol } = useAppSettings();
  const tablet = isTablet();

  const vehicleImageSize = tablet ? ms(100, 1) : ms(100);
  const vehiclePlaceholderIconSize = tablet ? ms(60, 1) : ms(60);

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
        foundVehicle.currentKm,
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
      item.nextServiceDate,
    );
    const urgencyColor = getUrgencyColor(urgency);

    // Calcular información de próximo servicio
    const nextServiceInfo = [];

    // Mostrar solo el campo que tenga valor (km o fecha, no ambos)
    if (item.nextServiceKm) {
      // Si tiene kilometraje, mostrar solo kilometraje
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
    } else if (item.nextServiceDate) {
      // Si tiene fecha, mostrar solo fecha
      const dateInfo = formatDaysRemaining(item.nextServiceDate);
      if (dateInfo) {
        const daysRemaining = Math.floor(
          (new Date(item.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24),
        );
        nextServiceInfo.push({
          icon: "calendar-outline",
          text: dateInfo,
          isOverdue: daysRemaining < 0,
          color: getDateUrgencyColor(item.nextServiceDate),
        });
      }
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
                  <Ionicons
                    name={info.icon}
                    size={iconSize.sm}
                    color={info.color}
                  />
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
            {formatCurrency(item.cost, currencySymbol)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Colores para los botones de acciones rápidas
  const quickActionColors = [
    "#FF9800", // Naranja
    "#4CAF50", // Verde
    "#F44336", // Rojo
    "#9C27B0", // Morado
    "#2196F3", // Azul
  ];

  // Obtener los primeros 5 tipos de mantenimiento ordenados por el usuario
  const getQuickMaintenanceTypes = () => {
    const allTypes = getMaintenanceTypes();
    return allTypes.slice(0, 6).map((type, index) => ({
      id: type.id,
      icon: type.icon || "build-outline",
      label: type.name,
      color: quickActionColors[index % quickActionColors.length],
    }));
  };

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
              style={[
                styles.vehicleImage,
                { width: vehicleImageSize, height: vehicleImageSize },
              ]}
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.inputBackground },
                { width: vehicleImageSize, height: vehicleImageSize },
              ]}
            >
              <Ionicons
                name="car"
                size={vehiclePlaceholderIconSize}
                color={colors.textSecondary}
              />
            </View>
          )}
          <View style={styles.headerInfo}>
            <View style={styles.titleContainer}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {vehicle.name}
              </Text>
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() =>
                  showDialog({
                    title: "Detalle del Vehículo",
                    message:
                      "Aquí puedes ver toda la información de tu vehículo, próximos mantenimientos más urgentes, opciones para registrar nuevos mantenimientos o ver el historial. Mantén actualizado el kilometraje para alertas precisas.",
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
            <Ionicons
              name="speedometer"
              size={iconSize.lg}
              color={colors.primary}
            />
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
            <Ionicons
              name="create-outline"
              size={iconSize.md}
              color={colors.primary}
            />
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
            {getQuickMaintenanceTypes().map((type) => (
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
        {false && stats && stats.totalServices > 0 && (
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
                  {formatCurrency(stats.totalCost, currencySymbol)}
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
        {true && (
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
                  size={iconSize.lg}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No hay mantenimientos registrados
                </Text>
                <Button
                  title="Agregar Primer Mantenimiento"
                  onPress={() =>
                    navigation.navigate("AddMaintenance", { vehicleId })
                  }
                  style={{ marginTop: spacing.md }}
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
        )}

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
                        size={iconSize.md}
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
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  vehicleImage: {
    width: s(100),
    height: s(100),
    borderRadius: borderRadius.md,
    marginRight: hs(16),
  },
  imagePlaceholder: {
    width: s(100),
    height: s(100),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(16),
  },
  headerInfo: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(4),
  },
  vehicleName: {
    fontSize: rf(22),
    fontWeight: "bold",
  },
  vehicleDetails: {
    fontSize: rf(16),
    marginBottom: vs(4),
  },
  vehiclePlate: {
    fontSize: rf(14),
  },
  helpButton: {
    padding: spacing.sm,
  },
  kmSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: s(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
  },
  kmInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  kmTextContainer: {
    marginLeft: hs(12),
  },
  kmLabel: {
    fontSize: rf(14),
  },
  kmValue: {
    fontSize: rf(24),
    fontWeight: "bold",
  },
  editKmButton: {
    padding: spacing.sm,
  },
  quickActionsSection: {
    marginHorizontal: hs(16),
    marginBottom: vs(16),
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    elevation: s(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
  },
  quickActionsScroll: {
    paddingVertical: vs(8),
  },
  statsSection: {
    marginHorizontal: hs(16),
    marginBottom: vs(16),
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    elevation: s(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: vs(12),
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: rf(20),
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: vs(4),
  },
  statLabel: {
    fontSize: rf(12),
    color: COLORS.gray,
  },
  section: {
    marginHorizontal: hs(16),
    marginBottom: vs(16),
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    elevation: s(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(12),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: vs(12),
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: rf(14),
    fontWeight: "600",
  },
  maintenanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(12),
    borderBottomWidth: 1,
  },
  urgencyIndicator: {
    width: s(4),
    height: "100%",
    marginRight: hs(12),
    borderRadius: s(2),
  },
  maintenanceContent: {
    flex: 1,
    marginRight: hs(8),
  },
  maintenanceType: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: vs(4),
  },
  maintenanceDate: {
    fontSize: rf(14),
  },
  maintenanceKm: {
    fontSize: rf(12),
  },
  nextServiceContainer: {
    marginTop: ms(6),
    gap: ms(4),
  },
  nextServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
  },
  nextServiceText: {
    fontSize: rf(12),
    color: COLORS.primary,
    fontWeight: "500",
  },
  overdueText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
  maintenanceCost: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: ms(32),
  },
  emptyText: {
    fontSize: rf(14),
    marginTop: ms(8),
  },
  historyButtonContainer: {
    alignItems: "center",
    paddingVertical: ms(16),
  },
  historyCount: {
    fontSize: rf(14),
    marginBottom: ms(12),
    fontWeight: "500",
  },
  actions: {
    padding: ms(16),
    paddingBottom: ms(32),
  },
  actionButton: {
    marginBottom: ms(12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: "90%",
    maxWidth: s(420),
  },
  modalTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginBottom: vs(16),
    textAlign: "center",
  },
  modalBody: {
    gap: vs(12),
  },
  modalLabel: {
    fontSize: rf(14),
    fontWeight: "600",
    marginTop: vs(8),
  },
  modalValue: {
    fontSize: rf(16),
    paddingVertical: vs(4),
  },
  separator: {
    height: 1,
    marginVertical: vs(12),
  },
  modalSectionTitle: {
    fontSize: rf(16),
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: vs(8),
  },
  modalInput: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: rf(16),
  },
  modalButtons: {
    flexDirection: "row",
    gap: hs(12),
    marginTop: vs(16),
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: hs(8),
  },
  modalButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonConfirm: {
    backgroundColor: "#00C851",
  },
  modalButtonTextCancel: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#666",
  },
  modalButtonTextConfirm: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#fff",
  },
});

export default VehicleDetailScreen;
