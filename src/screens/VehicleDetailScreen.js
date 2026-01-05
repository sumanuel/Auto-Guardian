import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
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
import { useResponsive } from "../hooks/useResponsive";
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
  const { scale, verticalScale, moderateScale } = useResponsive();

  const responsiveStyles = {
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      padding: scale(20),
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
    },
    vehicleImage: {
      width: scale(100),
      height: verticalScale(100),
      borderRadius: scale(12),
      marginRight: scale(16),
    },
    imagePlaceholder: {
      width: scale(100),
      height: verticalScale(100),
      borderRadius: scale(12),
      justifyContent: "center",
      alignItems: "center",
      marginRight: scale(16),
    },
    headerInfo: {
      flex: 1,
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(4),
    },
    vehicleName: {
      fontSize: moderateScale(22),
      fontWeight: "bold",
    },
    vehicleDetails: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(4),
    },
    vehiclePlate: {
      fontSize: moderateScale(14),
    },
    helpButton: {
      padding: scale(8),
    },
    kmSection: {
      margin: scale(16),
      padding: scale(16),
      borderRadius: scale(12),
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
      marginLeft: scale(12),
    },
    kmLabel: {
      fontSize: moderateScale(14),
    },
    kmValue: {
      fontSize: moderateScale(24),
      fontWeight: "bold",
    },
    editKmButton: {
      padding: scale(8),
    },
    quickActionsSection: {
      marginHorizontal: scale(16),
      marginBottom: verticalScale(16),
      padding: scale(16),
      borderRadius: scale(12),
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
      marginBottom: verticalScale(16),
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
    },
    quickActionButton: {
      flex: 1,
      minWidth: scale(140),
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(16),
      borderRadius: scale(12),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      elevation: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    quickActionText: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      flex: 1,
    },
    maintenanceSection: {
      marginHorizontal: scale(16),
      marginBottom: verticalScale(20),
    },
    maintenanceItem: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    urgencyIndicator: {
      width: scale(4),
      height: "100%",
      borderRadius: scale(2),
    },
    maintenanceContent: {
      flex: 1,
      marginLeft: scale(12),
    },
    maintenanceType: {
      fontSize: moderateScale(16),
      fontWeight: "600",
    },
    maintenanceDate: {
      fontSize: moderateScale(14),
      marginTop: verticalScale(2),
    },
    maintenanceKm: {
      fontSize: moderateScale(14),
      marginTop: verticalScale(2),
    },
    nextServiceContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
      marginTop: verticalScale(8),
    },
    nextServiceItem: {
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
    },
    nextServiceText: {
      fontSize: moderateScale(12),
      fontWeight: "500",
    },
    maintenanceCost: {
      fontSize: moderateScale(16),
      fontWeight: "bold",
      marginTop: verticalScale(8),
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: verticalScale(40),
    },
    emptyStateText: {
      fontSize: moderateScale(16),
      textAlign: "center",
      marginTop: verticalScale(16),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxWidth: scale(400),
      borderRadius: scale(16),
      padding: scale(24),
      elevation: 5,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalTitle: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
      marginBottom: verticalScale(16),
      textAlign: "center",
    },
    modalBody: {
      gap: verticalScale(12),
    },
    modalLabel: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      marginTop: verticalScale(8),
    },
    modalValue: {
      fontSize: moderateScale(16),
      paddingVertical: verticalScale(4),
    },
    separator: {
      height: 1,
      marginVertical: verticalScale(12),
    },
    modalSectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: "bold",
      color: COLORS.primary,
      marginBottom: verticalScale(8),
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: scale(8),
      padding: scale(12),
      fontSize: moderateScale(16),
    },
    modalButtons: {
      flexDirection: "row",
      gap: scale(12),
      marginTop: verticalScale(16),
    },
    modalButton: {
      flex: 1,
      padding: scale(14),
      borderRadius: scale(8),
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: scale(8),
    },
    modalButtonCancel: {
      backgroundColor: "#f0f0f0",
    },
    modalButtonConfirm: {
      backgroundColor: "#00C851",
    },
    modalButtonTextCancel: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: "#666",
    },
    modalButtonTextConfirm: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: "#fff",
    },
  };

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
          (new Date(item.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24)
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
        style={[
          responsiveStyles.maintenanceItem,
          { borderBottomColor: colors.border },
        ]}
        onPress={() => {
          navigation.navigate("MaintenanceHistory", {
            vehicleId,
            sortByUrgency: true,
          });
        }}
      >
        <View
          style={[
            responsiveStyles.urgencyIndicator,
            { backgroundColor: urgencyColor },
          ]}
        />
        <View style={responsiveStyles.maintenanceContent}>
          <Text
            style={[responsiveStyles.maintenanceType, { color: colors.text }]}
          >
            {item.type}
          </Text>
          <Text
            style={[
              responsiveStyles.maintenanceDate,
              { color: colors.textSecondary },
            ]}
          >
            {formatRelativeDate(item.date)}
          </Text>
          {item.km && (
            <Text
              style={[
                responsiveStyles.maintenanceKm,
                { color: colors.textSecondary },
              ]}
            >
              a los {formatKm(item.km)}
            </Text>
          )}

          {/* Información de próximo servicio */}
          {nextServiceInfo.length > 0 && (
            <View style={responsiveStyles.nextServiceContainer}>
              {nextServiceInfo.map((info, index) => (
                <View key={index} style={responsiveStyles.nextServiceItem}>
                  <Ionicons name={info.icon} size={14} color={info.color} />
                  <Text
                    style={[
                      responsiveStyles.nextServiceText,
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
          <Text style={responsiveStyles.maintenanceCost}>
            {formatCurrency(item.cost)}
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
    return allTypes.slice(0, 5).map((type, index) => ({
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
        <View style={responsiveStyles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      </DialogComponent>
    );
  }

  return (
    <DialogComponent>
      <ScrollView
        style={[
          responsiveStyles.container,
          { backgroundColor: colors.background },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con imagen del vehículo */}
        <View
          style={[
            responsiveStyles.header,
            {
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {vehicle.photo ? (
            <Image
              source={{ uri: vehicle.photo }}
              style={responsiveStyles.vehicleImage}
            />
          ) : (
            <View
              style={[
                responsiveStyles.imagePlaceholder,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Ionicons name="car" size={60} color={colors.textSecondary} />
            </View>
          )}
          <View style={responsiveStyles.headerInfo}>
            <View style={responsiveStyles.titleContainer}>
              <Text
                style={[responsiveStyles.vehicleName, { color: colors.text }]}
              >
                {vehicle.name}
              </Text>
              <TouchableOpacity
                style={responsiveStyles.helpButton}
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
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                responsiveStyles.vehicleDetails,
                { color: colors.textSecondary },
              ]}
            >
              {vehicle.brand} {vehicle.model}{" "}
              {vehicle.year ? `(${vehicle.year})` : ""}
            </Text>
            {vehicle.plate && (
              <Text
                style={[
                  responsiveStyles.vehiclePlate,
                  { color: colors.textSecondary },
                ]}
              >
                Placa: {vehicle.plate}
              </Text>
            )}
          </View>
        </View>

        {/* Kilometraje actual */}
        <View
          style={[
            responsiveStyles.kmSection,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={responsiveStyles.kmInfo}>
            <Ionicons name="speedometer" size={32} color={colors.primary} />
            <View style={responsiveStyles.kmTextContainer}>
              <Text
                style={[
                  responsiveStyles.kmLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Kilometraje actual
              </Text>
              <Text style={[responsiveStyles.kmValue, { color: colors.text }]}>
                {formatKm(vehicle.currentKm)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={responsiveStyles.editKmButton}
            onPress={() => navigation.navigate("UpdateKm", { vehicle })}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Acciones rápidas de mantenimiento */}
        <View
          style={[
            responsiveStyles.quickActionsSection,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[responsiveStyles.sectionTitle, { color: colors.text }]}>
            Acciones Rápidas
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={responsiveStyles.quickActionsScroll}
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
              responsiveStyles.statsSection,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text
              style={[responsiveStyles.sectionTitle, { color: colors.text }]}
            >
              Estadísticas
            </Text>
            <View style={responsiveStyles.statsGrid}>
              <View style={responsiveStyles.statItem}>
                <Text style={responsiveStyles.statValue}>
                  {stats.totalServices}
                </Text>
                <Text style={responsiveStyles.statLabel}>Servicios</Text>
              </View>
              <View style={responsiveStyles.statItem}>
                <Text style={responsiveStyles.statValue}>
                  {formatCurrency(stats.totalCost)}
                </Text>
                <Text style={responsiveStyles.statLabel}>Gasto total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Próximos mantenimientos */}
        {upcomingMaintenances.length > 0 && (
          <View
            style={[
              responsiveStyles.section,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text
              style={[responsiveStyles.sectionTitle, { color: colors.text }]}
            >
              Próximos Mantenimientos
            </Text>
            {upcomingMaintenances.slice(0, 3).map(renderMaintenanceItem)}
          </View>
        )}

        {/* Historial reciente */}
        {true && (
          <View
            style={[
              responsiveStyles.section,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={responsiveStyles.sectionHeader}>
              <Text
                style={[responsiveStyles.sectionTitle, { color: colors.text }]}
              >
                Historial Reciente
              </Text>
            </View>

            {recentMaintenances.length === 0 ? (
              <View style={responsiveStyles.emptyState}>
                <Ionicons
                  name="clipboard-outline"
                  size={40}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    responsiveStyles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
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
              <View style={responsiveStyles.historyButtonContainer}>
                <Text
                  style={[
                    responsiveStyles.historyCount,
                    { color: colors.textSecondary },
                  ]}
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
        <View style={responsiveStyles.actions}>
          <Button
            title="Agregar Mantenimiento"
            onPress={() => navigation.navigate("AddMaintenance", { vehicleId })}
            style={responsiveStyles.actionButton}
          />
        </View>

        {/* Modal de completar mantenimiento */}
        <Modal
          visible={completeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCompleteModalVisible(false)}
        >
          <View style={responsiveStyles.modalOverlay}>
            <View
              style={[
                responsiveStyles.modalContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text
                style={[responsiveStyles.modalTitle, { color: colors.text }]}
              >
                Completar Mantenimiento
              </Text>

              {selectedMaintenance && (
                <View style={responsiveStyles.modalBody}>
                  <Text
                    style={[
                      responsiveStyles.modalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tipo:
                  </Text>
                  <Text
                    style={[
                      responsiveStyles.modalValue,
                      { color: colors.text },
                    ]}
                  >
                    {selectedMaintenance.type}
                  </Text>

                  <Text
                    style={[
                      responsiveStyles.modalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Fecha actual:
                  </Text>
                  <Text
                    style={[
                      responsiveStyles.modalValue,
                      { color: colors.text },
                    ]}
                  >
                    {formatDate(new Date())}
                  </Text>

                  <Text
                    style={[
                      responsiveStyles.modalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Kilometraje actual:
                  </Text>
                  <Text
                    style={[
                      responsiveStyles.modalValue,
                      { color: colors.text },
                    ]}
                  >
                    {formatKm(vehicle?.currentKm)}
                  </Text>

                  <View
                    style={[
                      responsiveStyles.separator,
                      { backgroundColor: colors.border },
                    ]}
                  />

                  <Text style={responsiveStyles.modalSectionTitle}>
                    Próximo Servicio
                  </Text>

                  <Text
                    style={[
                      responsiveStyles.modalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Kilometraje próximo (opcional):
                  </Text>
                  <TextInput
                    style={[
                      responsiveStyles.modalInput,
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
                    style={[
                      responsiveStyles.modalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Costo (opcional):
                  </Text>
                  <TextInput
                    style={[
                      responsiveStyles.modalInput,
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

                  <View style={responsiveStyles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        responsiveStyles.modalButton,
                        responsiveStyles.modalButtonCancel,
                      ]}
                      onPress={() => {
                        setCompleteModalVisible(false);
                        setSelectedMaintenance(null);
                        setNextServiceKm("");
                        setCost("");
                      }}
                    >
                      <Text style={responsiveStyles.modalButtonTextCancel}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        responsiveStyles.modalButton,
                        responsiveStyles.modalButtonConfirm,
                      ]}
                      onPress={confirmCompleteMaintenance}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#fff"
                      />
                      <Text style={responsiveStyles.modalButtonTextConfirm}>
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

export default VehicleDetailScreen;
