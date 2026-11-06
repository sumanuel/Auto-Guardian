import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  deleteMaintenanceType,
  getMaintenanceTypes,
  isMaintenanceTypeInUse,
  updateMaintenanceTypesOrder,
} from "../services/maintenanceService";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const CategoriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
    const unsubscribe = navigation.addListener("focus", loadCategories);
    return unsubscribe;
  }, [navigation]);

  const loadCategories = () => {
    const types = getMaintenanceTypes();
    setCategories(types);
  };

  const handleDragEnd = ({ data }) => {
    setCategories(data);
    // Actualizar el orden en la base de datos
    updateMaintenanceTypesOrder(data);
  };

  const renderCategoryItem = ({ item, drag, isActive }) => (
    <View
      style={[
        styles.categoryCard,
        {
          backgroundColor: colors.cardBackground,
          opacity: isActive ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.typeItem}>
        <View style={styles.typeInfo}>
          <Ionicons
            name={item.icon || "build-outline"}
            size={iconSize.md}
            color={colors.primary}
          />
          <View style={styles.typeDetails}>
            <Text style={[styles.typeName, { color: colors.text }]}>
              {item.name}
            </Text>
            <View style={styles.intervalsContainer}>
              <View style={styles.intervalRow}>
                <Ionicons
                  name="speedometer-outline"
                  size={iconSize.sm}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.intervalText,
                    {
                      color: item.defaultIntervalKm
                        ? colors.textSecondary
                        : "#e74c3c",
                      fontWeight: item.defaultIntervalKm ? "normal" : "600",
                    },
                  ]}
                >
                  {item.defaultIntervalKm
                    ? `Cada ${item.defaultIntervalKm?.toLocaleString()} km`
                    : "Por definir"}
                </Text>
              </View>
              <View style={styles.intervalRow}>
                <Ionicons
                  name="calendar-outline"
                  size={iconSize.sm}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.intervalText,
                    {
                      color:
                        item.defaultIntervalTime || item.defaultIntervalMonths
                          ? colors.textSecondary
                          : "#e74c3c",
                      fontWeight:
                        item.defaultIntervalTime || item.defaultIntervalMonths
                          ? "normal"
                          : "600",
                    },
                  ]}
                >
                  {item.defaultIntervalTime || item.defaultIntervalMonths
                    ? `Cada ${
                        item.defaultIntervalTime || item.defaultIntervalMonths
                      } ${
                        (item.defaultIntervalUnit || "months") === "months"
                          ? "meses"
                          : "días"
                      }`
                    : "Por definir"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.dragHandle}
            onLongPress={drag}
            delayLongPress={100}
          >
            <Ionicons
              name="menu-outline"
              size={iconSize.sm}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditType(item)}
          >
            <Ionicons
              name="create-outline"
              size={iconSize.sm}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteType(item)}
          >
            <Ionicons name="trash-outline" size={iconSize.sm} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleEditType = (type) => {
    navigation.navigate("MaintenanceTypeForm", { type });
  };

  const handleDeleteType = async (type) => {
    try {
      const inUse = await isMaintenanceTypeInUse(type.id);

      if (inUse) {
        showDialog({
          title: "No se puede eliminar",
          message: `El tipo "${type.name}" está siendo usado en registros de mantenimiento y no puede ser eliminado.`,
          type: "warning",
        });
        return;
      }

      showDialog({
        title: "Confirmar eliminación",
        message: `¿Estás seguro de eliminar "${type.name}"?`,
        type: "confirm",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteMaintenanceType(type.id);
                loadCategories();
              } catch (_error) {
                showDialog({
                  title: "Error",
                  message: "No se pudo eliminar el tipo de mantenimiento",
                  type: "error",
                });
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error verificando tipo de mantenimiento:", error);
      showDialog({
        title: "Error",
        message: "No se pudo verificar el tipo de mantenimiento",
        type: "error",
      });
    }
  };

  const handleAddType = () => {
    navigation.navigate("MaintenanceTypeForm");
  };

  return (
    <DialogComponent>
      <View
        style={[
          styles.container,
          styles.content,
          { backgroundColor: colors.background },
        ]}
      >
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroMediaRow}>
              <View style={[styles.iconBadge, styles.heroIconBadge]}>
                <Ionicons
                  name="build-outline"
                  size={iconSize.lg}
                  color="#D6E7FF"
                />
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroEyebrow}>Catálogo técnico</Text>
                <Text style={styles.headerTitle}>Tipos de Mantenimientos</Text>
                <Text style={styles.heroSubtitle}>
                  Organiza servicios frecuentes y define el orden operativo del
                  catálogo técnico.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
              onPress={() =>
                showDialog({
                  title: "Personalizar Orden",
                  message:
                    "Organiza tus tipos de mantenimiento colocando los más frecuentes al inicio de la lista. Mantén presionado el ícono ≡ de cualquier tipo y arrástralo hacia arriba o abajo para cambiar su posición. El orden se guardará automáticamente.",
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

        <DraggableFlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          onDragEnd={handleDragEnd}
          contentContainerStyle={styles.scrollContent}
          ListFooterComponent={<View style={styles.listFooterSpacer} />}
          showsVerticalScrollIndicator={false}
        />

        {/* Botón flotante para agregar */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primaryDark }]}
          onPress={handleAddType}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={iconSize.lg} color="#fff" />
        </TouchableOpacity>
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: vs(40),
  },
  listFooterSpacer: {
    height: iconSize.xl + vs(180),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroIconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: borderRadius.lg,
  },
  heroInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6E7FF",
  },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "#D6E7FF",
  },
  helpButtonHero: {
    width: s(42),
    height: s(42),
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  helpButton: {
    padding: spacing.xs,
  },
  categoryCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    flex: 1,
  },
  typeDetails: {
    flex: 1,
  },
  typeName: {
    fontSize: rf(16),
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: rf(12),
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  intervalsContainer: {
    marginTop: spacing.xs,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  intervalText: {
    fontSize: rf(13),
    lineHeight: rf(16),
  },
  editButton: {
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  dragHandle: {
    padding: spacing.xs,
    marginTop: spacing.xs,
    marginRight: spacing.xs,
  },
  iconSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.md,
  },
  iconSelectorText: {
    flex: 1,
    fontSize: rf(14),
  },
  iconPickerContent: {
    width: "90%",
    maxWidth: s(420),
    maxHeight: "80%",
    borderRadius: borderRadius.md,
    padding: 0,
    elevation: s(5),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
  },
  iconGrid: {
    padding: spacing.lg,
  },
  iconOption: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
  iconLabel: {
    fontSize: rf(11),
    marginTop: spacing.xs,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: s(420),
    borderRadius: borderRadius.md,
    padding: 0,
    elevation: s(5),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: rf(17),
    fontWeight: "bold",
  },
  modalBody: {
    padding: spacing.lg,
  },
  typeNameText: {
    fontSize: rf(16),
    fontWeight: "500",
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: rf(14),
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: hs(20),
    bottom: vs(20),
    width: iconSize.xl,
    height: iconSize.xl,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  unitSelector: {
    flexDirection: "row",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  unitButton: {
    flex: 1,
    borderWidth: s(1),
    borderRadius: borderRadius.xs,
    padding: spacing.xs,
    alignItems: "center",
  },
  unitButtonText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee",
    borderColor: "#e74c3c",
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: rf(14),
    marginLeft: spacing.xs,
    flex: 1,
  },
});

export default CategoriesScreen;
