import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Alert,
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
import { createExpense, updateExpense } from "../services/expenseService";

const AddExpenseScreen = ({ route, navigation }) => {
  const { vehicleId, expense } = route.params || {};
  const { colors } = useTheme();
  const { loadVehicles } = useApp();
  const isEditing = !!expense;

  const [description, setDescription] = useState(expense?.description || "");
  const [date, setDate] = useState(
    expense?.date ? new Date(expense.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cost, setCost] = useState(
    expense?.cost ? expense.cost.toString() : ""
  );
  const [notes, setNotes] = useState(expense?.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Por favor ingresa una descripción");
      return;
    }

    if (!cost || isNaN(parseFloat(cost))) {
      Alert.alert("Error", "Por favor ingresa un costo válido");
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        vehicleId,
        description: description.trim(),
        category: null,
        date: date.toISOString().split("T")[0],
        cost: parseFloat(cost),
        notes: notes.trim() || null,
        photo: null,
      };

      if (isEditing) {
        await updateExpense(expense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      // Recargar datos
      if (loadVehicles) {
        await loadVehicles();
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error guardando gasto:", error);
      Alert.alert("Error", "No se pudo guardar el gasto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content}>
        {/* Descripción */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Descripción *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Gasolina, Lavado, Peaje, etc."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Fecha */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha *</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Costo */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Costo *</Text>
          <View style={styles.costContainer}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>
              $
            </Text>
            <TextInput
              style={[
                styles.costInput,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Información adicional..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Guardar */}
        <Button
          title={isEditing ? "Actualizar Gasto" : "Guardar Gasto"}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: 24,
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 40,
  },
});

export default AddExpenseScreen;
