import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/common/Button";
import DatePicker from "../components/common/DatePicker";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";

const AddRepairScreen = ({ route, navigation }) => {
  const { vehicleId, repair } = route.params || {};
  const { colors } = useTheme();
  const { addRepair, updateRepair, vehicles } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const isEditing = !!repair;

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const [formData, setFormData] = useState({
    description: repair?.description || "",
    date: repair?.date ? new Date(repair.date) : new Date(),
    cost: repair?.cost ? repair.cost.toString() : "",
    workshop: repair?.workshop || "",
    notes: repair?.notes || "",
    photo: repair?.photo || null,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      title: "Agregar foto",
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
      message: "¿Estás seguro de eliminar la foto?",
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
    if (!formData.description.trim()) {
      showDialog({
        title: "Error",
        message: "Por favor ingresa una descripción de la reparación",
        type: "error",
      });
      return false;
    }

    if (!formData.cost || isNaN(parseFloat(formData.cost))) {
      showDialog({
        title: "Error",
        message: "Por favor ingresa un costo válido",
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
      const repairData = {
        vehicleId,
        description: formData.description.trim(),
        date: formData.date.toISOString(),
        cost: parseFloat(formData.cost),
        workshop: formData.workshop.trim() || null,
        notes: formData.notes.trim() || null,
        photo: formData.photo || null,
      };

      if (isEditing) {
        await updateRepair(repair.id, repairData);
        showDialog({
          title: "Éxito",
          message: "Reparación actualizada correctamente",
          type: "success",
        });
      } else {
        await addRepair(repairData);
        showDialog({
          title: "Éxito",
          message: "Reparación registrada correctamente",
          type: "success",
        });
      }

      navigation.goBack();
    } catch (error) {
      showDialog({
        title: "Error",
        message: "No se pudo guardar la reparación",
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

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descripción de la reparación *
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
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="Ej: Cambio de embrague, reparación de caja..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          {/* Fecha */}
          <DatePicker
            label="Fecha de la reparación"
            value={formData.date}
            onChange={(date) => handleInputChange("date", date)}
          />

          {/* Costo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Costo *</Text>
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

          {/* Taller */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Taller</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.workshop}
              onChangeText={(value) => handleInputChange("workshop", value)}
              placeholder="Nombre del taller"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Notas */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
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
              placeholder="Detalles adicionales de la reparación..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Foto */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Foto de la factura
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
                title="Agregar foto de la factura"
                onPress={showImagePickerOptions}
                variant="outline"
                icon="camera"
              />
            )}
          </View>

          <Button
            title={isEditing ? "Actualizar Reparación" : "Guardar Reparación"}
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
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default AddRepairScreen;
