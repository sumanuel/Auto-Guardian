import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
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
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const AddVehicleScreen = ({ navigation, route }) => {
  const { addVehicle, updateVehicle } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const isEditing = route.params?.vehicle != null;
  const vehicleToEdit = route.params?.vehicle;

  // Referencias para los inputs
  const scrollViewRef = useRef(null);
  const nameRef = useRef(null);
  const brandRef = useRef(null);
  const modelRef = useRef(null);
  const yearRef = useRef(null);
  const colorRef = useRef(null);
  const plateRef = useRef(null);
  const vinRef = useRef(null);
  const kmRef = useRef(null);

  const scrollToInput = (inputRef) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: y - vs(100),
            animated: true,
          });
        },
        () => {}
      );
    }
  };

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
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                    size={iconSize.lg}
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
              ref={nameRef}
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
              returnKeyType="next"
              onFocus={() => scrollToInput(nameRef)}
              onSubmitEditing={() => brandRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Marca */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Marca</Text>
            <TextInput
              ref={brandRef}
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
              returnKeyType="next"
              onFocus={() => scrollToInput(brandRef)}
              onSubmitEditing={() => modelRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Modelo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Modelo</Text>
            <TextInput
              ref={modelRef}
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
              placeholder="Camry, Civic, Focus..."
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
              onFocus={() => scrollToInput(modelRef)}
              onSubmitEditing={() => yearRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Año */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Año</Text>
            <TextInput
              ref={yearRef}
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
              placeholder="2024"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              returnKeyType="next"
              onFocus={() => scrollToInput(yearRef)}
              onSubmitEditing={() => colorRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Color */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <TextInput
              ref={colorRef}
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
              returnKeyType="next"
              onFocus={() => scrollToInput(colorRef)}
              onSubmitEditing={() => plateRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Placa */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Placa</Text>
            <TextInput
              ref={plateRef}
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
              placeholder="ABC123"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              returnKeyType="next"
              onFocus={() => scrollToInput(plateRef)}
              onSubmitEditing={() => vinRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* VIN */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              VIN (Número de serie)
            </Text>
            <TextInput
              ref={vinRef}
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
              returnKeyType="next"
              onFocus={() => scrollToInput(vinRef)}
              onSubmitEditing={() => kmRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Kilometraje actual */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Kilometraje actual
            </Text>
            <TextInput
              ref={kmRef}
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
              returnKeyType="done"
              onFocus={() => scrollToInput(kmRef)}
              onSubmitEditing={handleSubmit}
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
    paddingHorizontal: hs(20),
    paddingVertical: vs(20),
  },
  photoSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  photoContainer: {
    width: s(150),
    height: s(150),
    borderRadius: borderRadius.md,
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
    borderWidth: s(2),
    borderStyle: "dashed",
  },
  photoText: {
    marginTop: spacing.sm,
    fontSize: rf(14),
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: rf(16),
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: vs(32),
  },
});

export default AddVehicleScreen;
