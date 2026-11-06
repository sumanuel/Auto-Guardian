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
import { useTheme } from "../context/ThemeContext";
import {
  getAllNotifications,
  insertNotification,
} from "../database/notifications";
import { scheduleAllNotifications } from "../services/notificationService";
import { borderRadius, hs, rf, s, spacing, vs } from "../utils/responsive";

const DAYS_OF_WEEK = [
  { key: "1", label: "Lun" },
  { key: "2", label: "Mar" },
  { key: "3", label: "Mié" },
  { key: "4", label: "Jue" },
  { key: "5", label: "Vie" },
  { key: "6", label: "Sáb" },
  { key: "0", label: "Dom" },
];

// Agregar una notificación programada (título, mensaje, hora y días)
const NotificationFormScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    if (!title || !body || selectedDays.length === 0) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    const time = `${selectedHour}:${selectedMinute.toString().padStart(2, "0")}`;
    setSaving(true);
    try {
      await insertNotification(title, body, selectedDays.join(","), time);
      // Reprogramar todas las notificaciones
      await scheduleAllNotifications(getAllNotifications);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la notificación");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Título</Text>
          <TextInput
            style={inputStyle}
            placeholder="Título"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Mensaje</Text>
          <TextInput
            style={[...inputStyle, styles.textArea]}
            placeholder="Cuerpo"
            placeholderTextColor={colors.textSecondary}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Hora</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Hora (1-24)
              </Text>
              <TextInput
                style={inputStyle}
                value={selectedHour.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value, 10);
                  if (!isNaN(num) && num >= 1 && num <= 24) {
                    setSelectedHour(num);
                  } else if (value === "") {
                    setSelectedHour(12);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="12"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.timeField}>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Minuto (0-59)
              </Text>
              <TextInput
                style={inputStyle}
                value={selectedMinute.toString().padStart(2, "0")}
                onChangeText={(value) => {
                  const num = parseInt(value, 10);
                  if (!isNaN(num) && num >= 0 && num <= 59) {
                    setSelectedMinute(num);
                  } else if (value === "") {
                    setSelectedMinute(0);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>
            Días de la semana
          </Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => {
              const selected = selectedDays.includes(day.key);
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: selected
                        ? colors.primaryDark
                        : colors.cardBackground,
                      borderColor: selected
                        ? colors.primaryDark
                        : colors.border,
                    },
                  ]}
                  onPress={() => toggleDay(day.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <Text style={{ color: selected ? "#fff" : colors.text }}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title="Agregar notificación"
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },
  group: { marginBottom: spacing.lg },
  label: { fontSize: rf(14), fontWeight: "600", marginBottom: spacing.xs },
  hint: { fontSize: rf(12), marginBottom: spacing.xxs },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: { minHeight: vs(80) },
  timeRow: { flexDirection: "row", gap: spacing.md },
  timeField: { flex: 1 },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  dayButton: {
    minWidth: hs(46),
    paddingVertical: vs(10),
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: s(1),
    alignItems: "center",
  },
  saveButton: { marginTop: spacing.xs },
});

export default NotificationFormScreen;
