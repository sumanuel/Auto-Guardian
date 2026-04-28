import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import {
  deleteNotification,
  getAllNotifications,
  getNotifications,
  initDatabase,
  insertNotification,
} from "../database/notifications";
import { scheduleAllNotifications } from "../services/notificationService";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { notificationsEnabled, getAlertSummary, updateAppBadge } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [alertNotificationsEnabled, setAlertNotificationsEnabled] =
    useState(false);

  const daysOfWeek = [
    { key: "1", label: "Lun" },
    { key: "2", label: "Mar" },
    { key: "3", label: "Mié" },
    { key: "4", label: "Jue" },
    { key: "5", label: "Vie" },
    { key: "6", label: "Sáb" },
    { key: "0", label: "Dom" },
  ];

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      loadNotifications();
      setAlertNotificationsEnabled(notificationsEnabled);
    };
    setup();
  }, [notificationsEnabled]);

  const toggleAlertNotifications = async () => {
    try {
      const newState = !alertNotificationsEnabled;
      setAlertNotificationsEnabled(newState);

      if (newState) {
        // Activar notificaciones de alertas
        const alertSummary = await getAlertSummary();
        if (alertSummary.totalAlerts > 0) {
          await scheduleAllNotifications(getAllNotifications);
          Alert.alert(
            "Éxito",
            "Notificaciones de alertas activadas. Recibirás recordatorios los lunes y miércoles a las 9:00 AM cuando tengas alertas pendientes.",
          );
        } else {
          Alert.alert(
            "Información",
            "Notificaciones de alertas activadas, pero actualmente no tienes alertas pendientes.",
          );
        }
      } else {
        // Desactivar notificaciones de alertas - cancelar las programadas
        Alert.alert("Éxito", "Notificaciones de alertas desactivadas.");
      }

      // Actualizar badge para reprogramar notificaciones
      await updateAppBadge();
    } catch (error) {
      console.error("Error cambiando configuración de alertas:", error);
      Alert.alert(
        "Error",
        "No se pudo cambiar la configuración de notificaciones.",
      );
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNotification = async () => {
    if (!title || !body || selectedDays.length === 0) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    const time = `${selectedHour}:${selectedMinute
      .toString()
      .padStart(2, "0")}`;
    try {
      await insertNotification(title, body, selectedDays.join(","), time);

      // Reprogramar todas las notificaciones
      await scheduleAllNotifications(getAllNotifications);

      setModalVisible(false);
      setTitle("");
      setBody("");
      setSelectedHour(12);
      setSelectedMinute(0);
      setSelectedDays([]);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      // Reprogramar todas las notificaciones después de eliminar
      await scheduleAllNotifications(getAllNotifications);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const renderNotification = ({ item }) => (
    <View
      style={[
        styles.notificationItem,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {item.body}
        </Text>
        <Text style={[styles.details, { color: colors.textTertiary }]}>
          Días:{" "}
          {item.days
            .split(",")
            .map((d) => daysOfWeek.find((day) => day.key === d)?.label)
            .join(", ")}{" "}
          | Hora: {item.time}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons
          name="trash-outline"
          size={iconSize.md}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroMediaRow}>
          <View style={[styles.iconBadge, styles.heroIconBadge]}>
            <Ionicons
              name="notifications-outline"
              size={iconSize.lg}
              color="#D6E7FF"
            />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroEyebrow}>Automatización de alertas</Text>
            <Text style={styles.heroTitle}>Notificaciones programadas</Text>
            <Text style={styles.heroSubtitle}>
              Administra avisos manuales y recordatorios automáticos para no
              perder eventos críticos.
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.screenContent}>
        <View
          style={[
            styles.alertSection,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.alertSectionHeader}>
            <Ionicons
              name="notifications"
              size={iconSize.md}
              color={colors.primary}
            />
            <Text style={[styles.alertSectionTitle, { color: colors.text }]}>
              Notificaciones de alertas
            </Text>
          </View>
          <Text
            style={[
              styles.alertSectionDescription,
              { color: colors.textSecondary },
            ]}
          >
            Recibe recordatorios semanales los lunes y miércoles a las 9:00 AM
            cuando tengas mantenimientos o documentos urgentes.
          </Text>
          <TouchableOpacity
            style={[
              styles.alertToggle,
              {
                backgroundColor: alertNotificationsEnabled
                  ? colors.primaryDark
                  : colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleAlertNotifications}
          >
            <Text
              style={[
                styles.alertToggleText,
                { color: alertNotificationsEnabled ? "#fff" : colors.text },
              ]}
            >
              {alertNotificationsEnabled ? "Activadas" : "Desactivadas"}
            </Text>
            <Ionicons
              name={
                alertNotificationsEnabled ? "checkmark-circle" : "close-circle"
              }
              size={iconSize.sm}
              color={alertNotificationsEnabled ? "#fff" : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              No hay notificaciones
            </Text>
          }
        />
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primaryDark }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={iconSize.md} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Agregar Notificación
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.textTertiary, color: colors.text },
              ]}
              placeholder="Título"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.textTertiary, color: colors.text },
              ]}
              placeholder="Cuerpo"
              placeholderTextColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
            />
            <Text style={[styles.timeLabel, { color: colors.text }]}>
              Hora:
            </Text>
            <View style={styles.timeContainer}>
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.text }]}>
                  Hora (1-24)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.textTertiary, color: colors.text },
                  ]}
                  value={selectedHour.toString()}
                  onChangeText={(value) => {
                    const num = parseInt(value);
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
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.text }]}>
                  Minuto (0-59)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.textTertiary, color: colors.text },
                  ]}
                  value={selectedMinute.toString().padStart(2, "0")}
                  onChangeText={(value) => {
                    const num = parseInt(value);
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
            <Text style={[styles.daysLabel, { color: colors.text }]}>
              Días de la semana:
            </Text>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: selectedDays.includes(day.key)
                        ? colors.primaryDark
                        : colors.cardBackground,
                      borderColor: colors.textTertiary,
                    },
                  ]}
                  onPress={() => toggleDay(day.key)}
                >
                  <Text
                    style={{
                      color: selectedDays.includes(day.key)
                        ? "white"
                        : colors.text,
                    }}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.disabled }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primaryDark }]}
                onPress={handleAddNotification}
              >
                <Text style={{ color: "white" }}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroIconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: borderRadius.lg,
  },
  heroInfo: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6E7FF",
    marginBottom: spacing.xxs,
  },
  heroTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
    marginBottom: spacing.xxs,
  },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "#D6E7FF",
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    fontSize: rf(24),
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: rf(17),
    fontWeight: "bold",
  },
  body: {
    fontSize: rf(14),
    marginVertical: spacing.xs,
  },
  details: {
    fontSize: rf(12),
  },
  empty: {
    textAlign: "center",
    marginTop: vs(50),
    fontSize: rf(14),
  },
  listContent: {
    paddingBottom: vs(100),
  },
  addButton: {
    position: "absolute",
    bottom: vs(20),
    right: hs(20),
    width: iconSize.xl,
    height: iconSize.xl,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  alertSection: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: s(1),
  },
  alertSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  alertSectionTitle: {
    fontSize: rf(17),
    fontWeight: "bold",
    marginLeft: spacing.sm,
  },
  alertSectionDescription: {
    fontSize: rf(14),
    marginBottom: spacing.md,
    lineHeight: rf(20),
  },
  alertToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: s(1),
  },
  alertToggleText: {
    fontSize: rf(14),
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  modalTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  timeLabel: {
    fontSize: rf(14),
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  pickerLabel: {
    fontSize: rf(14),
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  daysLabel: {
    fontSize: rf(14),
    marginBottom: spacing.sm,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  dayButton: {
    padding: spacing.sm,
    margin: spacing.xs,
    borderRadius: borderRadius.xs,
    borderWidth: s(1),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: spacing.sm,
    borderRadius: borderRadius.xs,
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: "center",
  },
});

export default NotificationsScreen;
