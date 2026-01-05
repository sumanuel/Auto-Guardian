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
import { ms, rf } from "../utils/responsive";

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

  const handleCall = async (phoneNumber) => {
    try {
      if (!phoneNumber || phoneNumber.trim() === "") {
        Alert.alert("Error", "Número de teléfono no válido");
        return;
      }

      // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
      const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
      const url = `tel:${cleanNumber}`;

      // Intentar abrir directamente sin verificar canOpenURL ya que tel: está permitido
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al intentar llamar:", error);
      Alert.alert(
        "Error",
        `No se pudo iniciar la llamada.\n\nNúmero: ${phoneNumber}\n\nVerifica los permisos de la aplicación.`
      );
    }
  };

  const handleSMS = async (phoneNumber) => {
    try {
      if (!phoneNumber || phoneNumber.trim() === "") {
        Alert.alert("Error", "Número de teléfono no válido");
        return;
      }

      const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
      const url = `sms:${cleanNumber}`;

      // Intentar abrir directamente ya que sms: está permitido por defecto
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al intentar enviar SMS:", error);
      Alert.alert(
        "Error",
        `No se pudo abrir la aplicación de SMS.\n\nNúmero: ${phoneNumber}\n\nVerifica los permisos de la aplicación.`
      );
    }
  };

  const handleEmail = async (email) => {
    try {
      if (!email || email.trim() === "") {
        Alert.alert("Error", "Dirección de email no válida");
        return;
      }

      const url = `mailto:${email}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Función no disponible",
          "Este dispositivo no soporta envío de emails. El email es: " + email
        );
      }
    } catch (error) {
      console.error("Error al intentar enviar email:", error);
      Alert.alert(
        "Error",
        "No se pudo enviar el email. Verifica que la dirección sea correcta."
      );
    }
  };

  const handleWhatsApp = async (phoneNumber) => {
    try {
      if (!phoneNumber || phoneNumber.trim() === "") {
        Alert.alert("Error", "Número de teléfono no válido");
        return;
      }

      // Limpiar el número (remover espacios, guiones, paréntesis y el signo +)
      const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, "");

      // Intentar primero con el esquema de la app de WhatsApp
      const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;

      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
          return;
        }
      } catch (error) {
        console.log("WhatsApp app no disponible, intentando con web API");
      }

      // Si falla, usar la API web de WhatsApp como fallback
      const webUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}`;
      await Linking.openURL(webUrl);
    } catch (error) {
      console.error("Error al intentar abrir WhatsApp:", error);
      Alert.alert(
        "WhatsApp no disponible",
        "No se pudo abrir WhatsApp. Asegúrate de tener WhatsApp instalado."
      );
    }
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
          <Ionicons name="person" size={ms(20)} color={colors.primary} />
          <View>
            <Text style={[styles.contactName, { color: colors.text }]}>
              {item.notes || item.name}
            </Text>
            {item.notes && (
              <Text
                style={[styles.contactAlias, { color: colors.textSecondary }]}
              >
                {item.name}
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
            <Ionicons
              name="create-outline"
              size={ms(20)}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              showDialog({
                title: "Eliminar contacto",
                message: `¿Estás seguro de que quieres eliminar a ${item.name}?`,
                onConfirm: () => handleDeleteContact(item.id),
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                type: "danger",
              })
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={ms(20)} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={ms(16)} color={colors.primary} />
          <Text style={[styles.contactDetail, { color: colors.primary }]}>
            {item.phone}
          </Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleCall(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="call" size={ms(20)} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleSMS(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={ms(20)}
                color="#007AFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleWhatsApp(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="logo-whatsapp" size={ms(20)} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
        {item.email && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleEmail(item.email)}
          >
            <Ionicons
              name="mail-outline"
              size={ms(16)}
              color={colors.primary}
            />
            <Text style={[styles.contactDetail, { color: colors.primary }]}>
              {item.email}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="people-outline"
        size={ms(80)}
        color={colors.textSecondary}
      />
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
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Contactos
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {contacts.length} contacto{contacts.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              showDialog({
                title: "Contactos de Confianza",
                message:
                  "Aquí puedes gestionar tus contactos de confianza como mecánicos, servicios de grúas, compañías de seguros, etc. Tenlos a mano para un acceso mucho más rápido cuando necesites asistencia con tus vehículos.",
                type: "info",
              })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={ms(24)}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyContainer}>{renderEmptyState()}</View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContactCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("AddContact")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={ms(30)} color="#fff" />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ms(20),
    paddingTop: ms(20),
    paddingHorizontal: ms(20),
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginBottom: ms(4),
  },
  subtitle: {
    fontSize: rf(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: ms(32),
  },
  emptyState: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginTop: ms(16),
    marginBottom: ms(8),
  },
  emptySubtitle: {
    fontSize: rf(14),
    textAlign: "center",
  },
  listContent: {
    padding: ms(16),
    paddingBottom: ms(100),
  },
  contactCard: {
    borderRadius: ms(12),
    marginBottom: ms(12),
    elevation: ms(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ms(16),
    borderBottomWidth: ms(1),
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: ms(8),
  },
  contactName: {
    fontSize: rf(16),
    fontWeight: "bold",
    marginLeft: ms(8),
  },
  contactAlias: {
    fontSize: rf(12),
    marginTop: ms(2),
    marginLeft: ms(8),
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: ms(8),
    marginLeft: ms(8),
  },
  cardBody: {
    padding: ms(16),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ms(8),
  },
  contactDetail: {
    fontSize: rf(14),
    marginLeft: ms(8),
    flex: 1,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: ms(4),
    marginLeft: ms(8),
  },
  fab: {
    position: "absolute",
    right: ms(20),
    bottom: ms(20),
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: ms(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: ms(4),
  },
  helpButton: {
    padding: ms(8),
  },
});

export default ContactsScreen;
