import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../components/common/Button";
import DatePicker from "../components/common/DatePicker";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";

const AddMaintenanceScreen = ({ navigation, route }) => {
  const { vehicleId, quickType, maintenanceData } = route.params || {};
  const { addMaintenance, updateMaintenance, getMaintenanceTypes, vehicles } =
    useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [maintenanceMode, setMaintenanceMode] = useState("date"); // "date" o "km"

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: new Date(),
    cost: "",
    provider: "",
    notes: "",
    photo: null,
  });

  const [formData, setFormData] = useState({
    vehicleId,
    type: quickType || "",
    category: "",
    date: new Date(),
    km: vehicle?.currentKm?.toString() || "",
    cost: "",
    provider: "",
    notes: "",
    photo: null,
    nextServiceKm: "",
    nextServiceDate: new Date(),
  });

  useEffect(() => {
    const types = getMaintenanceTypes();
    setMaintenanceTypes(types);

    // Si viene de acción rápida, pre-seleccionar el tipo
    if (quickType) {
      const matchedType = types.find((t) => t.name === quickType);
      if (matchedType) {
        handleTypeSelect(matchedType);
      }
    }
  }, [quickType]);

  useEffect(() => {
    if (maintenanceData) {
      console.log("Loading maintenance data for editing:", maintenanceData);

      // Convert date strings to Date objects with validation
      let dateValue = new Date();
      if (maintenanceData.date) {
        const parsedDate = new Date(maintenanceData.date);
        if (!isNaN(parsedDate.getTime())) {
          dateValue = parsedDate;
          console.log("Parsed date:", dateValue);
        }
      }

      let nextServiceDateValue = null;
      if (maintenanceData.nextServiceDate) {
        const parsedNextDate = new Date(maintenanceData.nextServiceDate);
        if (!isNaN(parsedNextDate.getTime())) {
          nextServiceDateValue = parsedNextDate;
          console.log("Parsed nextServiceDate:", nextServiceDateValue);
        }
      }

      const updatedFormData = {
        vehicleId: maintenanceData.vehicleId,
        type: maintenanceData.type || "",
        category: maintenanceData.category || "",
        date: dateValue,
        km: maintenanceData.km ? maintenanceData.km.toString() : "",
        cost: maintenanceData.cost ? maintenanceData.cost.toString() : "",
        provider: maintenanceData.provider || "",
        notes: maintenanceData.notes || "",
        photo: maintenanceData.photo || null,
        nextServiceKm: maintenanceData.nextServiceKm
          ? maintenanceData.nextServiceKm.toString()
          : "",
        nextServiceDate: nextServiceDateValue,
      };

      console.log("Setting form data:", updatedFormData);
      setFormData(updatedFormData);

      // Determinar el modo de mantenimiento basado en los datos existentes
      if (maintenanceData.nextServiceKm) {
        setMaintenanceMode("km");
      } else if (maintenanceData.nextServiceDate) {
        setMaintenanceMode("date");
      }

      // Show optional fields if any optional data exists
      if (
        maintenanceData.cost ||
        maintenanceData.provider ||
        maintenanceData.notes ||
        maintenanceData.photo
      ) {
        setShowOptionalFields(true);
      }
    }
  }, [maintenanceData]);

  const handleEdit = () => {
    setEditFormData({
      date: formData.date,
      cost: formData.cost,
      provider: formData.provider,
      notes: formData.notes,
      photo: formData.photo,
    });
    setEditModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      type: type.name,
      category: type.category,
      // Calcular próximo servicio automáticamente
      nextServiceKm: type.defaultIntervalKm
        ? (
            parseInt(prev.km || vehicle?.currentKm || 0) +
            type.defaultIntervalKm
          ).toString()
        : "",
    }));
  };

  const handleSaveEdit = () => {
    setFormData((prev) => ({
      ...prev,
      date: editFormData.date,
      cost: editFormData.cost,
      provider: editFormData.provider,
      notes: editFormData.notes,
      photo: editFormData.photo,
    }));
    setEditModalVisible(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showDialog({
        title: "Permiso denegado",
        message: "Necesitamos permiso para acceder a tus fotos",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange("photo", result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      showDialog({
        title: "Permiso denegado",
        message: "Necesitamos permiso para acceder a la cámara",
        type: "warning",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange("photo", result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    showDialog({
      title: "Agregar foto del recibo",
      message: "Elige una opción",
      type: "info",
      buttons: [
        {
          text: "Tomar foto",
          onPress: takePhoto,
        },
        {
          text: "Elegir de galería",
          onPress: pickImage,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
    });
  };

  const removePhoto = () => {
    showDialog({
      title: "Eliminar foto",
      message: "¿Estás seguro de eliminar la foto del recibo?",
      type: "confirm",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => handleInputChange("photo", null),
        },
      ],
    });
  };

  const validateForm = async () => {
    if (!formData.type.trim()) {
      showDialog({
        title: "Error",
        message: "Selecciona o ingresa el tipo de mantenimiento",
        type: "error",
      });
      return false;
    }

    // Validar si las fechas son iguales cuando el modo es por fecha
    if (maintenanceMode === "date" && formData.nextServiceDate) {
      const serviceDate = new Date(formData.date);
      const nextServiceDate = new Date(formData.nextServiceDate);

      // Comparar solo las fechas (sin hora)
      const serviceDateOnly = new Date(
        serviceDate.getFullYear(),
        serviceDate.getMonth(),
        serviceDate.getDate()
      );
      const nextServiceDateOnly = new Date(
        nextServiceDate.getFullYear(),
        nextServiceDate.getMonth(),
        nextServiceDate.getDate()
      );

      if (serviceDateOnly.getTime() === nextServiceDateOnly.getTime()) {
        const result = await showDialog({
          title: "Advertencia",
          message:
            "La fecha de servicio y la fecha del próximo servicio son iguales. ¿Deseas continuar de todas formas?",
          type: "confirm",
        });
        return result;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        date: formData.date.toISOString(),
        km: formData.km ? parseInt(formData.km) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        // Solo guardar el campo según el modo seleccionado
        nextServiceKm:
          maintenanceMode === "km" && formData.nextServiceKm
            ? parseInt(formData.nextServiceKm)
            : null,
        nextServiceDate:
          maintenanceMode === "date" && formData.nextServiceDate
            ? formData.nextServiceDate.toISOString()
            : null,
      };

      if (maintenanceData?.id) {
        // Editing existing maintenance
        await updateMaintenance(maintenanceData.id, submitData);
        showDialog({
          title: "Éxito",
          message: "Mantenimiento actualizado correctamente",
          type: "success",
        });
      } else {
        // Creating new maintenance
        await addMaintenance(submitData);
        showDialog({
          title: "Éxito",
          message: "Mantenimiento registrado correctamente",
          type: "success",
        });
      }
      navigation.goBack();
    } catch (error) {
      showDialog({
        title: "Error",
        message: "No se pudo registrar el mantenimiento",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {vehicle?.name}
          </Text>

          {/* Tipos de mantenimiento predefinidos */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tipo de mantenimiento
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typesScroll}
            >
              {maintenanceTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                    },
                    formData.type === type.name && {
                      backgroundColor: colors.primary,
                    },
                    maintenanceData?.id && { opacity: 0.5 },
                  ]}
                  onPress={() => !maintenanceData?.id && handleTypeSelect(type)}
                  disabled={!!maintenanceData?.id}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: colors.text },
                      formData.type === type.name && styles.typeChipTextActive,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* O escribir uno personalizado */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
                maintenanceData?.id && { opacity: 0.5 },
              ]}
              value={formData.type}
              onChangeText={(value) => handleInputChange("type", value)}
              placeholder="O escribe uno personalizado..."
              placeholderTextColor={colors.textSecondary}
              editable={!maintenanceData?.id}
            />
          </View>

          {/* Radio buttons para modo de mantenimiento */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              ¿Cómo deseas programar el mantenimiento?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMaintenanceMode("date")}
              >
                <Ionicons
                  name={
                    maintenanceMode === "date"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  Por fecha
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMaintenanceMode("km")}
              >
                <Ionicons
                  name={
                    maintenanceMode === "km"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  Por kilometraje
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mostrar campos según el modo seleccionado */}
          {maintenanceMode === "date" && (
            <>
              {/* Fecha del servicio */}
              <DatePicker
                key={`date-${
                  maintenanceData?.id || "new"
                }-${formData.date?.getTime()}`}
                label="Fecha del servicio"
                value={formData.date}
                onChange={(date) => handleInputChange("date", date)}
              />

              {/* Próxima fecha de servicio */}
              <View style={styles.inputGroup}>
                <DatePicker
                  key={`nextDate-${
                    maintenanceData?.id || "new"
                  }-${formData.nextServiceDate?.getTime()}`}
                  label="Próximo servicio (fecha)"
                  value={formData.nextServiceDate}
                  onChange={(date) =>
                    handleInputChange("nextServiceDate", date)
                  }
                  minimumDate={new Date()}
                />
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  Útil para servicios por tiempo (ej: cambio de aceite cada 6
                  meses)
                </Text>
              </View>
            </>
          )}

          {maintenanceMode === "km" && (
            <>
              {/* Kilometraje cuando se realizó */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Kilometraje cuando se realizó
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.km}
                  onChangeText={(value) => handleInputChange("km", value)}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {/* Próximo servicio km */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Próximo servicio (km)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.nextServiceKm}
                  onChangeText={(value) =>
                    handleInputChange("nextServiceKm", value)
                  }
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {/* Botón desplegable para campos opcionales - Oculto */}
          {/* 
          <TouchableOpacity
            style={[
              styles.optionalToggle,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowOptionalFields(!showOptionalFields)}
          >
            <Text
              style={[styles.optionalToggleText, { color: colors.primary }]}
            >
              Mostrar opciones
            </Text>
            <Ionicons
              name={showOptionalFields ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          */}

          {/* Campos opcionales desplegables */}
          {showOptionalFields && (
            <View style={styles.optionalFieldsContainer}>
              {/* Costo */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Costo
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.cost}
                  onChangeText={(value) => handleInputChange("cost", value)}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Proveedor/Taller */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Taller/Proveedor
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={formData.provider}
                  onChangeText={(value) => handleInputChange("provider", value)}
                  placeholder="Nombre del taller"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Notas */}
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
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange("notes", value)}
                  placeholder="Detalles adicionales..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Foto */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Foto del recibo
                </Text>
                {formData.photo ? (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: formData.photo }}
                      style={styles.photoPreview}
                    />
                    <View style={styles.photoActions}>
                      <Button
                        title="Cambiar"
                        onPress={showImagePickerOptions}
                        variant="outline"
                        icon="camera"
                        style={styles.photoButton}
                      />
                      <Button
                        title="Eliminar"
                        onPress={removePhoto}
                        variant="outline"
                        icon="trash-outline"
                        style={styles.photoButton}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    title="Agregar foto del recibo"
                    onPress={showImagePickerOptions}
                    variant="outline"
                    icon="camera"
                  />
                )}
              </View>
            </View>
          )}

          <Button
            title={
              maintenanceData?.id
                ? "Actualizar Mantenimiento"
                : "Guardar Mantenimiento"
            }
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit Modal */}
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

            <ScrollView style={styles.editModalScroll}>
              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Fecha
                </Text>
                <DatePicker
                  key={`modal-date-${editFormData.date?.getTime()}`}
                  label="Fecha"
                  value={editFormData.date}
                  onChange={(date) =>
                    setEditFormData((prev) => ({ ...prev, date }))
                  }
                />
              </View>

              {/* Cost */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Costo
                </Text>
                <TextInput
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
                />
              </View>

              {/* Provider */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Taller/Proveedor
                </Text>
                <TextInput
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
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Notas
                </Text>
                <TextInput
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
                />
              </View>

              {/* Photo */}
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
                      const result = await ImagePicker.launchImageLibraryAsync({
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
            </ScrollView>

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
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  typesScroll: {
    marginBottom: 12,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 14,
  },
  typeChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
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
    minHeight: 100,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    marginLeft: 6,
  },
  photoContainer: {
    gap: 12,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  optionalToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionalToggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionalFieldsContainer: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  editIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  editIconText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
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

export default AddMaintenanceScreen;
