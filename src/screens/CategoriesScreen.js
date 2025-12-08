import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  createMaintenanceType,
  getMaintenanceTypes,
  updateMaintenanceType,
} from "../services/maintenanceService";

const CategoriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editKm, setEditKm] = useState("");
  const [editMonths, setEditMonths] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("");
  const [newTypeKm, setNewTypeKm] = useState("");
  const [newTypeMonths, setNewTypeMonths] = useState("");
  const [newTypeIcon, setNewTypeIcon] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const types = getMaintenanceTypes();
    setCategories(types);
  };

  const handleEditType = (type) => {
    setSelectedType(type);
    setEditKm(type.defaultIntervalKm?.toString() || "");
    setEditMonths(type.defaultIntervalMonths?.toString() || "");
    setEditModalVisible(true);
  };

  const handleSaveType = async () => {
    if (!selectedType) return;

    const kmValue = editKm.trim() ? parseInt(editKm) : null;
    const monthsValue = editMonths.trim() ? parseInt(editMonths) : null;

    try {
      await updateMaintenanceType(selectedType.id, {
        defaultIntervalKm: kmValue,
        defaultIntervalMonths: monthsValue,
      });

      // Recargar categorías para mostrar los cambios
      loadCategories();
      setEditModalVisible(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error actualizando tipo de mantenimiento:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedType(null);
    setEditKm("");
    setEditMonths("");
  };

  const handleAddType = () => {
    setNewTypeName("");
    setNewTypeCategory("");
    setNewTypeKm("");
    setNewTypeMonths("");
    setNewTypeIcon("construct-outline");
    setAddModalVisible(true);
  };

  const handleSaveNewType = async () => {
    if (!newTypeName.trim()) return;

    const kmValue = newTypeKm.trim() ? parseInt(newTypeKm) : null;
    const monthsValue = newTypeMonths.trim() ? parseInt(newTypeMonths) : null;

    try {
      await createMaintenanceType({
        name: newTypeName.trim(),
        category: newTypeCategory.trim() || "General",
        defaultIntervalKm: kmValue,
        defaultIntervalMonths: monthsValue,
        icon: newTypeIcon || "construct-outline",
      });

      loadCategories();
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error creando tipo de mantenimiento:", error);
    }
  };

  const handleCancelAdd = () => {
    setAddModalVisible(false);
    setNewTypeName("");
    setNewTypeCategory("");
    setNewTypeKm("");
    setNewTypeMonths("");
    setNewTypeIcon("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {categories.map((type) => (
          <View
            key={type.id}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.typeItem}>
              <View style={styles.typeInfo}>
                <Ionicons
                  name={type.icon || "construct-outline"}
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.typeDetails}>
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {type.name}
                  </Text>
                  <View style={styles.intervalsContainer}>
                    <View style={styles.intervalRow}>
                      <Ionicons
                        name="speedometer-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.intervalText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cada {type.defaultIntervalKm?.toLocaleString()} km
                      </Text>
                    </View>
                    <View style={styles.intervalRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.intervalText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cada {type.defaultIntervalMonths} meses
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditType(type)}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddType}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Editar Intervalos
              </Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedType && (
              <View style={styles.modalBody}>
                <Text style={[styles.typeNameText, { color: colors.text }]}>
                  {selectedType.name}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Kilómetros
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={editKm}
                    onChangeText={setEditKm}
                    placeholder="Ej: 5000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Meses
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={editMonths}
                    onChangeText={setEditMonths}
                    placeholder="Ej: 6"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={handleCancelEdit}
                  >
                    <Text
                      style={[styles.cancelButtonText, { color: colors.text }]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleSaveType}
                  >
                    <Text style={[styles.saveButtonText, { color: "#fff" }]}>
                      Guardar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de agregar */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Nuevo Tipo de Mantenimiento
              </Text>
              <TouchableOpacity onPress={handleCancelAdd}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Nombre *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={newTypeName}
                  onChangeText={setNewTypeName}
                  placeholder="Ej: Cambio de batería"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Categoría
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={newTypeCategory}
                  onChangeText={setNewTypeCategory}
                  placeholder="Ej: Eléctrico"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Kilómetros
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={newTypeKm}
                    onChangeText={setNewTypeKm}
                    placeholder="5000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Meses
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={newTypeMonths}
                    onChangeText={setNewTypeMonths}
                    placeholder="6"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleCancelAdd}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSaveNewType}
                >
                  <Text style={[styles.saveButtonText, { color: "#fff" }]}>
                    Crear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  typeDetails: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  intervalsContainer: {
    marginTop: 8,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  intervalText: {
    fontSize: 13,
    lineHeight: 16,
  },
  editButton: {
    padding: 8,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 0,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  typeNameText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});

export default CategoriesScreen;
