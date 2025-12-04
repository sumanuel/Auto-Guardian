import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useApp } from "../context/AppContext";
import { COLORS } from "../data/constants";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/common/Button";
import { useDialog } from "../hooks/useDialog";

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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  currentKmContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentKm: {
    fontSize: 28,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    marginTop: 16,
  },
});

export default UpdateKmScreen;
