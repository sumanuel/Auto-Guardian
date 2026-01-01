import { Ionicons } from "@expo/vector-icons";
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
      loadAlertNotificationSettings();
    };
    setup();
  }, []);

  const loadAlertNotificationSettings = async () => {
    try {
      // Aquí podrías cargar desde AsyncStorage si guardas la preferencia
      // Por ahora, asumimos que están activas si las notificaciones generales están activas
      setAlertNotificationsEnabled(notificationsEnabled);
    } catch (error) {
      console.error("Error cargando configuración de alertas:", error);
    }
  };

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
            "Notificaciones de alertas activadas. Recibirás recordatorios los lunes y miércoles a las 9:00 AM cuando tengas alertas pendientes."
          );
        } else {
          Alert.alert(
            "Información",
            "Notificaciones de alertas activadas, pero actualmente no tienes alertas pendientes."
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
        "No se pudo cambiar la configuración de notificaciones."
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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
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
        <Ionicons name="trash-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        Notificaciones Programadas
      </Text>

      {/* Sección de notificaciones de alertas */}
      <View
        style={[
          styles.alertSection,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.alertSectionHeader}>
          <Ionicons name="notifications" size={24} color={colors.primary} />
          <Text style={[styles.alertSectionTitle, { color: colors.text }]}>
            Notificaciones de Alertas
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
                ? colors.primary
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
            size={20}
            color={alertNotificationsEnabled ? "#fff" : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No hay notificaciones
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
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
                        ? colors.primary
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
                style={[styles.button, { backgroundColor: colors.primary }]}
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    fontSize: 14,
    marginVertical: 5,
  },
  details: {
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  alertSection: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  alertSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  alertSectionDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  alertToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  alertToggleText: {
    fontSize: 16,
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
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  daysLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
});

export default NotificationsScreen;
