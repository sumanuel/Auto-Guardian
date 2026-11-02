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
import {
  getMaintenanceDueDate,
  getMaintenanceTypes,
} from "../services/maintenanceService";
import { daysUntilService, formatDate } from "../utils/dateUtils";
import {
  fromStoredItems,
  itemsTotal,
  serializeItems,
} from "../utils/itemsUtils";
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
  iconSize,
  ms,
} from "../utils/responsive";
import { styles } from "./MaintenanceHistoryScreen.styles";
import ItemsDetail from "../components/common/ItemsDetail";
import { QUICK_ACTION_COLORS } from "../components/maintenance/QuickActionCard";

const MaintenanceHistoryScreen = ({ route, navigation }) => {
  const {
    vehicleId = null,
    sortByUrgency = false,
    initialTab = "inProgress",
  } = route.params || {};
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
  const [activeTab, setActiveTab] = useState(initialTab);
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
  const [editItems, setEditItems] = useState([]);
  const editHasItems = editItems.length > 0;
  const editItemsCost = itemsTotal(editItems);

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
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadMaintenances();
    });
    return unsubscribe;
  }, [loadMaintenances, navigation]);

  const isCompleted = useCallback(
    (item) =>
      Boolean(item.completedAt) ||
      (!item.nextServiceKm && !item.nextServiceDate),
    [],
  );

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
      const aIsCompleted = isCompleted(a);
      const bIsCompleted = isCompleted(b);

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
        const aDueDate = getMaintenanceDueDate(a);
        const bDueDate = getMaintenanceDueDate(b);
        const aDaysDiff = aDueDate
          ? Math.floor((new Date(aDueDate) - now) / (1000 * 60 * 60 * 24))
          : Infinity;
        const bDaysDiff = bDueDate
          ? Math.floor((new Date(bDueDate) - now) / (1000 * 60 * 60 * 24))
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
    isCompleted,
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

  const vehicleMeta = vehicle
    ? [vehicle.brand, vehicle.model, vehicle.year && `${vehicle.year}`]
        .filter(Boolean)
        .join(" • ")
    : `${vehicles.length} unidad${vehicles.length === 1 ? "" : "es"}`;

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
        setEditItems(fromStoredItems(maintenanceToEdit.items));
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
        cost: editHasItems
          ? editItemsCost
          : editFormData.cost
            ? parseFloat(editFormData.cost)
            : null,
        provider: editFormData.provider || null,
        notes: editFormData.notes || null,
        photo: editFormData.photo || null,
        items: serializeItems(editItems),
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
          // Reprogramar desde la fecha que acaba de realizarse.
          const originalDate = new Date(selectedMaintenance.date);
          const nextDate = new Date(selectedMaintenance.nextServiceDate);
          const daysDiff = Math.floor(
            (nextDate - originalDate) / (1000 * 60 * 60 * 24),
          );
          const nextScheduledDate = new Date(
            selectedMaintenance.nextServiceDate,
          );
          nextServiceDate = new Date(
            nextScheduledDate.getTime() + daysDiff * 24 * 60 * 60 * 1000,
          ).toISOString();

          selectedMaintenance.date = nextScheduledDate.toISOString();
        }

        // Crear nuevo mantenimiento programado
        const newMaintenance = {
          vehicleId: selectedMaintenance.vehicleId,
          type: selectedMaintenance.type,
          category: selectedMaintenance.category,
          date: selectedMaintenance.date || new Date().toISOString(),
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

    // Determinar color de la programación: si no está vencida, mostrar verde
    let scheduleColor = COLORS.success;
    if (item.nextServiceKm) {
      scheduleColor = getKmUrgencyColor(vehicle?.currentKm, item.nextServiceKm);
    } else if (item.nextServiceDate) {
      const dueDate = getMaintenanceDueDate(item);
      const days = daysUntilService(dueDate);
      if (days > 0) {
        scheduleColor = "#00C851"; // Verde si falta tiempo
      } else {
        scheduleColor = getDateUrgencyColor(item.nextServiceDate);
      }
    } else {
      scheduleColor = COLORS.success;
    }

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
              {`Fecha programada: ${formatDate(item.date)}`}
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
                  ? `Fecha realizado: ${formatDate(item.completedAt)}`
                  : item.updatedAt
                    ? `Fecha realizado: ${formatDate(item.updatedAt)}`
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
                  Próxima programación
                </Text>
              </View>
              <Text style={[styles.footerText, { color: scheduleColor }]}>
                {item.nextServiceKm
                  ? formatKmRemaining(vehicle?.currentKm, item.nextServiceKm) ||
                    `A los ${formatKm(item.nextServiceKm)}`
                  : item.nextServiceDate
                    ? `${formatDaysRemaining(getMaintenanceDueDate(item))}`
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
        <LinearGradient
          colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.heroMediaRow}>
              {vehicle?.photo ? (
                <Image
                  source={{ uri: vehicle.photo }}
                  style={styles.vehicleImage}
                />
              ) : (
                <View
                  style={[styles.imagePlaceholder, styles.heroImagePlaceholder]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={ms(44)}
                    color="#D6E7FF"
                  />
                </View>
              )}

              <View style={styles.headerInfo}>
                <Text style={styles.headerEyebrow}>
                  Bitácora de mantenimiento
                </Text>
                <Text style={styles.headerTitle}>
                  {vehicle?.name || "Todos los vehículos"}
                </Text>
                {!!vehicleMeta && (
                  <Text style={styles.headerSubtitle}>{vehicleMeta}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
              onPress={() =>
                showDialog(
                  activeTab === "inProgress"
                    ? {
                        title: "Próximos mantenimientos",
                        message:
                          "Aquí puedes ver los mantenimientos programados para tu vehículo. Usa el icono del check para marcar como realizado cuando completes un servicio. También puedes editar o eliminar mantenimientos para mantener la bitácora precisa.",
                        type: "info",
                      }
                    : {
                        title: "Importancia de los costos",
                        message:
                          "Si editas y agregas costos a los mantenimientos realizados, estos se verán reflejados automáticamente en las estadísticas de inversión (MRO). Mantener estos datos actualizados mejora el control financiero del vehículo.",
                        type: "info",
                      },
                )
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
                    ? colors.primaryDark
                    : colors.cardBackground,
                borderColor:
                  activeTab === "inProgress"
                    ? colors.primaryDark
                    : colors.border,
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
              Programados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === "done"
                    ? colors.primaryDark
                    : colors.cardBackground,
                borderColor:
                  activeTab === "done" ? colors.primaryDark : colors.border,
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
                    Fecha de realización
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

                {/* Detalle por ítems */}
                <ItemsDetail
                  items={editItems}
                  onChange={setEditItems}
                  currencySymbol={currencySymbol || "$"}
                />

                {/* Cost */}
                <View style={[styles.inputGroup, styles.costInputGroup]}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Costo{editHasItems ? " (calculado del detalle)" : ""}
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
                    value={
                      editHasItems ? editItemsCost.toFixed(2) : editFormData.cost
                    }
                    onChangeText={(value) =>
                      setEditFormData((prev) => ({ ...prev, cost: value }))
                    }
                    editable={!editHasItems}
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

export default MaintenanceHistoryScreen;
