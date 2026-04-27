import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
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

const DetailMetricCard = ({ icon, label, value, accent, inverse = false }) => (
  <View
    style={[
      styles.detailMetricCard,
      inverse && styles.detailMetricCardInverse,
      accent ? { borderColor: accent } : null,
    ]}
  >
    <View
      style={[
        styles.detailMetricIconWrap,
        { backgroundColor: inverse ? "rgba(255,255,255,0.12)" : `${accent}18` },
      ]}
    >
      <Ionicons
        name={icon}
        size={iconSize.sm}
        color={inverse ? "#fff" : accent}
      />
    </View>
    <Text
      style={[
        styles.detailMetricValue,
        inverse && styles.detailMetricValueInverse,
      ]}
    >
      {value}
    </Text>
    <Text
      style={[
        styles.detailMetricLabel,
        inverse && styles.detailMetricLabelInverse,
      ]}
    >
      {label}
    </Text>
  </View>
);

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

  const totalServices = stats?.totalServices || 0;
  const totalInvestment = stats?.totalCost || 0;
  const plateLabel = vehicle.plate || "Sin placa";
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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

          <View style={styles.heroStatsGrid}>
            <DetailMetricCard
              icon="time-outline"
              label="Pendientes"
              value={upcomingMaintenances.length}
              accent={COLORS.warning}
              inverse
            />
            <DetailMetricCard
              icon="build-outline"
              label="Servicios"
              value={totalServices}
              accent="#8ED1FF"
              inverse
            />
            <DetailMetricCard
              icon="wallet-outline"
              label="Inversión"
              value={formatCurrency(totalInvestment, currencySymbol)}
              accent="#B8F1C6"
              inverse
            />
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
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
            MRO
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones rápidas
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
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
              Agenda
            </Text>
            <View style={styles.sectionHeaderCompact}>
              <Text
                style={[
                  styles.sectionTitle,
                  styles.sectionTitleNoMargin,
                  { color: colors.text },
                ]}
              >
                Próximos mantenimientos
              </Text>
              <Text
                style={[styles.sectionMeta, { color: colors.textSecondary }]}
              >
                {upcomingMaintenances.length} activos
              </Text>
            </View>
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
                  Historial reciente
                </Text>
              </View>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(26),
    paddingBottom: vs(28),
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
  vehicleImage: {
    width: s(100),
    height: s(100),
    borderRadius: borderRadius.md,
    marginRight: hs(14),
  },
  imagePlaceholder: {
    width: s(100),
    height: s(100),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(14),
  },
  heroImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerInfo: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.72)",
    marginBottom: vs(4),
  },
  vehicleName: {
    fontSize: rf(24),
    fontWeight: "800",
    color: "#fff",
  },
  vehicleDetails: {
    fontSize: rf(14),
    color: "rgba(255,255,255,0.84)",
    marginTop: vs(4),
    marginBottom: vs(10),
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(8),
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroMetaText: {
    fontSize: rf(12),
    fontWeight: "700",
    color: "#fff",
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
  heroStatsGrid: {
    flexDirection: "row",
    gap: hs(8),
    marginTop: vs(18),
  },
  detailMetricCard: {
    flex: 1,
    minHeight: vs(92),
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  detailMetricCardInverse: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  detailMetricIconWrap: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: vs(10),
  },
  detailMetricValue: {
    fontSize: rf(15),
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: vs(3),
  },
  detailMetricValueInverse: {
    color: "#fff",
  },
  detailMetricLabel: {
    fontSize: rf(11),
    fontWeight: "600",
    color: COLORS.gray,
  },
  detailMetricLabelInverse: {
    color: "rgba(255,255,255,0.74)",
  },
  kmSection: {
    marginHorizontal: hs(16),
    marginTop: vs(-12),
    marginBottom: vs(16),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: s(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
  },
  kmInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  kmIconWrap: {
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    alignItems: "center",
    justifyContent: "center",
  },
  kmTextContainer: {
    marginLeft: hs(12),
  },
  kmLabel: {
    fontSize: rf(14),
  },
  kmValue: {
    fontSize: rf(22),
    fontWeight: "800",
  },
  editKmButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionsSection: {
    marginHorizontal: hs(16),
    marginBottom: vs(16),
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    elevation: s(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
  },
  quickActionsScroll: {
    paddingTop: vs(6),
    paddingBottom: vs(2),
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
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    elevation: s(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: vs(10),
  },
  sectionHeaderCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(10),
  },
  sectionEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "800",
    marginBottom: vs(12),
  },
  sectionTitleNoMargin: {
    marginBottom: 0,
  },
  sectionMeta: {
    fontSize: rf(12),
    fontWeight: "700",
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
    paddingHorizontal: hs(16),
    paddingTop: ms(4),
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
