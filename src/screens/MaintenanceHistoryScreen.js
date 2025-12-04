import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Image, Modal, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
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

const MaintenanceHistoryScreen = ({ route }) => {
  const { vehicleId = null, sortByUrgency = false } = route.params || {};
  const {
    getVehicleMaintenances,
    removeMaintenance,
    vehicles,
    getAllMaintenances,
  } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();

  const vehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : null;
  const [maintenances, setMaintenances] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

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

  const loadMaintenances = () => {
    let data;

    if (vehicleId) {
      // Si hay un vehículo específico, cargar solo sus mantenimientos
      data = getVehicleMaintenances(vehicleId);
    } else {
      // Si no hay vehículo específico, cargar todos los mantenimientos
      data = getAllMaintenances ? getAllMaintenances() : [];
    }

    // Si viene desde próximos mantenimientos, ordenar por urgencia
    if (sortByUrgency) {
      const now = new Date();
      const sorted = data.sort((a, b) => {
        // Solo considerar items con próximo servicio programado
        const hasNextA = a.nextServiceKm || a.nextServiceDate;
        const hasNextB = b.nextServiceKm || b.nextServiceDate;

        if (!hasNextA && !hasNextB) return 0;
        if (!hasNextA) return 1;
        if (!hasNextB) return -1;

        // Calcular urgencia por kilometraje
        const aKmDiff = a.nextServiceKm
          ? a.nextServiceKm - (vehicle?.currentKm || 0)
          : Infinity;
        const bKmDiff = b.nextServiceKm
          ? b.nextServiceKm - (vehicle?.currentKm || 0)
          : Infinity;

        // Calcular urgencia por fecha (días restantes)
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

        // Tomar el criterio más urgente de cada mantenimiento
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
      setMaintenances(sorted);
    } else {
      setMaintenances(data);
    }
  };

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
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.type)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
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

        {item.provider && (
          <View style={styles.infoRow}>
            <Ionicons
              name="business-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {item.provider}
            </Text>
          </View>
        )}

        {item.notes && (
          <View
            style={[
              styles.notesContainer,
              { backgroundColor: colors.inputBackground },
            ]}
          >
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
              Notas:
            </Text>
            <Text style={[styles.notesText, { color: colors.text }]}>
              {item.notes}
            </Text>
          </View>
        )}

        {item.photo && (
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => openImageModal(item.photo)}
          >
            <Image source={{ uri: item.photo }} style={styles.photoThumbnail} />
            <View style={styles.photoOverlay}>
              <Ionicons name="expand-outline" size={24} color="#fff" />
              <Text style={styles.photoOverlayText}>Ver recibo</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {(item.nextServiceKm || item.nextServiceDate) && (
        <View
          style={[
            styles.cardFooter,
            {
              backgroundColor: colors.primary + "15",
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.nextServiceHeader}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.nextServiceLabel, { color: colors.primary }]}>
              Próximo servicio:
            </Text>
          </View>

          <View style={styles.nextServiceInfo}>
            {item.nextServiceKm && (
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
                  {formatKmRemaining(vehicle?.currentKm, item.nextServiceKm) ||
                    `A los ${formatKm(item.nextServiceKm)}`}
                </Text>
              </View>
            )}
            {item.nextServiceDate && (
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
            )}
          </View>
        </View>
      )}
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

        <FlatList
          data={maintenances}
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
      </View>
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
    gap: 8,
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
    gap: 6,
  },
  nextServiceLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  nextServiceInfo: {
    gap: 6,
  },
  nextServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});

export default MaintenanceHistoryScreen;
