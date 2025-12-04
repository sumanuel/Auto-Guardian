import { Ionicons } from "@expo/vector-icons";
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
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";

const AddVehicleScreen = ({ navigation, route }) => {
  const { addVehicle, updateVehicle } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const isEditing = route.params?.vehicle != null;
  const vehicleToEdit = route.params?.vehicle;

  const [formData, setFormData] = useState({
    name: vehicleToEdit?.name || "",
    brand: vehicleToEdit?.brand || "",
    model: vehicleToEdit?.model || "",
    year: vehicleToEdit?.year?.toString() || "",
    color: vehicleToEdit?.color || "",
    plate: vehicleToEdit?.plate || "",
    vin: vehicleToEdit?.vin || "",
    currentKm: vehicleToEdit?.currentKm?.toString() || "0",
    photo: vehicleToEdit?.photo || null,
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleInputChange("photo", result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    showDialog({
      title: "Seleccionar foto",
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      showDialog({
        title: "Error",
        message: "El nombre del vehículo es requerido",
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
      const vehicleData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        currentKm: parseInt(formData.currentKm) || 0,
      };

      if (isEditing) {
        await updateVehicle(vehicleToEdit.id, vehicleData);
        showDialog({
          title: "Éxito",
          message: "Vehículo actualizado correctamente",
          type: "success",
        });
      } else {
        await addVehicle(vehicleData);
        showDialog({
          title: "Éxito",
          message: "Vehículo agregado correctamente",
          type: "success",
        });
      }

      navigation.goBack();
    } catch (error) {
      showDialog({
        title: "Error",
        message: "No se pudo guardar el vehículo",
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
          {/* Foto del vehículo */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={showImagePickerOptions}
            >
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photo} />
              ) : (
                <View
                  style={[
                    styles.photoPlaceholder,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="camera"
                    size={40}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.photoText, { color: colors.textSecondary }]}
                  >
                    Agregar foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Nombre del vehículo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nombre del vehículo *
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
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Ej: Mi auto, Auto familiar..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Marca */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Marca</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.brand}
              onChangeText={(value) => handleInputChange("brand", value)}
              placeholder="Toyota, Honda, Ford..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Modelo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Modelo</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.model}
              onChangeText={(value) => handleInputChange("model", value)}
              placeholder="Corolla, Civic, F-150..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Año */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Año</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.year}
              onChangeText={(value) => handleInputChange("year", value)}
              placeholder="2020"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          {/* Color */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.color}
              onChangeText={(value) => handleInputChange("color", value)}
              placeholder="Blanco, Negro, Rojo..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Placa */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Placa</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.plate}
              onChangeText={(value) =>
                handleInputChange("plate", value.toUpperCase())
              }
              placeholder="ABC-123"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          {/* VIN */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              VIN (Número de serie)
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
              value={formData.vin}
              onChangeText={(value) =>
                handleInputChange("vin", value.toUpperCase())
              }
              placeholder="1HGBH41JXMN109186"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          {/* Kilometraje actual */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Kilometraje actual
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
              value={formData.currentKm}
              onChangeText={(value) => handleInputChange("currentKm", value)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <Button
            title={isEditing ? "Actualizar Vehículo" : "Guardar Vehículo"}
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
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  photoText: {
    marginTop: 8,
    fontSize: 14,
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
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default AddVehicleScreen;
