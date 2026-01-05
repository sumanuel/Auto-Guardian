import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
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
import { useResponsive } from "../hooks/useResponsive";
import { scheduleAllNotifications } from "../services/notificationService";

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { notificationsEnabled, getAlertSummary, updateAppBadge } = useApp();
  const { scale, verticalScale, moderateScale } = useResponsive();

  const responsiveStyles = getResponsiveStyles({
    scale,
    verticalScale,
    moderateScale,
  });
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
        responsiveStyles.notificationItem,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={responsiveStyles.notificationContent}>
        <Text style={[responsiveStyles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[responsiveStyles.body, { color: colors.textSecondary }]}>
          {item.body}
        </Text>
        <Text
          style={[responsiveStyles.details, { color: colors.textTertiary }]}
        >
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
    <View
      style={[
        responsiveStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[responsiveStyles.header, { color: colors.text }]}>
        Notificaciones Programadas
      </Text>

      {/* Sección de notificaciones de alertas */}
      <View
        style={[
          responsiveStyles.alertSection,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={responsiveStyles.alertSectionHeader}>
          <Ionicons name="notifications" size={24} color={colors.primary} />
          <Text
            style={[responsiveStyles.alertSectionTitle, { color: colors.text }]}
          >
            Notificaciones de Alertas
          </Text>
        </View>
        <Text
          style={[
            responsiveStyles.alertSectionDescription,
            { color: colors.textSecondary },
          ]}
        >
          Recibe recordatorios semanales los lunes y miércoles a las 9:00 AM
          cuando tengas mantenimientos o documentos urgentes.
        </Text>
        <TouchableOpacity
          style={[
            responsiveStyles.alertToggle,
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
              responsiveStyles.alertToggleText,
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
          <Text
            style={[responsiveStyles.empty, { color: colors.textSecondary }]}
          >
            No hay notificaciones
          </Text>
        }
      />
      <TouchableOpacity
        style={[
          responsiveStyles.addButton,
          { backgroundColor: colors.primary },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={responsiveStyles.modalContainer}>
          <View
            style={[
              responsiveStyles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[responsiveStyles.modalTitle, { color: colors.text }]}>
              Agregar Notificación
            </Text>
            <TextInput
              style={[
                responsiveStyles.input,
                { borderColor: colors.textTertiary, color: colors.text },
              ]}
              placeholder="Título"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[
                responsiveStyles.input,
                { borderColor: colors.textTertiary, color: colors.text },
              ]}
              placeholder="Cuerpo"
              placeholderTextColor={colors.textSecondary}
              value={body}
              onChangeText={setBody}
            />
            <Text style={[responsiveStyles.timeLabel, { color: colors.text }]}>
              Hora:
            </Text>
            <View style={responsiveStyles.timeContainer}>
              <View style={responsiveStyles.pickerContainer}>
                <Text
                  style={[responsiveStyles.pickerLabel, { color: colors.text }]}
                >
                  Hora (1-24)
                </Text>
                <TextInput
                  style={[
                    responsiveStyles.input,
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
              <View style={responsiveStyles.pickerContainer}>
                <Text
                  style={[responsiveStyles.pickerLabel, { color: colors.text }]}
                >
                  Minuto (0-59)
                </Text>
                <TextInput
                  style={[
                    responsiveStyles.input,
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
            <Text style={[responsiveStyles.daysLabel, { color: colors.text }]}>
              Días de la semana:
            </Text>
            <View style={responsiveStyles.daysContainer}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    responsiveStyles.dayButton,
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
            <View style={responsiveStyles.modalButtons}>
              <TouchableOpacity
                style={[
                  responsiveStyles.button,
                  { backgroundColor: colors.disabled },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  responsiveStyles.button,
                  { backgroundColor: colors.primary },
                ]}
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

function getResponsiveStyles({ scale, verticalScale, moderateScale }) {
  return {
    container: {
      flex: 1,
      padding: scale(20),
    },
    header: {
      fontSize: moderateScale(24),
      fontWeight: "bold",
      marginBottom: verticalScale(20),
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: scale(15),
      marginBottom: verticalScale(10),
      borderRadius: moderateScale(8),
    },
    notificationContent: {
      flex: 1,
    },
    title: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
    },
    body: {
      fontSize: moderateScale(14),
      marginVertical: verticalScale(5),
    },
    details: {
      fontSize: moderateScale(12),
    },
    empty: {
      textAlign: "center",
      marginTop: verticalScale(50),
      fontSize: moderateScale(16),
    },
    addButton: {
      position: "absolute",
      bottom: verticalScale(20),
      right: scale(20),
      width: scale(60),
      height: verticalScale(60),
      borderRadius: moderateScale(30),
      justifyContent: "center",
      alignItems: "center",
    },
    alertSection: {
      margin: scale(15),
      padding: scale(15),
      borderRadius: moderateScale(10),
      borderWidth: 1,
    },
    alertSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(10),
    },
    alertSectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
      marginLeft: scale(10),
    },
    alertSectionDescription: {
      fontSize: moderateScale(14),
      marginBottom: verticalScale(15),
      lineHeight: moderateScale(20),
    },
    alertToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: scale(12),
      borderRadius: moderateScale(8),
      borderWidth: 1,
    },
    alertToggleText: {
      fontSize: moderateScale(16),
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
      padding: scale(20),
      borderRadius: moderateScale(10),
    },
    modalTitle: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
      marginBottom: verticalScale(20),
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderRadius: moderateScale(5),
      padding: scale(10),
      marginBottom: verticalScale(15),
    },
    timeLabel: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(10),
    },
    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: verticalScale(15),
    },
    pickerContainer: {
      flex: 1,
      marginHorizontal: scale(5),
    },
    pickerLabel: {
      fontSize: moderateScale(14),
      marginBottom: verticalScale(5),
      textAlign: "center",
    },
    daysLabel: {
      fontSize: moderateScale(16),
      marginBottom: verticalScale(10),
    },
    daysContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: verticalScale(20),
    },
    dayButton: {
      padding: scale(10),
      margin: scale(5),
      borderRadius: moderateScale(5),
      borderWidth: 1,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    button: {
      padding: scale(10),
      borderRadius: moderateScale(5),
      flex: 1,
      marginHorizontal: scale(5),
      alignItems: "center",
    },
  };
}

export default NotificationsScreen;
