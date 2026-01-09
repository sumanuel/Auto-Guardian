import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  createMaintenanceType,
  deleteMaintenanceType,
  getMaintenanceTypeByName,
  getMaintenanceTypes,
  isMaintenanceTypeInUse,
  updateMaintenanceType,
  updateMaintenanceTypesOrder,
} from "../services/maintenanceService";
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

const CategoriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [categories, setCategories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingIconFor, setEditingIconFor] = useState(null); // 'edit' o 'add'
  const [editKm, setEditKm] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editTimeUnit, setEditTimeUnit] = useState("months");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState("");
  const [newTypeKm, setNewTypeKm] = useState("");
  const [newTypeTime, setNewTypeTime] = useState("");
  const [newTypeTimeUnit, setNewTypeTimeUnit] = useState("months");
  const [newTypeIcon, setNewTypeIcon] = useState("");
  const [editError, setEditError] = useState("");
  const [addError, setAddError] = useState("");

  // Referencias para navegación en modal de nuevo tipo
  const newTypeNameRef = useRef(null);
  const newTypeCategoryRef = useRef(null);
  const newTypeKmRef = useRef(null);
  const newTypeTimeRef = useRef(null);

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
    setSelectedType(type);
    setEditName(type.name);
    setEditCategory(type.category || "");
    setEditKm(type.defaultIntervalKm?.toString() || "");
    setEditTime(
      (type.defaultIntervalTime || type.defaultIntervalMonths)?.toString() || ""
    );
    setEditTimeUnit(type.defaultIntervalUnit || "months");
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
    const timeValue = editTime.trim() ? parseInt(editTime) : null;

    try {
      await updateMaintenanceType(selectedType.id, {
        name: editName.trim(),
        category: editCategory.trim() || "General",
        defaultIntervalKm: kmValue,
        defaultIntervalTime: timeValue,
        defaultIntervalUnit: editTimeUnit,
        icon: editIcon,
      });

      loadCategories();
      setEditModalVisible(false);
      setSelectedType(null);
      setEditError(""); // Limpiar error al guardar exitosamente
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
    setEditTime("");
    setEditTimeUnit("months");
    setEditIcon("");
    setEditingIconFor(null); // Limpiar estado de edición de icono
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
    if (editingIconFor === "edit") {
      setEditIcon(iconName);
    } else if (editingIconFor === "add") {
      setNewTypeIcon(iconName);
    }
    setIconPickerVisible(false);
    setEditingIconFor(null); // Limpiar después de seleccionar
  };

  const openIconPicker = (forEdit = false) => {
    setEditingIconFor(forEdit ? "edit" : "add");
    setIconPickerVisible(true);
  };

  const handleAddType = () => {
    setNewTypeName("");
    setNewTypeCategory("");
    setNewTypeKm("");
    setNewTypeTime("");
    setNewTypeTimeUnit("months");
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
    const timeValue = newTypeTime.trim() ? parseInt(newTypeTime) : null;

    try {
      await createMaintenanceType({
        name: newTypeName.trim(),
        category: newTypeCategory.trim() || "General",
        defaultIntervalKm: kmValue,
        defaultIntervalTime: timeValue,
        defaultIntervalUnit: newTypeTimeUnit,
        icon: newTypeIcon || "build-outline",
      });

      loadCategories();
      setAddModalVisible(false);
      // Limpiar formulario después de guardar exitosamente
      setNewTypeName("");
      setNewTypeCategory("");
      setNewTypeKm("");
      setNewTypeTime("");
      setNewTypeTimeUnit("months");
      setNewTypeIcon("");
      setEditingIconFor(null); // Limpiar estado de edición de icono
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
    setNewTypeTime("");
    setNewTypeTimeUnit("months");
    setNewTypeIcon("");
    setEditingIconFor(null); // Limpiar estado de edición de icono
    setAddError(""); // Limpiar error al cancelar
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
        {/* Header con título e ícono de ayuda */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tipos de Mantenimiento
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
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
              size={iconSize.md}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          onDragEnd={handleDragEnd}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Botón flotante para agregar */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddType}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={iconSize.lg} color="#fff" />
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
                  <Ionicons
                    name="close"
                    size={iconSize.md}
                    color={colors.text}
                  />
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
                        size={iconSize.md}
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
                        size={iconSize.sm}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputRow}>
                    <View
                      style={[
                        styles.inputGroup,
                        { flex: 1, marginRight: ms(8) },
                      ]}
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
                      style={[
                        styles.inputGroup,
                        { flex: 1, marginLeft: ms(8) },
                      ]}
                    >
                      <Text style={[styles.inputLabel, { color: colors.text }]}>
                        Intervalo de tiempo
                      </Text>
                      <View style={styles.unitSelector}>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            editTimeUnit === "days" && {
                              backgroundColor: colors.primary,
                            },
                            { borderColor: colors.border },
                          ]}
                          onPress={() => setEditTimeUnit("days")}
                        >
                          <Text
                            style={[
                              styles.unitButtonText,
                              {
                                color:
                                  editTimeUnit === "days"
                                    ? "#fff"
                                    : colors.text,
                              },
                            ]}
                          >
                            Días
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            editTimeUnit === "months" && {
                              backgroundColor: colors.primary,
                            },
                            { borderColor: colors.border },
                          ]}
                          onPress={() => setEditTimeUnit("months")}
                        >
                          <Text
                            style={[
                              styles.unitButtonText,
                              {
                                color:
                                  editTimeUnit === "months"
                                    ? "#fff"
                                    : colors.text,
                              },
                            ]}
                          >
                            Meses
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                        value={editTime}
                        onChangeText={setEditTime}
                        placeholder={editTimeUnit === "days" ? "" : ""}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {editError ? (
                    <View style={styles.errorContainer}>
                      <Ionicons
                        name="alert-circle"
                        size={iconSize.sm}
                        color="#e74c3c"
                      />
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
                  <Ionicons
                    name="close"
                    size={iconSize.md}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Nombre *
                  </Text>
                  <TextInput
                    ref={newTypeNameRef}
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
                    returnKeyType="next"
                    onSubmitEditing={() => newTypeCategoryRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Categoría
                  </Text>
                  <TextInput
                    ref={newTypeCategoryRef}
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
                    returnKeyType="next"
                    onSubmitEditing={() => newTypeKmRef.current?.focus()}
                    blurOnSubmit={false}
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
                      size={iconSize.md}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.iconSelectorText, { color: colors.text }]}
                    >
                      Seleccionar icono
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={iconSize.sm}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: ms(8) }]}
                  >
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Kilómetros
                    </Text>
                    <TextInput
                      ref={newTypeKmRef}
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
                      placeholder="Ingresa kilómetros"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onSubmitEditing={() => newTypeTimeRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>

                  <View
                    style={[styles.inputGroup, { flex: 1, marginLeft: ms(8) }]}
                  >
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      Intervalo de tiempo
                    </Text>
                    <View style={styles.unitSelector}>
                      <TouchableOpacity
                        style={[
                          styles.unitButton,
                          newTypeTimeUnit === "days" && {
                            backgroundColor: colors.primary,
                          },
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setNewTypeTimeUnit("days")}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            {
                              color:
                                newTypeTimeUnit === "days"
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                        >
                          Días
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.unitButton,
                          newTypeTimeUnit === "months" && {
                            backgroundColor: colors.primary,
                          },
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setNewTypeTimeUnit("months")}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            {
                              color:
                                newTypeTimeUnit === "months"
                                  ? "#fff"
                                  : colors.text,
                            },
                          ]}
                        >
                          Meses
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      ref={newTypeTimeRef}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={newTypeTime}
                      onChangeText={setNewTypeTime}
                      placeholder={newTypeTimeUnit === "days" ? "30" : "6"}
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {addError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={iconSize.sm}
                      color="#e74c3c"
                    />
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
                  <Ionicons
                    name="close"
                    size={iconSize.md}
                    color={colors.text}
                  />
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
                          (editingIconFor === "edit"
                            ? editIcon
                            : editingIconFor === "add"
                            ? newTypeIcon
                            : "") === item.name
                            ? colors.primary
                            : colors.border,
                        borderWidth:
                          (editingIconFor === "edit"
                            ? editIcon
                            : editingIconFor === "add"
                            ? newTypeIcon
                            : "") === item.name
                            ? ms(2)
                            : ms(1),
                      },
                    ]}
                    onPress={() => handleSelectIcon(item.name)}
                  >
                    <Ionicons
                      name={item.name}
                      size={ms(32)}
                      color={
                        (editingIconFor === "edit"
                          ? editIcon
                          : editingIconFor === "add"
                          ? newTypeIcon
                          : "") === item.name
                          ? colors.primary
                          : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.iconLabel,
                        {
                          color:
                            (editingIconFor === "edit"
                              ? editIcon
                              : editingIconFor === "add"
                              ? newTypeIcon
                              : "") === item.name
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
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
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
    fontSize: rf(16),
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
    fontSize: rf(18),
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
