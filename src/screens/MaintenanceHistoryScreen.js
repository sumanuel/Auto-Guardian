import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { formatDate } from "../utils/dateUtils";
import {
  formatCurrency,
  formatDaysRemaining,
  formatKm,
  formatKmRemaining,
  getDateUrgencyColor,
  getKmUrgencyColor,
} from "../utils/formatUtils";

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
  }, [vehicleId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadMaintenances();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMaintenances = () => {
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
              (new Date(a.nextServiceDate) - now) / (1000 * 60 * 60 * 24)
            )
          : Infinity;
        const bDaysDiff = b.nextServiceDate
          ? Math.floor(
              (new Date(b.nextServiceDate) - now) / (1000 * 60 * 60 * 24)
            )
          : Infinity;
        const aUrgency = Math.min(
          aKmDiff >= 0 ? aKmDiff / 100 : -1000,
          aDaysDiff >= 0 ? aDaysDiff : -1000
        );
        const bUrgency = Math.min(
          bKmDiff >= 0 ? bKmDiff / 100 : -1000,
          bDaysDiff >= 0 ? bDaysDiff : -1000
        );
        return aUrgency - bUrgency;
      });
      data = sorted;
    }
    setMaintenances(data);
  };

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
            } catch (error) {
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
          (v) => v.id === selectedMaintenance.vehicleId
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
            (nextDate - originalDate) / (1000 * 60 * 60 * 24)
          );
          const currentDate = new Date();
          nextServiceDate = new Date(
            currentDate.getTime() + daysDiff * 24 * 60 * 60 * 1000
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

  const renderMaintenanceItem = ({ item }) => (
    <View
      style={[
        styles.maintenanceCard,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
      ]}
    >
      <View
        style={[
          styles.cardHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.typeContainer}>
          <Ionicons name="build" size={20} color={COLORS.primary} />
          <View>
            <Text style={[styles.maintenanceType, { color: colors.text }]}>
              {item.type}
            </Text>
            {!vehicleId && item.vehicleName && (
              <Text
                style={[styles.vehicleName, { color: colors.textSecondary }]}
              >
                {item.vehicleName}
              </Text>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {!isCompleted(item) && (
            <>
              <TouchableOpacity
                onPress={() => handleEdit(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={COLORS.warning}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleApprove(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={COLORS.success}
                />
              </TouchableOpacity>
            </>
          )}
          {isCompleted(item) && (
            <TouchableOpacity
              onPress={() => handleEdit(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={COLORS.warning}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.type)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {formatDate(item.date)}
          </Text>
        </View>

        {item.km && (
          <View style={styles.infoRow}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatKm(item.km)}
            </Text>
          </View>
        )}

        {item.cost && (
          <View style={styles.infoRow}>
            <Ionicons
              name="cash-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, styles.costText]}>
              {formatCurrency(item.cost)}
            </Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: colors.text }]}>
              Notas:
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
              contentContainerStyle={{ paddingRight: 12 }}
            />
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        {isCompleted(item) ? (
          <View style={styles.nextServiceHeader}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.success}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.nextServiceLabel, { color: colors.text }]}>
              Realizado el:
            </Text>
            <Text
              style={[
                styles.nextServiceText,
                { color: colors.text, marginLeft: 8 },
              ]}
            >
              {item.completedAt
                ? formatDate(item.completedAt)
                : item.updatedAt
                ? formatDate(item.updatedAt)
                : "-"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.nextServiceHeader}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={COLORS.warning}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.nextServiceLabel, { color: colors.text }]}>
                Próximo servicio:
              </Text>
            </View>
            <View className={styles.nextServiceInfo}>
              {item.nextServiceKm ? (
                <View style={styles.nextServiceItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={14}
                    color={getKmUrgencyColor(
                      vehicle?.currentKm,
                      item.nextServiceKm
                    )}
                  />
                  <Text
                    style={[
                      styles.nextServiceText,
                      {
                        color: getKmUrgencyColor(
                          vehicle?.currentKm,
                          item.nextServiceKm
                        ),
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {formatKmRemaining(
                      vehicle?.currentKm,
                      item.nextServiceKm
                    ) || `A los ${formatKm(item.nextServiceKm)}`}
                  </Text>
                </View>
              ) : item.nextServiceDate ? (
                <View style={styles.nextServiceItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={getDateUrgencyColor(item.nextServiceDate)}
                  />
                  <Text
                    style={[
                      styles.nextServiceText,
                      {
                        color: getDateUrgencyColor(item.nextServiceDate),
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {formatDaysRemaining(item.nextServiceDate)}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="clipboard-outline"
        size={60}
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
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {vehicle?.name || "Todos los vehículos"}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {maintenances.length}{" "}
            {maintenances.length === 1 ? "registro" : "registros"}
          </Text>
        </View>

        {/* Tabs para filtrar */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "inProgress" && styles.tabActive,
              {
                backgroundColor:
                  activeTab === "inProgress"
                    ? colors.primary
                    : colors.cardBackground,
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
              activeTab === "done" && styles.tabActive,
              {
                backgroundColor:
                  activeTab === "done" ? colors.primary : colors.cardBackground,
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
                size={24}
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
                  <Ionicons name="close-circle" size={36} color="#fff" />
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
                  size={48}
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
                      <Ionicons name="checkmark" size={16} color="#fff" />
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
                <Ionicons name="close" size={24} color={colors.text} />
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
                      size={20}
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    position: "relative",
  },
  infoIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 4,
    elevation: 2,
  },
  tabActive: {
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  maintenanceCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  maintenanceType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleName: {
    fontSize: 12,
    marginTop: 2,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  costText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  photoContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: 150,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  nextServiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  nextServiceLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  nextServiceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  nextServiceText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
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
    padding: 20,
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
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
    padding: 20,
  },
  approveModalContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  approveModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  approveModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  approveModalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 16,
    flex: 1,
  },
  checkboxHint: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 36,
    fontStyle: "italic",
  },
  approveModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  approveModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  approveModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editModalContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    flex: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 20,
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
    marginBottom: 20,
  },
  costInputGroup: {
    marginBottom: 20,
    marginTop: -5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  editModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  editModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 16,
  },
  editModalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  editModalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default MaintenanceHistoryScreen;
