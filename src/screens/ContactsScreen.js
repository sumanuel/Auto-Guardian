import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";

const ContactsScreen = ({ navigation }) => {
  const { contacts, removeContact } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();

  const handleDeleteContact = async (contactId) => {
    try {
      await removeContact(contactId);
    } catch (error) {
      console.error("Error eliminando contacto:", error);
    }
  };

  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "No se puede realizar llamadas en este dispositivo"
        );
      }
    });
  };

  const handleSMS = (phoneNumber) => {
    const url = `sms:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se puede enviar SMS en este dispositivo");
      }
    });
  };

  const handleWhatsApp = (phoneNumber) => {
    const url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp no está instalado en este dispositivo");
      }
    });
  };

  const renderContactCard = ({ item }) => (
    <View
      style={[
        styles.contactCard,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
      ]}
    >
      <View
        style={[
          styles.cardHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.nameContainer}>
          <Ionicons name="person" size={20} color={colors.primary} />
          <View>
            <Text style={[styles.contactName, { color: colors.text }]}>
              {item.alias || item.nombre}
            </Text>
            {item.alias && (
              <Text
                style={[styles.contactAlias, { color: colors.textSecondary }]}
              >
                {item.nombre}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddContact", { contact: item })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              showDialog({
                title: "Eliminar contacto",
                message: `¿Estás seguro de que quieres eliminar a ${item.nombre}?`,
                onConfirm: () => handleDeleteContact(item.id),
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                type: "danger",
              })
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={colors.primary} />
          <Text style={[styles.contactDetail, { color: colors.primary }]}>
            {item.telefono}
          </Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleCall(item.telefono)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleSMS(item.telefono)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleWhatsApp(item.telefono)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
        {item.correo && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEmail(item.correo)}
          >
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text style={[styles.contactDetail, { color: colors.primary }]}>
              {item.correo}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No hay contactos registrados
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Agrega contactos de emergencia para tenerlos a mano en caso de necesidad
      </Text>
    </View>
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Contactos</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyContainer}>{renderEmptyState()}</View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContactCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("AddContact")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyState: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  contactCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  contactAlias: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 8,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ContactsScreen;
