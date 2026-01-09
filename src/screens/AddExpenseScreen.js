import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRef, useState } from "react";
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
import { formatDate } from "../utils/dateUtils";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const AddExpenseScreen = ({ route, navigation }) => {
  const { vehicleId, expense } = route.params || {};
  const { colors } = useTheme();
  const { addExpense, updateExpense, vehicles } = useApp();
  const isEditing = !!expense;

  const vehicle = vehicles.find((v) => v.id === vehicleId);

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

  // Referencias para navegación entre campos
  const descriptionRef = useRef(null);
  const costRef = useRef(null);
  const notesRef = useRef(null);
  const scrollViewRef = useRef(null);

  const scrollToEnd = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

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
        await addExpense(expenseData);
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
      <ScrollView ref={scrollViewRef} style={styles.content}>
        {/* Descripción */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Descripción *
          </Text>
          <TextInput
            ref={descriptionRef}
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
            returnKeyType="next"
            onSubmitEditing={() => costRef.current?.focus()}
            blurOnSubmit={false}
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
              size={iconSize.sm}
              color={colors.primary}
            />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(date)}
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
          <TextInput
            ref={costRef}
            style={[
              styles.input,
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
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
            onFocus={() => scrollToEnd()}
            blurOnSubmit={false}
          />
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
          <TextInput
            ref={notesRef}
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
            returnKeyType="done"
          />
        </View>

        {/* Botón Guardar */}
        <Button
          title={isEditing ? "Actualizar Gasto" : "Guardar Gasto"}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />
        <View style={{ height: 100 }} />
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
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  dateText: {
    fontSize: rf(16),
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: rf(20),
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  costInput: {
    flex: 1,
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
    minHeight: vs(100),
  },
  saveButton: {
    marginTop: spacing.xs,
    marginBottom: vs(40),
  },
});

export default AddExpenseScreen;
