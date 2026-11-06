import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
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
  createMaintenanceType,
  getMaintenanceTypeByName,
  updateMaintenanceType,
} from "../services/maintenanceService";
import {
  borderRadius,
  iconSize,
  ms,
  rf,
  s,
  spacing,
} from "../utils/responsive";

const AVAILABLE_ICONS = [
  { name: "water-outline", label: "Líquidos" },
  { name: "flash-outline", label: "Eléctrico" },
  { name: "build-outline", label: "Herramientas" },
  { name: "construct-outline", label: "Construcción" },
  { name: "cog-outline", label: "Engranaje" },
  { name: "hardware-chip-outline", label: "Componente" },
  { name: "funnel-outline", label: "Filtro" },
  { name: "ellipse-outline", label: "Neumático" },
  { name: "refresh-outline", label: "Rotación" },
  { name: "options-outline", label: "Ajuste" },
  { name: "battery-charging-outline", label: "Batería" },
  { name: "git-branch-outline", label: "Correa" },
  { name: "search-outline", label: "Inspección" },
  { name: "disc-outline", label: "Frenos" },
  { name: "git-compare-outline", label: "Suspensión" },
  { name: "thermometer-outline", label: "Temperatura" },
  { name: "speedometer-outline", label: "Velocímetro" },
  { name: "shield-outline", label: "Protección" },
  { name: "checkmark-circle-outline", label: "Verificado" },
];

// Crear o editar un tipo de mantenimiento (nombre, categoría, icono e intervalos)
const MaintenanceTypeFormScreen = ({ route, navigation }) => {
  const type = route.params?.type;
  const isEditing = !!type;
  const { colors } = useTheme();

  const [name, setName] = useState(type?.name || "");
  const [category, setCategory] = useState(type?.category || "");
  const [icon, setIcon] = useState(type?.icon || "build-outline");
  const [km, setKm] = useState(type?.defaultIntervalKm?.toString() || "");
  const [time, setTime] = useState(
    (type?.defaultIntervalTime || type?.defaultIntervalMonths)?.toString() ||
      "",
  );
  const [timeUnit, setTimeUnit] = useState(
    type?.defaultIntervalUnit || "months",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryRef = useRef(null);
  const kmRef = useRef(null);
  const timeRef = useRef(null);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!isEditing && getMaintenanceTypeByName(trimmedName)) {
      setError("Ya existe un tipo de mantenimiento con este nombre");
      return;
    }

    setError("");
    setSaving(true);
    const data = {
      name: trimmedName,
      category: category.trim() || "General",
      defaultIntervalKm: km.trim() ? parseInt(km, 10) : null,
      defaultIntervalTime: time.trim() ? parseInt(time, 10) : null,
      defaultIntervalUnit: timeUnit,
      icon: icon || "build-outline",
    };

    try {
      if (isEditing) {
        await updateMaintenanceType(type.id, data);
      } else {
        await createMaintenanceType(data);
      }
      navigation.goBack();
    } catch (err) {
      console.error("Error guardando tipo de mantenimiento:", err);
      setError(
        isEditing
          ? "No se pudo actualizar el tipo de mantenimiento"
          : "No se pudo crear el tipo de mantenimiento",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderColor: colors.border,
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
          <Text style={[styles.label, { color: colors.text }]}>Nombre *</Text>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Cambio de aceite"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            onSubmitEditing={() => categoryRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Categoría</Text>
          <TextInput
            ref={categoryRef}
            style={inputStyle}
            value={category}
            onChangeText={setCategory}
            placeholder="Ej: Motor"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            onSubmitEditing={() => kmRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Icono</Text>
          <View style={styles.iconGrid}>
            {AVAILABLE_ICONS.map((item) => {
              const selected = icon === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? ms(2) : ms(1),
                    },
                  ]}
                  onPress={() => setIcon(item.name)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={item.label}
                >
                  <Ionicons
                    name={item.name}
                    size={ms(28)}
                    color={selected ? colors.primary : colors.text}
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      {
                        color: selected ? colors.primary : colors.textSecondary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>Kilómetros</Text>
          <TextInput
            ref={kmRef}
            style={inputStyle}
            value={km}
            onChangeText={setKm}
            placeholder="5000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => timeRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>
            Intervalo de tiempo
          </Text>
          <View style={styles.unitSelector}>
            {[
              { value: "days", label: "Días" },
              { value: "months", label: "Meses" },
            ].map((unit) => {
              const selected = timeUnit === unit.value;
              return (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    { borderColor: colors.border },
                    selected && { backgroundColor: colors.primaryDark },
                  ]}
                  onPress={() => setTimeUnit(unit.value)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      { color: selected ? "#fff" : colors.text },
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            ref={timeRef}
            style={inputStyle}
            value={time}
            onChangeText={setTime}
            placeholder={timeUnit === "days" ? "30" : "6"}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={iconSize.sm} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          title={isEditing ? "Guardar cambios" : "Crear tipo"}
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
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  iconOption: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  iconLabel: { fontSize: rf(11), marginTop: spacing.xxs },
  unitSelector: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  unitButton: {
    flex: 1,
    borderWidth: s(1),
    borderRadius: borderRadius.xs,
    padding: spacing.xs,
    alignItems: "center",
  },
  unitButtonText: { fontSize: rf(16), fontWeight: "500" },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee",
    borderColor: "#e74c3c",
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: rf(14),
    marginLeft: spacing.xs,
    flex: 1,
  },
  saveButton: { marginTop: spacing.xs },
});

export default MaintenanceTypeFormScreen;
