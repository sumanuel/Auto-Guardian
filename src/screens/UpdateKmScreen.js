import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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

const UpdateKmScreen = ({ navigation, route }) => {
  const { vehicle } = route.params;
  const { updateVehicleKilometers } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [km, setKm] = useState(vehicle.currentKm.toString());
  const [loading, setLoading] = useState(false);
  const vehicleMeta = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

  const handleSubmit = async () => {
    const newKm = parseInt(km);

    if (isNaN(newKm) || newKm < 0) {
      showDialog({
        title: "Error",
        message: "Ingresa un kilometraje válido",
        type: "error",
      });
      return;
    }

    if (newKm < vehicle.currentKm) {
      showDialog({
        title: "Advertencia",
        message: "El nuevo kilometraje es menor al actual. ¿Deseas continuar?",
        type: "warning",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar", onPress: () => saveKm(newKm) },
        ],
      });
    } else {
      saveKm(newKm);
    }
  };

  const saveKm = async (newKm) => {
    setLoading(true);
    try {
      await updateVehicleKilometers(vehicle.id, newKm);
      showDialog({
        title: "Éxito",
        message: "Kilometraje actualizado",
        type: "success",
      });
      navigation.goBack();
    } catch (error) {
      showDialog({
        title: "Error",
        message: "No se pudo actualizar el kilometraje",
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
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <LinearGradient
              colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroMediaRow}>
                  {vehicle.photo ? (
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
                        name="speedometer-outline"
                        size={s(40)}
                        color="#D6E7FF"
                      />
                    </View>
                  )}

                  <View style={styles.headerInfo}>
                    <Text style={styles.headerEyebrow}>
                      Lectura de kilometraje
                    </Text>
                    <Text style={styles.headerTitle}>{vehicle.name}</Text>
                    {!!vehicleMeta && (
                      <Text style={styles.headerSubtitle}>{vehicleMeta}</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() =>
                    showDialog({
                      title: "Actualizar Kilometraje",
                      message:
                        "Registra el kilometraje actual del vehículo para mantener precisas las alertas y próximos servicios.",
                      type: "info",
                    })
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={iconSize.lg}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View
            style={[
              styles.currentKmContainer,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Kilometraje actual:
            </Text>
            <Text style={[styles.currentKm, { color: colors.primary }]}>
              {vehicle.currentKm.toLocaleString()} km
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Nuevo kilometraje:
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              value={km}
              onChangeText={setKm}
              keyboardType="numeric"
              placeholder="0"
              autoFocus
            />
          </View>

          <Button
            title="Actualizar"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: hs(20),
    paddingVertical: vs(20),
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -hs(20),
    marginTop: -vs(20),
    paddingHorizontal: hs(20),
    paddingTop: vs(18),
    paddingBottom: vs(18),
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: hs(12),
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleImage: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    marginRight: hs(12),
  },
  imagePlaceholder: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: hs(12),
  },
  heroImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
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
    color: "rgba(255,255,255,0.84)",
    marginTop: vs(4),
  },
  infoButton: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  currentKmContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: s(1),
    marginBottom: vs(24),
  },
  label: {
    fontSize: rf(14),
    marginBottom: vs(4),
  },
  currentKm: {
    fontSize: rf(28),
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: vs(24),
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: rf(24),
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default UpdateKmScreen;
