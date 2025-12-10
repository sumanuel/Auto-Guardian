import { Ionicons } from "@expo/vector-icons";
import { nextDay } from "date-fns";
import * as Notifications from "expo-notifications";
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
import { useTheme } from "../context/ThemeContext";
import {
  deleteNotification,
  getNotifications,
  initDatabase,
  insertNotification,
} from "../database/notifications";

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);

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
    };
    setup();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNotification = async () => {
    if (!title || !body || !time || selectedDays.length === 0) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    try {
      const id = await insertNotification(
        title,
        body,
        selectedDays.join(","),
        time
      );

      // Schedule the notification
      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      const nextDates = selectedDays.map((day) => {
        const dayNum = parseInt(day);
        const next = nextDay(now, dayNum);
        next.setHours(hours, minutes, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 7);
        return next;
      });
      const nextDate = nextDates.sort((a, b) => a - b)[0];

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: nextDate,
      });

      setModalVisible(false);
      setTitle("");
      setBody("");
      setTime("");
      setSelectedDays([]);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
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
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.textTertiary, color: colors.text },
              ]}
              placeholder="Hora (HH:MM)"
              placeholderTextColor={colors.textSecondary}
              value={time}
              onChangeText={setTime}
            />
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
