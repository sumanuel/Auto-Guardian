import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/common/Button";
import DatePicker from "../components/common/DatePicker";
import ItemsDetail from "../components/common/ItemsDetail";
import KmField from "../components/common/KmField";
import { useApp } from "../context/AppContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTheme } from "../context/ThemeContext";
import { getCurrencyDecimals, moneyPlaceholder } from "../utils/currencyConfig";
import {
  fromStoredItems,
  itemsTotal,
  serializeItems,
} from "../utils/itemsUtils";
import { checkKmUpdate, kmErrorMessage } from "../utils/kmUtils";
import { borderRadius, rf, s, spacing, vs } from "../utils/responsive";

// Edición de un mantenimiento ya realizado (fecha, costo, ítems, kilometraje, taller y notas)
const EditMaintenanceScreen = ({ route, navigation }) => {
  const { maintenance } = route.params;
  const { colors } = useTheme();
  const { updateMaintenance, updateVehicleKilometers, vehicles } = useApp();
  const { currencySymbol } = useAppSettings();

  const vehicle = vehicles.find((v) => v.id === maintenance.vehicleId);
  const vehicleMeta = [vehicle?.brand, vehicle?.model, vehicle?.year]
    .filter(Boolean)
    .join(" • ");

  const initialDate = (() => {
    const parsed = maintenance.completedAt
      ? new Date(maintenance.completedAt)
      : null;
    return parsed && !isNaN(parsed.getTime()) ? parsed : new Date();
  })();

  const [date, setDate] = useState(initialDate);
  const [cost, setCost] = useState(
    maintenance.cost ? maintenance.cost.toString() : "",
  );
  const [items, setItems] = useState(() => fromStoredItems(maintenance.items));
  const [km, setKm] = useState(
    vehicle?.currentKm != null ? String(vehicle.currentKm) : "",
  );
  const [provider, setProvider] = useState(maintenance.provider || "");
  const [notes, setNotes] = useState(maintenance.notes || "");
  const [loading, setLoading] = useState(false);
  const hasItems = items.length > 0;
  const itemsCost = itemsTotal(items);

  const costRef = useRef(null);
  const kmRef = useRef(null);
  const providerRef = useRef(null);
  const notesRef = useRef(null);
  const scrollViewRef = useRef(null);

  const scrollToEnd = () =>
    scrollViewRef.current?.scrollToEnd({ animated: true });

  const handleSave = async () => {
    const kmCheck = checkKmUpdate(km, vehicle?.currentKm);
    const kmError = kmErrorMessage(kmCheck, vehicle?.currentKm);
    if (kmError) {
      Alert.alert("Error", kmError);
      return;
    }

    const finalCost = hasItems ? itemsCost : cost ? parseFloat(cost) : null;
    if (!hasItems && cost && isNaN(finalCost)) {
      Alert.alert("Error", "Por favor ingresa un costo válido");
      return;
    }

    setLoading(true);
    try {
      await updateMaintenance(maintenance.id, {
        ...maintenance,
        completedAt: date.toISOString(),
        cost: finalCost,
        provider: provider || null,
        notes: notes || null,
        photo: maintenance.photo || null,
        items: serializeItems(items),
      });
      if (kmCheck.status === "update") {
        await updateVehicleKilometers(maintenance.vehicleId, kmCheck.km);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      Alert.alert("Error", "No se pudieron actualizar los datos.");
    } finally {
      setLoading(false);
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
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroMediaRow}>
            {vehicle?.photo ? (
              <Image
                source={{ uri: vehicle.photo }}
                style={styles.vehicleImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="construct-outline"
                  size={s(40)}
                  color="#D6E7FF"
                />
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.headerEyebrow}>Editar mantenimiento</Text>
              <Text style={styles.headerTitle}>{maintenance.type}</Text>
              <Text style={styles.headerSubtitle}>
                {[vehicle?.name, vehicleMeta].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <DatePicker
          label="Fecha de realización"
          value={date}
          onChange={setDate}
          maximumDate={new Date()}
        />

        <ItemsDetail
          items={items}
          onChange={setItems}
          currencySymbol={currencySymbol || "$"}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Costo{hasItems ? " (calculado del detalle)" : ""}
          </Text>
          <TextInput
            ref={costRef}
            style={inputStyle}
            value={hasItems ? itemsCost.toFixed(getCurrencyDecimals()) : cost}
            onChangeText={setCost}
            editable={!hasItems}
            placeholder={moneyPlaceholder()}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => kmRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <KmField
          inputRef={kmRef}
          value={km}
          onChangeText={setKm}
          currentKm={vehicle?.currentKm}
          onSubmitEditing={() => providerRef.current?.focus()}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Taller/Proveedor
          </Text>
          <TextInput
            ref={providerRef}
            style={inputStyle}
            value={provider}
            onChangeText={setProvider}
            placeholder="Nombre del taller"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Notas</Text>
          <TextInput
            ref={notesRef}
            style={[...inputStyle, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            onFocus={scrollToEnd}
            placeholder="Notas adicionales"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Button
          title="Guardar cambios"
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
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: vs(40) },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(18),
    paddingBottom: vs(18),
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  vehicleImage: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  headerInfo: { flex: 1 },
  headerEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.74)",
  },
  headerTitle: { fontSize: rf(22), fontWeight: "800", color: "#fff" },
  headerSubtitle: {
    fontSize: rf(13),
    marginTop: vs(4),
    color: "rgba(255,255,255,0.84)",
  },
  inputGroup: { marginBottom: spacing.xl },
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
  textArea: { minHeight: vs(100) },
  saveButton: { marginTop: spacing.xs },
});

export default EditMaintenanceScreen;
