import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useApp } from "../context/AppContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import {
  getMaintenanceDueDate,
  getMaintenanceTypes,
} from "../services/maintenanceService";
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
import { getMaintenanceIcon } from "../utils/maintenanceIcons";
import {
  iconSize,
  isTablet,
  ms,
} from "../utils/responsive";
import { styles } from "./VehicleDetailScreen.styles";

const QuickActionCard = ({ icon, label, color, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.quickActionCard,
      {
        backgroundColor: colors.inputBackground,
        borderColor: colors.border,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.quickActionTopRow}>
      <View
        style={[styles.quickActionIconWrap, { backgroundColor: `${color}20` }]}
      >
        <Ionicons name={icon} size={iconSize.sm} color={color} />
      </View>
      <Ionicons
        name="chevron-forward"
        size={iconSize.xs}
        color={colors.textSecondary}
      />
    </View>
    <Text
      style={[styles.quickActionLabel, { color: colors.text }]}
      numberOfLines={2}
    >
      {label}
    </Text>
    <Text
      style={[styles.quickActionCaption, { color: colors.textSecondary }]}
      numberOfLines={1}
    >
      Programar servicio
    </Text>
  </TouchableOpacity>
);

const QUICK_ACTION_COLORS = [
  "#FF9800",
  "#4CAF50",
  "#F44336",
  "#9C27B0",
  "#1976D2",
];

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

  const maintenanceTypeColorMap = useMemo(() => {
    const allTypes = getMaintenanceTypes();

    return allTypes.reduce((accumulator, type, index) => {
      accumulator[type.name] =
        QUICK_ACTION_COLORS[index % QUICK_ACTION_COLORS.length];
      return accumulator;
    }, {});
  }, []);

  const loadVehicleData = useCallback(() => {
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
  }, [
    vehicles,
    vehicleId,
    getRecentMaintenances,
    getUpcomingMaintenances,
    getMaintenanceStats,
  ]);

  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  // Recargar datos cuando la pantalla obtiene el foco (al volver de agregar mantenimiento)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadVehicles();
      loadVehicleData();
    });

    return unsubscribe;
  }, [navigation, loadVehicleData, loadVehicles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    loadVehicleData();
    setRefreshing(false);
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
    } catch (_error) {
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
      item.date,
    );
    const urgencyColor = getUrgencyColor(urgency);
    const maintenanceIcon = getMaintenanceIcon(item.type);
    const maintenanceColor =
      maintenanceTypeColorMap[item.type] || colors.primary;

    const dueDate = item.nextServiceDate ? getMaintenanceDueDate(item) : null;

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
      const dueDate = getMaintenanceDueDate(item);
      // Si tiene fecha, mostrar solo fecha
      const dateInfo = formatDaysRemaining(dueDate);
      if (dateInfo) {
        const daysRemaining = Math.floor(
          (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24),
        );
        nextServiceInfo.push({
          icon: "calendar-outline",
          text: dateInfo,
          isOverdue: daysRemaining < 0,
          color: getDateUrgencyColor(dueDate),
        });
      }
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.maintenanceItem,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
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
        <View
          style={[
            styles.maintenanceIconWrap,
            { backgroundColor: `${maintenanceColor}20` },
          ]}
        >
          <Ionicons
            name={maintenanceIcon}
            size={iconSize.sm}
            color={maintenanceColor}
          />
        </View>
        <View style={styles.maintenanceContent}>
          <View style={styles.maintenanceHeaderRow}>
            <Text style={[styles.maintenanceType, { color: colors.text }]}>
              {item.type}
            </Text>
            <View
              style={[
                styles.maintenanceStatusPill,
                { backgroundColor: `${urgencyColor}16` },
              ]}
            >
              <Text
                style={[styles.maintenanceStatusText, { color: urgencyColor }]}
              >
                {urgency === "overdue"
                  ? "Vencido"
                  : urgency === "urgent"
                    ? "Urgente"
                    : "Programado"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.maintenanceMetaRow, { alignItems: "flex-start" }]}
          >
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Fecha programada
              </Text>
              <Text style={[styles.maintenanceDate, { color: colors.text }]}>
                {formatDate(item.date)}
              </Text>
              {dueDate && (
                <View
                  style={[
                    styles.nextServiceItem,
                    {
                      marginTop: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      alignSelf: "flex-start",
                      backgroundColor: colors.cardBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={iconSize.xs}
                    color={getDateUrgencyColor(dueDate)}
                  />
                  <Text
                    style={[
                      styles.nextServiceText,
                      {
                        color: getDateUrgencyColor(dueDate),
                        fontWeight: "600",
                        marginLeft: 8,
                      },
                    ]}
                  >
                    {formatDaysRemaining(dueDate)}
                  </Text>
                </View>
              )}
            </View>

            {item.km && (
              <View style={styles.maintenanceMetaDot}>
                <Text
                  style={[
                    styles.maintenanceKm,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatKm(item.km)}
                </Text>
              </View>
            )}
          </View>
          {/* duplicate date block removed */}

          {/* Información de próximo servicio */}
          {nextServiceInfo.filter((i) => i.icon !== "calendar-outline").length >
            0 && (
            <View style={styles.nextServiceContainer}>
              {nextServiceInfo
                .filter((i) => i.icon !== "calendar-outline")
                .map((info, index) => (
                  <View
                    key={index}
                    style={[
                      styles.nextServiceItem,
                      { backgroundColor: colors.cardBackground },
                    ]}
                  >
                    <Ionicons
                      name={info.icon}
                      size={iconSize.xs}
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
          <View
            style={[
              styles.costPill,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={styles.maintenanceCost}>
              {formatCurrency(item.cost, currencySymbol)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Colores para los botones de acciones rápidas
  // Obtener los primeros 5 tipos de mantenimiento ordenados por el usuario
  const getQuickMaintenanceTypes = () => {
    const allTypes = getMaintenanceTypes();
    return allTypes.slice(0, 6).map((type, index) => ({
      id: type.id,
      icon: type.icon || "build-outline",
      label: type.name,
      color: QUICK_ACTION_COLORS[index % QUICK_ACTION_COLORS.length],
    }));
  };

  const handleQuickMaintenance = (maintenanceType) => {
    navigation.navigate("AddMaintenance", {
      vehicleId,
      quickType: maintenanceType.label,
    });
  };

  const renderRecentItem = (item) => {
    const maintenanceColor =
      maintenanceTypeColorMap[item.type] || colors.primary;
    const maintenanceIcon = getMaintenanceIcon(item.type);
    const completedDate = item.completedAt || item.date;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.recentItem,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => {
          navigation.navigate("MaintenanceHistory", {
            vehicleId,
            initialTab: "done",
          });
        }}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.recentItemIcon,
            { backgroundColor: `${maintenanceColor}20` },
          ]}
        >
          <Ionicons
            name={maintenanceIcon}
            size={iconSize.sm}
            color={maintenanceColor}
          />
        </View>
        <View style={styles.recentItemBody}>
          <View style={styles.recentItemHeader}>
            <Text style={[styles.recentItemTitle, { color: colors.text }]}>
              {item.type}
            </Text>
            <View
              style={[
                styles.recentStatusPill,
                { backgroundColor: `${COLORS.success}18` },
              ]}
            >
              <Text
                style={[styles.recentStatusText, { color: COLORS.success }]}
              >
                Completado
              </Text>
            </View>
          </View>
          <Text
            style={[styles.recentItemMeta, { color: colors.textSecondary }]}
          >
            {formatRelativeDate(completedDate)}
            {item.km ? ` • ${formatKm(item.km)}` : ""}
          </Text>
        </View>
        <View style={styles.recentItemAside}>
          <Text style={[styles.recentItemCost, { color: colors.text }]}>
            {item.cost
              ? formatCurrency(item.cost, currencySymbol)
              : "Sin costo"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={iconSize.sm}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
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

  const plateLabel = vehicle.plate || "Sin placa";
  const quickMaintenanceTypes = getQuickMaintenanceTypes();
  const vehicleMeta = [
    vehicle.brand,
    vehicle.model,
    vehicle.year && `${vehicle.year}`,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <DialogComponent>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroMediaRow}>
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
                    styles.heroImagePlaceholder,
                    { width: vehicleImageSize, height: vehicleImageSize },
                  ]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={vehiclePlaceholderIconSize}
                    color="#D6E7FF"
                  />
                </View>
              )}

              <View style={styles.headerInfo}>
                <Text style={styles.heroEyebrow}>Ficha técnica</Text>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                {!!vehicleMeta && (
                  <Text style={styles.vehicleDetails}>{vehicleMeta}</Text>
                )}

                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaPill}>
                    <Text style={styles.heroMetaText}>{plateLabel}</Text>
                  </View>
                  <View style={styles.heroMetaPill}>
                    <Ionicons
                      name="speedometer-outline"
                      size={iconSize.xs}
                      color="#D6E7FF"
                    />
                    <Text style={styles.heroMetaText}>
                      {formatKm(vehicle.currentKm)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
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
                size={iconSize.lg}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.kmSection,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.kmInfo}>
            <View
              style={[
                styles.kmIconWrap,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Ionicons
                name="speedometer-outline"
                size={iconSize.md}
                color={colors.primary}
              />
            </View>
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
            style={[
              styles.editKmButton,
              { backgroundColor: colors.inputBackground },
            ]}
            onPress={() => navigation.navigate("UpdateKm", { vehicle })}
          >
            <Ionicons
              name="create-outline"
              size={iconSize.sm}
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
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
                MRO
              </Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Acciones rápidas
              </Text>
            </View>
            <View
              style={[
                styles.panelMetaPill,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Text
                style={[styles.panelMetaText, { color: colors.textSecondary }]}
              >
                6 accesos
              </Text>
            </View>
          </View>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            Registra tareas frecuentes sin salir de la ficha técnica.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsTrack}
          >
            {quickMaintenanceTypes.map((type) => (
              <QuickActionCard
                key={type.id}
                icon={type.icon}
                label={type.label}
                color={type.color}
                colors={colors}
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
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.sectionHeaderCompact}>
              <View style={styles.sectionHeaderCompactBody}>
                <Text
                  style={[styles.sectionEyebrow, { color: colors.primary }]}
                >
                  Agenda
                </Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    styles.sectionTitleNoMargin,
                    { color: colors.text },
                  ]}
                >
                  Próximos mantenimientos programados
                </Text>
                <Text
                  style={[
                    styles.sectionDescriptionCompact,
                    { color: colors.textSecondary },
                  ]}
                >
                  Prioriza los próximos servicios y entra a la bitácora para
                  completar o revisar cada uno.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.inlineChevronAction}
                onPress={() => {
                  navigation.navigate("MaintenanceHistory", {
                    vehicleId,
                    initialTab: "inProgress",
                    sortByUrgency: true,
                  });
                }}
              >
                <Text
                  style={[styles.inlineChevronText, { color: colors.primary }]}
                >
                  Ver todo
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={iconSize.xs}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            {upcomingMaintenances.slice(0, 3).map(renderMaintenanceItem)}
          </View>
        )}

        {/* Historial realizados */}
        {true && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[styles.sectionEyebrow, { color: colors.primary }]}
                >
                  Bitácora
                </Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    styles.sectionTitleNoMargin,
                    { color: colors.text },
                  ]}
                >
                  Historial Realizados
                </Text>
              </View>
              <TouchableOpacity
                style={styles.inlineChevronAction}
                onPress={() => {
                  navigation.navigate("MaintenanceHistory", {
                    vehicleId,
                    initialTab: "done",
                  });
                }}
              >
                <Text
                  style={[styles.inlineChevronText, { color: colors.primary }]}
                >
                  Ver todo
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={iconSize.xs}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {recentMaintenances.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyStateBadge,
                    { backgroundColor: `${colors.primary}14` },
                  ]}
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={iconSize.lg}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Sin registros todavía
                </Text>
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  Cuando cargues tu primer servicio, aquí verás la bitácora
                  reciente de esta unidad.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyStateButton,
                    { backgroundColor: colors.primaryDark },
                  ]}
                  onPress={() =>
                    navigation.navigate("AddMaintenance", { vehicleId })
                  }
                >
                  <Text style={styles.emptyStateButtonText}>
                    Programar mantenimiento
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text
                  style={[styles.historyCount, { color: colors.textSecondary }]}
                >
                  {recentMaintenances.length}{" "}
                  {recentMaintenances.length === 1
                    ? "movimiento reciente"
                    : "movimientos recientes"}
                </Text>
                <View style={styles.recentList}>
                  {recentMaintenances.slice(0, 3).map(renderRecentItem)}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Botón de acción principal */}
        <View
          style={[
            styles.actionDock,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.actionDockContent}>
            <Text style={[styles.actionDockTitle, { color: colors.text }]}>
              Programar mantenimiento
            </Text>
            <Text
              style={[styles.actionDockText, { color: colors.textSecondary }]}
            >
              Carga un nuevo servicio, costo o ajuste y mantén la bitácora al
              día.
            </Text>
          </View>
          <Button
            title="Programar"
            onPress={() => navigation.navigate("AddMaintenance", { vehicleId })}
            style={styles.actionDockButton}
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

export default VehicleDetailScreen;
