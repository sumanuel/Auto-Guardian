import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { ms, rf } from "../utils/responsive";

const UpdateKmScreen = ({ navigation, route }) => {
  const { vehicle } = route.params;
  const { updateVehicleKilometers } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [km, setKm] = useState(vehicle.currentKm.toString());
  const [loading, setLoading] = useState(false);

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
          <Text style={[styles.title, { color: colors.text }]}>
            Actualizar Kilometraje
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {vehicle.name}
          </Text>

          <View
            style={[
              styles.currentKmContainer,
              { backgroundColor: colors.cardBackground },
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
    padding: ms(20),
  },
  title: {
    fontSize: rf(24),
    fontWeight: "bold",
    marginBottom: ms(8),
  },
  subtitle: {
    fontSize: rf(16),
    marginBottom: ms(24),
  },
  currentKmContainer: {
    padding: ms(16),
    borderRadius: ms(8),
    marginBottom: ms(24),
  },
  label: {
    fontSize: rf(14),
    marginBottom: ms(4),
  },
  currentKm: {
    fontSize: rf(28),
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: ms(24),
  },
  input: {
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    fontSize: rf(24),
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    marginTop: ms(16),
  },
});

export default UpdateKmScreen;
