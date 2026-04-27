import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { getMaintenanceTypes } from "../services/maintenanceService";
import { formatDate } from "../utils/dateUtils";
import {
  formatCurrency,
  formatDaysRemaining,
  formatKm,
  formatKmRemaining,
  getDateUrgencyColor,
  getKmUrgencyColor,
} from "../utils/formatUtils";
import { getMaintenanceIcon } from "../utils/maintenanceIcons";
import {
  borderRadius,
  hs,
  iconSize,
  ms,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const QUICK_ACTION_COLORS = [
  "#FF9800",
  "#4CAF50",
  "#F44336",
  "#9C27B0",
  "#2196F3",
];

const MaintenanceHistoryScreen = ({ route, navigation }) => {
  const { vehicleId = null, sortByUrgency = false } = route.params || {};
  const {
    getVehicleMaintenances,
    removeMaintenance,
    vehicles,
    getAllMaintenances,
    updateMaintenance,
    addMaintenance,
  } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const { currencySymbol } = useAppSettings();
  const maintenanceTypeColorMap = useMemo(() => {
    const allTypes = getMaintenanceTypes();

    return allTypes.reduce((accumulator, type, index) => {
      accumulator[type.name] =
        QUICK_ACTION_COLORS[index % QUICK_ACTION_COLORS.length];
      return accumulator;
    }, {});
  }, []);

  const vehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : null;
  const [maintenances, setMaintenances] = useState([]);
  const [activeTab, setActiveTab] = useState("inProgress");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [scheduleNext, setScheduleNext] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: new Date(),
    cost: "",
    provider: "",
    notes: "",
    photo: null,
  });

  // Referencias para navegación en modal de edición
  const costRef = useRef(null);
  const providerRef = useRef(null);
  const notesRef = useRef(null);

  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    loadMaintenances();
  }, [loadMaintenances]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadMaintenances();
    });
    return unsubscribe;
  }, [loadMaintenances, navigation]);

  const loadMaintenances = useCallback(() => {
    let data;
    if (vehicleId) {
      data = getVehicleMaintenances(vehicleId);
    } else {
      data = getAllMaintenances ? getAllMaintenances() : [];
    }

    // Ordenar mantenimientos por defecto
    data = data.sort((a, b) => {
      // Primero los mantenimientos en curso (con nextServiceKm o nextServiceDate)
      const aIsCompleted = !a.nextServiceKm && !a.nextServiceDate;
      const bIsCompleted = !b.nextServiceKm && !b.nextServiceDate;

      if (aIsCompleted && !bIsCompleted) return 1; // Completados van después
      if (!aIsCompleted && bIsCompleted) return -1; // En curso van primero

      // Dentro de cada grupo, ordenar por fecha descendente
      if (aIsCompleted && bIsCompleted) {
        // Ambos completados: ordenar por completedAt descendente
        const aDate = new Date(a.completedAt || a.date);
        const bDate = new Date(b.completedAt || b.date);
        return bDate - aDate;
      } else {
        // Ambos en curso: ordenar por fecha de creación descendente
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return bDate - aDate;
      }
    });

    // Si viene desde próximos mantenimientos, ordenar por urgencia
    if (sortByUrgency) {
      const now = new Date();
      const sorted = data.sort((a, b) => {
        const hasNextA = a.nextServiceKm || a.nextServiceDate;
        const hasNextB = b.nextServiceKm || b.nextServiceDate;
        if (!hasNextA && !hasNextB) return 0;
        if (!hasNextA) return 1;
        if (!hasNextB) return -1;
        const aKmDiff = a.nextServiceKm
          ? a.nextServiceKm - (vehicle?.currentKm || 0)
          : Infinity;
        const bKmDiff = b.nextServiceKm
          ? b.nextServiceKm - (vehicle?.currentKm || 0)
          : Infinity;
        const aDaysDiff = a.nextServiceDate
          ? Math.floor(
              (new Date(a.nextServiceDate) - now) / (1000 * 60 * 60 * 24),
            )
          : Infinity;
        const bDaysDiff = b.nextServiceDate
          ? Math.floor(
              (new Date(b.nextServiceDate) - now) / (1000 * 60 * 60 * 24),
            )
          : Infinity;
        const aUrgency = Math.min(
          aKmDiff >= 0 ? aKmDiff / 100 : -1000,
          aDaysDiff >= 0 ? aDaysDiff : -1000,
        );
        const bUrgency = Math.min(
          bKmDiff >= 0 ? bKmDiff / 100 : -1000,
          bDaysDiff >= 0 ? bDaysDiff : -1000,
        );
        return aUrgency - bUrgency;
      });
      data = sorted;
    }
    setMaintenances(data);
  }, [
    vehicle?.currentKm,
    vehicleId,
    getAllMaintenances,
    getVehicleMaintenances,
    sortByUrgency,
  ]);

  // Filtrar mantenimientos según tab activa
  const filteredMaintenances = maintenances.filter((item) => {
    if (activeTab === "inProgress") {
      return item.nextServiceKm || item.nextServiceDate;
    } else {
      return !item.nextServiceKm && !item.nextServiceDate;
    }
  });

  // Saber si el item está realizado
  const isCompleted = (item) => !item.nextServiceKm && !item.nextServiceDate;

  const inProgressCount = maintenances.filter(
    (item) => item.nextServiceKm || item.nextServiceDate,
  ).length;
  const completedCount = maintenances.length - inProgressCount;

  const handleDelete = (id, type) => {
    showDialog({
      title: "Eliminar mantenimiento",
      message: `¿Deseas eliminar el registro de "${type}"?`,
      type: "confirm",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMaintenance(id);
              loadMaintenances();
            } catch (_error) {
              showDialog({
                title: "Error",
                message: "No se pudo eliminar el registro",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

  const handleEdit = (id) => {
    const maintenanceToEdit = maintenances.find((item) => item.id === id);
    if (maintenanceToEdit) {
      if (isCompleted(maintenanceToEdit)) {
        // For completed maintenances, open edit modal
        setSelectedMaintenance(maintenanceToEdit);

        // Parse completedAt date correctly (this is the date shown in the list)
        let dateValue = new Date();
        if (maintenanceToEdit.completedAt) {
          const parsedDate = new Date(maintenanceToEdit.completedAt);
          if (!isNaN(parsedDate.getTime())) {
            dateValue = parsedDate;
          }
        }

        setEditFormData({
          date: dateValue,
          cost: maintenanceToEdit.cost ? maintenanceToEdit.cost.toString() : "",
          provider: maintenanceToEdit.provider || "",
          notes: maintenanceToEdit.notes || "",
          photo: maintenanceToEdit.photo || null,
        });
        setEditModalVisible(true);
      } else {
        // For in-progress maintenances, navigate to AddMaintenance screen
        navigation.navigate("AddMaintenance", {
          vehicleId: maintenanceToEdit.vehicleId,
          quickType: maintenanceToEdit.type,
          maintenanceData: maintenanceToEdit, // Pass the full maintenance data for editing
        });
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMaintenance) return;

    try {
      const updatedData = {
        ...selectedMaintenance,
        completedAt: editFormData.date.toISOString(), // Update completedAt with the edited date
        cost: editFormData.cost ? parseFloat(editFormData.cost) : null,
        provider: editFormData.provider || null,
        notes: editFormData.notes || null,
        photo: editFormData.photo || null,
      };

      await updateMaintenance(selectedMaintenance.id, updatedData);
      setEditModalVisible(false);
      setSelectedMaintenance(null);
      loadMaintenances();
      showDialog({
        title: "Actualizado",
        message: "Los datos del mantenimiento han sido actualizados.",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating maintenance:", error);
      showDialog({
        title: "Error",
        message: "No se pudieron actualizar los datos.",
        type: "error",
      });
    }
  };

  const handleApprove = (id) => {
    const maintenanceToApprove = maintenances.find((item) => item.id === id);
    if (!maintenanceToApprove) return;

    setSelectedMaintenance(maintenanceToApprove);
    setScheduleNext(false); // Reset checkbox
    setApproveModalVisible(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedMaintenance) return;

    const { id } = selectedMaintenance;

    try {
      // Primero marcar el mantenimiento actual como completado
      const completedMaintenance = {
        ...selectedMaintenance,
        nextServiceKm: null,
        nextServiceDate: null,
        completedAt: new Date().toISOString(),
      };

      await updateMaintenance(id, completedMaintenance);

      // Si se debe programar el próximo mantenimiento, crear uno nuevo
      if (scheduleNext) {
        const vehicle = vehicles.find(
          (v) => v.id === selectedMaintenance.vehicleId,
        );

        let nextServiceKm = null;
        let nextServiceDate = null;

        // Calcular próximo servicio basado en los valores originales
        if (selectedMaintenance.nextServiceKm && vehicle?.currentKm) {
          // Si tenía kilometraje programado, sumar al kilometraje actual
          nextServiceKm =
            vehicle.currentKm +
            (selectedMaintenance.nextServiceKm - (selectedMaintenance.km || 0));
        }

        if (selectedMaintenance.nextServiceDate) {
          // Si tenía fecha programada, sumar los días desde la fecha original
          const originalDate = new Date(selectedMaintenance.date);
          const nextDate = new Date(selectedMaintenance.nextServiceDate);
          const daysDiff = Math.floor(
            (nextDate - originalDate) / (1000 * 60 * 60 * 24),
          );
          const currentDate = new Date();
          nextServiceDate = new Date(
            currentDate.getTime() + daysDiff * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0];
        }

        // Crear nuevo mantenimiento programado
        const newMaintenance = {
          vehicleId: selectedMaintenance.vehicleId,
          type: selectedMaintenance.type,
          category: selectedMaintenance.category,
          date: new Date().toISOString().split("T")[0], // Fecha actual
          km: vehicle?.currentKm || null,
          cost: null, // No tiene costo aún
          provider: null, // No tiene proveedor aún
          notes: `Próximo ${selectedMaintenance.type} programado automáticamente`,
          photo: null,
          nextServiceKm,
          nextServiceDate,
          completedAt: null, // No está completado
        };

        await addMaintenance(newMaintenance);
      }

      setApproveModalVisible(false);
      setSelectedMaintenance(null);
      loadMaintenances();
      showDialog({
        title: "Realizado",
        message: scheduleNext
          ? "El mantenimiento fue marcado como realizado y se programó el próximo servicio."
          : "El mantenimiento fue marcado como realizado.",
        type: "success",
      });
    } catch (error) {
      console.error("Error procesando mantenimiento:", error);
      showDialog({
        title: "Error",
        message: "No se pudo procesar el mantenimiento.",
        type: "error",
      });
    }
  };

  const renderMaintenanceItem = ({ item }) => {
    const completed = isCompleted(item);
    const maintenanceColor =
      maintenanceTypeColorMap[item.type] || colors.primary;
    const maintenanceIcon = getMaintenanceIcon(item.type);
    const scheduleColor = item.nextServiceKm
      ? getKmUrgencyColor(vehicle?.currentKm, item.nextServiceKm)
      : item.nextServiceDate
        ? getDateUrgencyColor(item.nextServiceDate)
        : COLORS.success;

    return (
      <View
        style={[
          styles.maintenanceCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardIdentity}>
            <View
              style={[
                styles.cardIconWrap,
                { backgroundColor: `${maintenanceColor}20` },
              ]}
            >
              <Ionicons
                name={maintenanceIcon}
                size={iconSize.md}
                color={maintenanceColor}
              />
            </View>
            <View style={styles.cardTitleWrap}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.maintenanceType, { color: colors.text }]}>
                  {item.type}
                </Text>
              </View>
              {!vehicleId && item.vehicleName && (
                <Text
                  style={[styles.vehicleName, { color: colors.textSecondary }]}
                >
                  {item.vehicleName}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[
                styles.iconAction,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={() => handleEdit(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="create-outline"
                size={iconSize.sm}
                color={COLORS.warning}
              />
            </TouchableOpacity>
            {!completed && (
              <TouchableOpacity
                style={[
                  styles.iconAction,
                  { backgroundColor: colors.inputBackground },
                ]}
                onPress={() => handleApprove(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={iconSize.sm}
                  color={COLORS.success}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.iconAction,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={() => handleDelete(item.id, item.type)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="trash-outline"
                size={iconSize.sm}
                color={COLORS.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View
            style={[
              styles.metaPill,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={iconSize.xs}
              color={colors.primary}
            />
            <Text style={[styles.metaPillText, { color: colors.text }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          {item.km && (
            <View
              style={[
                styles.metaPill,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Ionicons
                name="speedometer-outline"
                size={iconSize.xs}
                color={colors.primary}
              />
              <Text style={[styles.metaPillText, { color: colors.text }]}>
                {formatKm(item.km)}
              </Text>
            </View>
          )}
          {item.cost && (
            <View
              style={[
                styles.metaPill,
                { backgroundColor: colors.inputBackground },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={iconSize.xs}
                color={maintenanceColor}
              />
              <Text style={[styles.metaPillText, styles.costText]}>
                {formatCurrency(item.cost, currencySymbol)}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <View
            style={[
              styles.notesContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
              Observaciones
            </Text>
            <Text style={[styles.notesText, { color: colors.text }]}>
              {item.notes}
            </Text>
          </View>
        )}

        {item.photos && item.photos.length > 0 && (
          <View style={styles.photoContainer}>
            <FlatList
              data={item.photos}
              renderItem={({ item: photo }) => (
                <TouchableOpacity
                  onPress={() => openImageModal(photo.uri)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(photo) => photo.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoStrip}
            />
          </View>
        )}

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          {completed ? (
            <View style={styles.footerInfoRow}>
              <View
                style={[
                  styles.footerBadge,
                  { backgroundColor: "rgba(76, 175, 80, 0.14)" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={iconSize.xs}
                  color={COLORS.success}
                />
                <Text
                  style={[styles.footerBadgeText, { color: COLORS.success }]}
                >
                  Completado
                </Text>
              </View>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                {item.completedAt
                  ? formatDate(item.completedAt)
                  : item.updatedAt
                    ? formatDate(item.updatedAt)
                    : "-"}
              </Text>
            </View>
          ) : (
            <View style={styles.footerInfoRow}>
              <View
                style={[
                  styles.footerBadge,
                  { backgroundColor: `${scheduleColor}14` },
                ]}
              >
                <Ionicons
                  name={
                    item.nextServiceKm
                      ? "speedometer-outline"
                      : "calendar-outline"
                  }
                  size={iconSize.xs}
                  color={scheduleColor}
                />
                <Text
                  style={[styles.footerBadgeText, { color: scheduleColor }]}
                >
                  Próximo servicio
                </Text>
              </View>
              <Text style={[styles.footerText, { color: scheduleColor }]}>
                {item.nextServiceKm
                  ? formatKmRemaining(vehicle?.currentKm, item.nextServiceKm) ||
                    `A los ${formatKm(item.nextServiceKm)}`
                  : item.nextServiceDate
                    ? formatDaysRemaining(item.nextServiceDate)
                    : "Sin programación"}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="clipboard-outline"
        size={iconSize.xxl}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No hay mantenimientos
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Los mantenimientos registrados aparecerán aquí
      </Text>
    </View>
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <LinearGradient
            colors={["#6CB6FF", "#1B63E2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerEyebrow}>Bitácora técnica</Text>
                <Text style={styles.headerTitle}>
                  {vehicle?.name || "Todos los vehículos"}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {maintenances.length}{" "}
                  {maintenances.length === 1 ? "registro" : "registros"}{" "}
                  trazados en el historial
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{inProgressCount}</Text>
                <Text style={styles.summaryLabel}>En curso</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{completedCount}</Text>
                <Text style={styles.summaryLabel}>Realizados</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tabs para filtrar */}
        <View
          style={[styles.tabsContainer, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === "inProgress"
                    ? colors.primary
                    : colors.cardBackground,
                borderColor:
                  activeTab === "inProgress" ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab("inProgress")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "inProgress" ? "#fff" : colors.text },
              ]}
            >
              En curso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === "done" ? colors.primary : colors.cardBackground,
                borderColor:
                  activeTab === "done" ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab("done")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "done" ? "#fff" : colors.text },
              ]}
            >
              Realizados
            </Text>
          </TouchableOpacity>
          {activeTab === "inProgress" && (
            <TouchableOpacity
              style={styles.infoIcon}
              onPress={() =>
                showDialog({
                  title: "Próximos Mantenimientos",
                  message:
                    "Aquí puedes ver los mantenimientos programados para tu vehículo. Usa el icono del check (✓) para marcar como realizado cuando completes un servicio. También puedes editar o eliminar mantenimientos usando los iconos correspondientes. Mantén esta lista actualizada para tener un historial preciso.",
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
          )}
          {activeTab === "done" && (
            <TouchableOpacity
              style={styles.infoIcon}
              onPress={() =>
                showDialog({
                  title: "💰 Importancia de los costos",
                  message:
                    "Si editas y agregas costos a los mantenimientos realizados, estos se verán reflejados automáticamente en las estadísticas de inversión (MRO). Es de suma importancia mantener estos datos actualizados para tener un control financiero preciso y tomar mejores decisiones sobre el cuidado de tu vehículo.",
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
          )}
        </View>

        <FlatList
          data={filteredMaintenances}
          renderItem={renderMaintenanceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        {/* Modal para ver imagen en pantalla completa */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImageModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              activeOpacity={1}
              onPress={closeImageModal}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeImageModal}
                >
                  <Ionicons
                    name="close-circle"
                    size={iconSize.xl}
                    color="#fff"
                  />
                </TouchableOpacity>
                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal para marcar mantenimiento como realizado */}
        <Modal
          visible={approveModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setApproveModalVisible(false)}
        >
          <View style={styles.approveModalContainer}>
            <View
              style={[
                styles.approveModalContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.approveModalHeader}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={iconSize.xxl}
                  color={COLORS.success}
                />
                <Text
                  style={[styles.approveModalTitle, { color: colors.text }]}
                >
                  Marcar como realizado
                </Text>
                <Text
                  style={[
                    styles.approveModalMessage,
                    { color: colors.textSecondary },
                  ]}
                >
                  ¿Deseas marcar este mantenimiento como realizado?
                </Text>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setScheduleNext(!scheduleNext)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      scheduleNext && styles.checkboxChecked,
                    ]}
                  >
                    {scheduleNext && (
                      <Ionicons
                        name="checkmark"
                        size={iconSize.sm}
                        color="#fff"
                      />
                    )}
                  </View>
                  <Text style={[styles.checkboxText, { color: colors.text }]}>
                    Programar próximo mantenimiento
                  </Text>
                </TouchableOpacity>
                {scheduleNext && (
                  <Text
                    style={[
                      styles.checkboxHint,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Se programará automáticamente basado en los días/kilómetros
                    configurados
                  </Text>
                )}
              </View>

              <View style={styles.approveModalButtons}>
                <TouchableOpacity
                  style={[styles.approveModalButton, styles.cancelButton]}
                  onPress={() => setApproveModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.approveModalButtonText,
                      { color: colors.text },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.approveModalButton, styles.confirmButton]}
                  onPress={handleConfirmApprove}
                >
                  <Text
                    style={[styles.approveModalButtonText, { color: "#fff" }]}
                  >
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Edit Modal for completed maintenances */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View
            style={[
              styles.editModalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>
                Editar mantenimiento
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={iconSize.md} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <ScrollView
                style={styles.editModalScroll}
                contentContainerStyle={styles.editModalScrollContent}
              >
                {/* Date */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Fecha
                  </Text>
                  <TouchableOpacity
                    key={`date-${editFormData.date?.getTime()}`}
                    style={[
                      styles.dateButton,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={iconSize.md}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.dateButtonText, { color: colors.text }]}
                    >
                      {formatDate(editFormData.date)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Cost */}
                <View style={[styles.inputGroup, styles.costInputGroup]}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Costo
                  </Text>
                  <TextInput
                    ref={costRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={editFormData.cost}
                    onChangeText={(value) =>
                      setEditFormData((prev) => ({ ...prev, cost: value }))
                    }
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => providerRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Provider */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Taller/Proveedor
                  </Text>
                  <TextInput
                    ref={providerRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={editFormData.provider}
                    onChangeText={(value) =>
                      setEditFormData((prev) => ({ ...prev, provider: value }))
                    }
                    placeholder="Nombre del taller"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    onSubmitEditing={() => notesRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Notas
                  </Text>
                  <TextInput
                    ref={notesRef}
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={editFormData.notes}
                    onChangeText={(value) =>
                      setEditFormData((prev) => ({ ...prev, notes: value }))
                    }
                    placeholder="Notas adicionales"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    returnKeyType="done"
                  />
                </View>

                {/* Photo - Temporarily hidden */}
                {/*
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Foto del recibo
                  </Text>
                  {editFormData.photo && (
                    <Image
                      source={{ uri: editFormData.photo }}
                      style={styles.photoPreview}
                    />
                  )}
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={async () => {
                        const { status } =
                          await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== "granted") {
                          showDialog({
                            title: "Permiso denegado",
                            message:
                              "Necesitamos permiso para acceder a la cámara",
                            type: "warning",
                          });
                          return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                          allowsEditing: true,
                          quality: 0.8,
                        });
                        if (!result.canceled) {
                          setEditFormData((prev) => ({
                            ...prev,
                            photo: result.assets[0].uri,
                          }));
                        }
                      }}
                    >
                      <Button title="Tomar foto" variant="secondary" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.photoButton}
                      onPress={async () => {
                        const { status } =
                          await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== "granted") {
                          showDialog({
                            title: "Permiso denegado",
                            message:
                              "Necesitamos permiso para acceder a tus fotos",
                            type: "warning",
                          });
                          return;
                        }
                        const result =
                          await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 0.8,
                          });
                        if (!result.canceled) {
                          setEditFormData((prev) => ({
                            ...prev,
                            photo: result.assets[0].uri,
                          }));
                        }
                      }}
                    >
                      <Button title="Elegir de galería" variant="secondary" />
                    </TouchableOpacity>
                  </View>
                </View>
                */}
              </ScrollView>
            </View>

            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.editModalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text
                  style={[
                    styles.editModalCancelText,
                    { color: colors.primary },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editModalSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.editModalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker separado para evitar conflictos con el modal */}
      {showDatePicker && (
        <DateTimePicker
          value={editFormData.date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) {
              setEditFormData((prev) => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.74)",
  },
  headerTitle: {
    fontSize: rf(24),
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: rf(14),
    marginTop: vs(4),
    lineHeight: rf(20),
    color: "rgba(255,255,255,0.84)",
  },
  summaryRow: {
    flexDirection: "row",
    gap: hs(10),
    marginTop: vs(16),
  },
  summaryCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  summaryValue: {
    fontSize: rf(20),
    fontWeight: "800",
    marginBottom: vs(2),
    color: "#fff",
  },
  summaryLabel: {
    fontSize: rf(12),
    fontWeight: "600",
    color: "rgba(255,255,255,0.76)",
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(10),
    marginBottom: vs(4),
    paddingHorizontal: hs(16),
    position: "relative",
  },
  infoIcon: {
    position: "absolute",
    right: hs(16),
    padding: spacing.sm,
  },
  tab: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(24),
    borderRadius: borderRadius.xl,
    marginHorizontal: hs(4),
    elevation: s(2),
    borderWidth: 1,
  },
  tabText: {
    fontSize: rf(15),
    fontWeight: "600",
  },
  maintenanceCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(16),
    elevation: s(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: hs(12),
    marginBottom: vs(14),
  },
  cardIdentity: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  cardIconWrap: {
    width: s(46),
    height: s(46),
    borderRadius: s(23),
    alignItems: "center",
    justifyContent: "center",
    marginRight: hs(12),
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitleRow: {
    minHeight: s(24),
  },
  maintenanceType: {
    fontSize: rf(16),
    fontWeight: "800",
    flex: 1,
  },
  vehicleName: {
    fontSize: rf(12),
    marginTop: vs(4),
  },
  cardActions: {
    flexDirection: "row",
    gap: hs(8),
  },
  iconAction: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: "center",
    justifyContent: "center",
  },
  metaGrid: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: hs(8),
    marginBottom: vs(12),
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  metaPillText: {
    fontSize: rf(12),
    marginLeft: hs(6),
    fontWeight: "600",
  },
  costText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  notesContainer: {
    marginTop: vs(4),
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  notesLabel: {
    fontSize: rf(12),
    fontWeight: "600",
    marginBottom: vs(4),
  },
  notesText: {
    fontSize: rf(14),
    lineHeight: vs(20),
  },
  photoContainer: {
    marginTop: vs(12),
  },
  photoStrip: {
    paddingRight: spacing.sm,
  },
  photoThumbnail: {
    width: s(92),
    height: s(92),
    borderRadius: borderRadius.md,
    marginRight: hs(10),
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  footerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: hs(10),
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  footerBadgeText: {
    fontSize: rf(11),
    fontWeight: "700",
    marginLeft: hs(6),
  },
  footerText: {
    fontSize: rf(13),
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: "800",
    marginTop: vs(16),
  },
  emptySubtitle: {
    fontSize: rf(14),
    textAlign: "center",
    marginTop: vs(8),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    flex: 1,
    width: "100%",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCloseButton: {
    position: "absolute",
    top: vs(40),
    right: hs(20),
    zIndex: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  approveModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  approveModalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: s(420),
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
  },
  approveModalHeader: {
    alignItems: "center",
    marginBottom: vs(24),
  },
  approveModalTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginTop: vs(16),
    marginBottom: vs(8),
  },
  approveModalMessage: {
    fontSize: rf(16),
    textAlign: "center",
    lineHeight: vs(22),
  },
  checkboxContainer: {
    marginBottom: vs(24),
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(8),
  },
  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(4),
    borderWidth: s(2),
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(12),
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: rf(16),
    flex: 1,
  },
  checkboxHint: {
    fontSize: rf(14),
    marginTop: vs(8),
    marginLeft: hs(36),
    fontStyle: "italic",
  },
  approveModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  approveModalButton: {
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
    backgroundColor: COLORS.success,
  },
  approveModalButtonText: {
    fontSize: rf(16),
    fontWeight: "600",
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  editModalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: ms(420),
    maxHeight: "80%",
    flex: 1,
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  editModalTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  editModalScroll: {
    flex: 1,
  },
  editModalScrollContent: {
    flexGrow: 1,
  },
  editModalBody: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  costInputGroup: {
    marginBottom: spacing.lg,
    marginTop: -5,
  },
  label: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: {
    height: vs(80),
    textAlignVertical: "top",
  },
  photoPreview: {
    width: "100%",
    height: vs(200),
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  editModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: vs(20),
    gap: hs(12),
  },
  editModalCancelButton: {
    flex: 1,
    paddingVertical: vs(12),
    paddingHorizontal: hs(24),
    borderRadius: borderRadius.sm,
    alignItems: "center",
    borderWidth: s(1),
    borderColor: COLORS.border,
  },
  editModalCancelText: {
    fontSize: rf(16),
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(8),
    paddingVertical: vs(12),
    paddingHorizontal: hs(16),
    borderRadius: borderRadius.sm,
    borderWidth: s(1),
  },
  dateButtonText: {
    fontSize: rf(16),
  },
  editModalSaveButton: {
    flex: 1,
    paddingVertical: vs(12),
    paddingHorizontal: hs(24),
    borderRadius: borderRadius.sm,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  editModalSaveText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "white",
  },
});

export default MaintenanceHistoryScreen;
