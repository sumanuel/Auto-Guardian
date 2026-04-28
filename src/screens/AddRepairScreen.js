import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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
import DatePicker from "../components/common/DatePicker";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { borderRadius, rf, s, spacing, vs } from "../utils/responsive";

const AddRepairScreen = ({ route, navigation }) => {
  const { vehicleId, repair } = route.params || {};
  const { colors } = useTheme();
  const { addRepair, updateRepair, vehicles } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const isEditing = !!repair;

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleMeta = [vehicle?.brand, vehicle?.model, vehicle?.year]
    .filter(Boolean)
    .join(" • ");

  const [formData, setFormData] = useState({
    description: repair?.description || "",
    date: repair?.date ? new Date(repair.date) : new Date(),
    cost: repair?.cost ? repair.cost.toString() : "",
    workshop: repair?.workshop || "",
    notes: repair?.notes || "",
    photo: repair?.photo || null,
  });

  const [loading, setLoading] = useState(false);

  // Referencias para navegación entre campos
  const descriptionRef = useRef(null);
  const costRef = useRef(null);
  const workshopRef = useRef(null);
  const notesRef = useRef(null);
  const scrollViewRef = useRef(null);

  const scrollToEnd = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

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
    } catch (_error) {
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
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <LinearGradient
              colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroMediaRow}>
                  {vehicle?.photo ? (
                    <Image
                      source={{ uri: vehicle.photo }}
                      style={styles.vehicleImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.imagePlaceholder,
                        styles.heroImagePlaceholder,
                      ]}
                    >
                      <Ionicons
                        name="build-outline"
                        size={s(40)}
                        color="#D6E7FF"
                      />
                    </View>
                  )}

                  <View style={styles.headerInfo}>
                    <Text style={styles.headerEyebrow}>
                      Registro de reparación
                    </Text>
                    <Text style={styles.headerTitle}>
                      {vehicle?.name || "Vehículo"}
                    </Text>
                    {!!vehicleMeta && (
                      <Text style={styles.headerSubtitle}>{vehicleMeta}</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() =>
                    showDialog({
                      title: "Registro de Reparación",
                      message:
                        "Registra averías, trabajos correctivos y costos asociados para mantener trazabilidad técnica y financiera del vehículo.",
                      type: "info",
                    })
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={vs(24)}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descripción de la reparación *
            </Text>
            <TextInput
              ref={descriptionRef}
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
              placeholder="Ej: Cambio de embrague, reparación..."
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
              onSubmitEditing={() => costRef.current?.focus()}
              blurOnSubmit={false}
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
              ref={costRef}
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
              returnKeyType="next"
              onSubmitEditing={() => workshopRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Taller */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Taller</Text>
            <TextInput
              ref={workshopRef}
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
              returnKeyType="next"
              onSubmitEditing={() => notesRef.current?.focus()}
              onFocus={() => scrollToEnd()}
              blurOnSubmit={false}
            />
          </View>

          {/* Notas */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
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
              placeholder="Detalles adicionales de la reparación..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
            />
          </View>

          {/* Foto - OCULTA */}
          {/* <View style={styles.inputGroup}>
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
          </View> */}

          <Button
            title={isEditing ? "Actualizar Reparación" : "Guardar Reparación"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
          <View style={{ height: 100 }} />
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
    padding: spacing.lg,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(18),
    paddingBottom: vs(18),
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
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroImagePlaceholder: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
  },
  vehicleImage: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
  },
  headerInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.74)",
  },
  headerTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: rf(13),
    marginTop: vs(4),
    color: "rgba(255,255,255,0.84)",
  },
  infoButton: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: rf(14),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: {
    minHeight: vs(100),
  },
  photoContainer: {
    gap: spacing.sm,
  },
  photoPreview: {
    width: "100%",
    height: vs(200),
    borderRadius: borderRadius.md,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: vs(32),
  },
});

export default AddRepairScreen;
