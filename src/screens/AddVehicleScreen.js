import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { useResponsive } from "../hooks/useResponsive";

const AddVehicleScreen = ({ navigation, route }) => {
  const { addVehicle, updateVehicle } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const { scale, verticalScale, moderateScale } = useResponsive();
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
            y: y - 100,
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

  const responsiveStyles = {
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: scale(20),
    },
    photoSection: {
      alignItems: "center",
      marginBottom: verticalScale(24),
    },
    photoContainer: {
      width: scale(150),
      height: verticalScale(150),
      borderRadius: scale(12),
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
      marginTop: verticalScale(8),
      fontSize: moderateScale(14),
    },
    inputGroup: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      marginBottom: verticalScale(8),
    },
    input: {
      borderWidth: 1,
      borderRadius: scale(8),
      padding: scale(12),
      fontSize: moderateScale(16),
    },
    submitButton: {
      marginTop: verticalScale(16),
      marginBottom: verticalScale(32),
    },
  };

  return (
    <DialogComponent>
      <KeyboardAvoidingView
        style={[
          responsiveStyles.container,
          { backgroundColor: colors.background },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={responsiveStyles.scrollView}
          contentContainerStyle={responsiveStyles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Foto del vehículo */}
          <View style={responsiveStyles.photoSection}>
            <TouchableOpacity
              style={responsiveStyles.photoContainer}
              onPress={showImagePickerOptions}
            >
              {formData.photo ? (
                <Image
                  source={{ uri: formData.photo }}
                  style={responsiveStyles.photo}
                />
              ) : (
                <View
                  style={[
                    responsiveStyles.photoPlaceholder,
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
                    style={[
                      responsiveStyles.photoText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Agregar foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Campos del formulario */}
          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Nombre del vehículo *
            </Text>
            <TextInput
              ref={nameRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: Mi auto"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              onSubmitEditing={() => brandRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Marca
            </Text>
            <TextInput
              ref={brandRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: Toyota"
              placeholderTextColor={colors.textSecondary}
              value={formData.brand}
              onChangeText={(value) => handleInputChange("brand", value)}
              onSubmitEditing={() => modelRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Modelo
            </Text>
            <TextInput
              ref={modelRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: Corolla"
              placeholderTextColor={colors.textSecondary}
              value={formData.model}
              onChangeText={(value) => handleInputChange("model", value)}
              onSubmitEditing={() => yearRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Año
            </Text>
            <TextInput
              ref={yearRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: 2020"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={formData.year}
              onChangeText={(value) => handleInputChange("year", value)}
              onSubmitEditing={() => colorRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Color
            </Text>
            <TextInput
              ref={colorRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: Rojo"
              placeholderTextColor={colors.textSecondary}
              value={formData.color}
              onChangeText={(value) => handleInputChange("color", value)}
              onSubmitEditing={() => plateRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Placa
            </Text>
            <TextInput
              ref={plateRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Ej: ABC-123"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              value={formData.plate}
              onChangeText={(value) => handleInputChange("plate", value)}
              onSubmitEditing={() => vinRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              VIN
            </Text>
            <TextInput
              ref={vinRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Número de identificación del vehículo"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              value={formData.vin}
              onChangeText={(value) => handleInputChange("vin", value)}
              onSubmitEditing={() => kmRef.current?.focus()}
            />
          </View>

          <View style={responsiveStyles.inputGroup}>
            <Text style={[responsiveStyles.label, { color: colors.text }]}>
              Kilometraje actual
            </Text>
            <TextInput
              ref={kmRef}
              style={[
                responsiveStyles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={formData.currentKm}
              onChangeText={(value) => handleInputChange("currentKm", value)}
            />
          </View>

          <Button
            title={isEditing ? "Actualizar vehículo" : "Agregar vehículo"}
            onPress={handleSubmit}
            loading={loading}
            style={responsiveStyles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </DialogComponent>
  );
};

export default AddVehicleScreen;
