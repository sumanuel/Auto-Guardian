import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { COLORS } from "../data/constants";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/common/Button";
import DatePicker from "../components/common/DatePicker";
import { useDialog } from "../hooks/useDialog";

const AddMaintenanceScreen = ({ navigation, route }) => {
  const { vehicleId, quickType } = route.params;
  const { addMaintenance, getMaintenanceTypes, vehicles } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

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
    nextServiceDate: null,
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

    const result = await ImagePicker.launchImagePickerAsync({
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

  const validateForm = () => {
    if (!formData.type.trim()) {
      showDialog({
        title: "Error",
        message: "Selecciona o ingresa el tipo de mantenimiento",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const maintenanceData = {
        ...formData,
        date: formData.date.toISOString(),
        km: formData.km ? parseInt(formData.km) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        nextServiceKm: formData.nextServiceKm
          ? parseInt(formData.nextServiceKm)
          : null,
        nextServiceDate: formData.nextServiceDate
          ? formData.nextServiceDate.toISOString()
          : null,
      };

      await addMaintenance(maintenanceData);
      showDialog({
        title: "Éxito",
        message: "Mantenimiento registrado correctamente",
        type: "success",
      });
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
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
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
                  ]}
                  onPress={() => handleTypeSelect(type)}
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
              ]}
              value={formData.type}
              onChangeText={(value) => handleInputChange("type", value)}
              placeholder="O escribe uno personalizado..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Fecha del servicio */}
          <DatePicker
            label="Fecha del servicio"
            value={formData.date}
            onChange={(date) => handleInputChange("date", date)}
          />

          {/* Próxima fecha de servicio - justo debajo de la fecha actual */}
          <View style={styles.inputGroup}>
            <DatePicker
              label="Próximo servicio (fecha)"
              value={formData.nextServiceDate}
              onChange={(date) => handleInputChange("nextServiceDate", date)}
              minimumDate={new Date()}
            />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Útil para servicios por tiempo (ej: cambio de aceite cada 6 meses)
            </Text>
          </View>

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

          {/* Próximo servicio km - justo debajo del km actual */}
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

          {/* Botón desplegable para campos opcionales */}
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
            title="Guardar Mantenimiento"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
});

export default AddMaintenanceScreen;
