import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  createMaintenanceType,
  deleteMaintenanceType,
  getMaintenanceTypeByName,
  getMaintenanceTypes,
  isMaintenanceTypeInUse,
  updateMaintenanceType,
} from "../services/maintenanceService";

const CategoriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [categories, setCategories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editKm, setEditKm] = useState("");
  const [editMonths, setEditMonths] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("");
  const [newTypeKm, setNewTypeKm] = useState("");
  const [newTypeMonths, setNewTypeMonths] = useState("");
  const [newTypeIcon, setNewTypeIcon] = useState("");
  const [isEditingIcon, setIsEditingIcon] = useState(false);
  const [editError, setEditError] = useState("");
  const [addError, setAddError] = useState("");

  // Iconos disponibles para tipos de mantenimiento
  const availableIcons = [
    { name: "water-outline", label: "Líquidos" },
    { name: "flash-outline", label: "Eléctrico" },
    { name: "build-outline", label: "Herramientas" },
    { name: "construct-outline", label: "Construcción" },
    { name: "cog-outline", label: "Engranaje" },
    { name: "hardware-chip-outline", label: "Componente" },
    { name: "funnel-outline", label: "Filtro" },
    { name: "ellipse-outline", label: "Neumático" },
    { name: "refresh-outline", label: "Rotación" },
    { name: "options-outline", label: "Ajuste" },
    { name: "battery-charging-outline", label: "Batería" },
    { name: "git-branch-outline", label: "Correa" },
    { name: "search-outline", label: "Inspección" },
    { name: "disc-outline", label: "Frenos" },
    { name: "git-compare-outline", label: "Suspensión" },
    { name: "thermometer-outline", label: "Temperatura" },
    { name: "speedometer-outline", label: "Velocímetro" },
    { name: "shield-outline", label: "Protección" },
    { name: "checkmark-circle-outline", label: "Verificado" },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const types = getMaintenanceTypes();
    setCategories(types);
  };

  const handleEditType = (type) => {
    setSelectedType(type);
    setEditName(type.name);
    setEditCategory(type.category || "");
    setEditKm(type.defaultIntervalKm?.toString() || "");
    setEditMonths(type.defaultIntervalMonths?.toString() || "");
    setEditIcon(type.icon || "build-outline");
    setEditError(""); // Limpiar error al abrir
    setEditModalVisible(true);
  };

  const handleSaveType = async () => {
    if (!selectedType || !editName.trim()) {
      setEditError("El nombre es obligatorio");
      return;
    }

    setEditError(""); // Limpiar error anterior

    const kmValue = editKm.trim() ? parseInt(editKm) : null;
    const monthsValue = editMonths.trim() ? parseInt(editMonths) : null;

    try {
      await updateMaintenanceType(selectedType.id, {
        name: editName.trim(),
        category: editCategory.trim() || "General",
        defaultIntervalKm: kmValue,
        defaultIntervalMonths: monthsValue,
        icon: editIcon,
      });

      loadCategories();
      setEditModalVisible(false);
      setSelectedType(null);
      setEditError(""); // Limpiar error al guardar exitosamente
      setEditError(""); // Limpiar error al guardar exitosamente
    } catch (error) {
      console.error("Error actualizando tipo de mantenimiento:", error);
      setTimeout(() => {
        showDialog({
          title: "Error",
          message: "No se pudo actualizar el tipo de mantenimiento",
          type: "error",
        });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedType(null);
    setEditName("");
    setEditCategory("");
    setEditKm("");
    setEditMonths("");
    setEditIcon("");
    setIsEditingIcon(false); // Limpiar estado de edición de icono
    setEditError(""); // Limpiar error al cancelar
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
              } catch (error) {
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

  const handleSelectIcon = (iconName) => {
    if (isEditingIcon) {
      setEditIcon(iconName);
    } else {
      setNewTypeIcon(iconName);
    }
    setIconPickerVisible(false);
  };

  const openIconPicker = (forEdit = false) => {
    setIsEditingIcon(forEdit);
    setIconPickerVisible(true);
  };

  const handleAddType = () => {
    setNewTypeName("");
    setNewTypeCategory("");
    setNewTypeKm("");
    setNewTypeMonths("");
    setNewTypeIcon("build-outline"); // Icono de llave inglesa por defecto
    setAddError(""); // Limpiar error al abrir
    setAddModalVisible(true);
  };

  const handleSaveNewType = async () => {
    if (!newTypeName.trim()) {
      setAddError("El nombre es obligatorio");
      return;
    }

    // Verificar si ya existe un tipo con este nombre
    const existingType = getMaintenanceTypeByName(newTypeName.trim());
    if (existingType) {
      setAddError("Ya existe un tipo de mantenimiento con este nombre");
      return;
    }

    setAddError(""); // Limpiar error anterior

    const kmValue = newTypeKm.trim() ? parseInt(newTypeKm) : null;
    const monthsValue = newTypeMonths.trim() ? parseInt(newTypeMonths) : null;

    try {
      await createMaintenanceType({
        name: newTypeName.trim(),
        category: newTypeCategory.trim() || "General",
        defaultIntervalKm: kmValue,
        defaultIntervalMonths: monthsValue,
        icon: newTypeIcon || "build-outline",
      });

      loadCategories();
      setAddModalVisible(false);
      // Limpiar formulario después de guardar exitosamente
      setNewTypeName("");
      setNewTypeCategory("");
      setNewTypeKm("");
      setNewTypeMonths("");
      setNewTypeIcon("");
      setIsEditingIcon(false); // Limpiar estado de edición de icono
      setAddError("");
    } catch (error) {
      console.error("Error creando tipo de mantenimiento:", error);
      setTimeout(() => {
        showDialog({
          title: "Error",
          message: "No se pudo crear el tipo de mantenimiento",
          type: "error",
        });
      }, 100);
    }
  };

  const handleCancelAdd = () => {
    setAddModalVisible(false);
    setNewTypeName("");
    setNewTypeCategory("");
    setNewTypeKm("");
    setNewTypeMonths("");
    setNewTypeIcon("");
    setIsEditingIcon(false); // Limpiar estado de edición de icono
    setAddError(""); // Limpiar error al cancelar
  };

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
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
                    name={type.icon || "build-outline"}
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
                            {
                              color: type.defaultIntervalKm
                                ? colors.textSecondary
                                : "#e74c3c",
                              fontWeight: type.defaultIntervalKm
                                ? "normal"
                                : "600",
                            },
                          ]}
                        >
                          {type.defaultIntervalKm
                            ? `Cada ${type.defaultIntervalKm?.toLocaleString()} km`
                            : "Por definir"}
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
                            {
                              color: type.defaultIntervalMonths
                                ? colors.textSecondary
                                : "#e74c3c",
                              fontWeight: type.defaultIntervalMonths
                                ? "normal"
                                : "600",
                            },
                          ]}
                        >
                          {type.defaultIntervalMonths
                            ? `Cada ${type.defaultIntervalMonths} meses`
                            : "Por definir"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.actionButtons}>
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
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteType(type)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
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
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Ej: Cambio de aceite"
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
                      value={editCategory}
                      onChangeText={setEditCategory}
                      placeholder="Ej: Motor"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Icono
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.iconSelector,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => openIconPicker(true)}
                    >
                      <Ionicons
                        name={editIcon || "build-outline"}
                        size={24}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.iconSelectorText,
                          { color: colors.text },
                        ]}
                      >
                        Seleccionar icono
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputRow}>
                    <View
                      style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}
                    >
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
                        placeholder="5000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>

                    <View
                      style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}
                    >
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
                        placeholder="6"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {editError ? (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                      <Text style={styles.errorText}>{editError}</Text>
                    </View>
                  ) : null}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={handleCancelEdit}
                    >
                      <Text
                        style={[
                          styles.cancelButtonText,
                          { color: colors.text },
                        ]}
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Icono
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.iconSelector,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => openIconPicker(false)}
                  >
                    <Ionicons
                      name={newTypeIcon || "build-outline"}
                      size={24}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.iconSelectorText, { color: colors.text }]}
                    >
                      Seleccionar icono
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}
                  >
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

                {addError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.errorText}>{addError}</Text>
                  </View>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { borderColor: colors.border },
                    ]}
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

        {/* Modal de selector de iconos */}
        <Modal
          visible={iconPickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIconPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.iconPickerContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Seleccionar Icono
                </Text>
                <TouchableOpacity onPress={() => setIconPickerVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={availableIcons}
                numColumns={3}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.iconGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: colors.background,
                        borderColor:
                          (isEditingIcon ? editIcon : newTypeIcon) === item.name
                            ? colors.primary
                            : colors.border,
                        borderWidth:
                          (isEditingIcon ? editIcon : newTypeIcon) === item.name
                            ? 2
                            : 1,
                      },
                    ]}
                    onPress={() => handleSelectIcon(item.name)}
                  >
                    <Ionicons
                      name={item.name}
                      size={32}
                      color={
                        (isEditingIcon ? editIcon : newTypeIcon) === item.name
                          ? colors.primary
                          : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.iconLabel,
                        {
                          color:
                            (isEditingIcon ? editIcon : newTypeIcon) ===
                            item.name
                              ? colors.primary
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 100,
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
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    marginTop: 4,
  },
  iconSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  iconSelectorText: {
    flex: 1,
    fontSize: 16,
  },
  iconPickerContent: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 12,
    padding: 0,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconGrid: {
    padding: 20,
  },
  iconOption: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  iconLabel: {
    fontSize: 11,
    marginTop: 6,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee",
    borderColor: "#e74c3c",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default CategoriesScreen;
