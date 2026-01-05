import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { useResponsive } from "../hooks/useResponsive";

const ContactsScreen = ({ navigation }) => {
  const { contacts, removeContact } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const { scale, verticalScale, moderateScale } = useResponsive();

  const responsiveStyles = getResponsiveStyles({
    scale,
    verticalScale,
    moderateScale,
  });

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
        responsiveStyles.contactCard,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
      ]}
    >
      <View
        style={[
          responsiveStyles.cardHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={responsiveStyles.nameContainer}>
          <Ionicons name="person" size={20} color={colors.primary} />
          <View>
            <Text
              style={[responsiveStyles.contactName, { color: colors.text }]}
            >
              {item.notes || item.name}
            </Text>
            {item.notes && (
              <Text
                style={[
                  responsiveStyles.contactAlias,
                  { color: colors.textSecondary },
                ]}
              >
                {item.name}
              </Text>
            )}
          </View>
        </View>
        <View style={responsiveStyles.contactActions}>
          <TouchableOpacity
            style={responsiveStyles.actionButton}
            onPress={() => navigation.navigate("AddContact", { contact: item })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={responsiveStyles.actionButton}
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
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={responsiveStyles.cardBody}>
        <View style={responsiveStyles.infoRow}>
          <Ionicons name="call-outline" size={16} color={colors.primary} />
          <Text
            style={[responsiveStyles.contactDetail, { color: colors.primary }]}
          >
            {item.phone}
          </Text>
          <View style={responsiveStyles.actionIcons}>
            <TouchableOpacity
              style={responsiveStyles.iconButton}
              onPress={() => handleCall(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={responsiveStyles.iconButton}
              onPress={() => handleSMS(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={responsiveStyles.iconButton}
              onPress={() => handleWhatsApp(item.phone)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
        {item.email && (
          <TouchableOpacity
            style={responsiveStyles.infoRow}
            onPress={() => handleEmail(item.email)}
          >
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text
              style={[
                responsiveStyles.contactDetail,
                { color: colors.primary },
              ]}
            >
              {item.email}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={responsiveStyles.emptyState}>
      <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
      <Text style={[responsiveStyles.emptyTitle, { color: colors.text }]}>
        No hay contactos registrados
      </Text>
      <Text
        style={[
          responsiveStyles.emptySubtitle,
          { color: colors.textSecondary },
        ]}
      >
        Agrega contactos de emergencia para tenerlos a mano en caso de necesidad
      </Text>
    </View>
  );

  return (
    <DialogComponent>
      <View
        style={[
          responsiveStyles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={responsiveStyles.header}>
          <View>
            <Text
              style={[responsiveStyles.headerTitle, { color: colors.text }]}
            >
              Contactos
            </Text>
            <Text
              style={[
                responsiveStyles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              {contacts.length} contacto{contacts.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            style={responsiveStyles.helpButton}
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
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {contacts.length === 0 ? (
          <View style={responsiveStyles.emptyContainer}>
            {renderEmptyState()}
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContactCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={responsiveStyles.listContent}
          />
        )}

        <TouchableOpacity
          style={[responsiveStyles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("AddContact")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </DialogComponent>
  );
};

function getResponsiveStyles({ scale, verticalScale, moderateScale }) {
  return {
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: verticalScale(20),
      paddingTop: verticalScale(20),
      paddingHorizontal: scale(20),
    },
    headerTitle: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
      marginBottom: verticalScale(4),
    },
    subtitle: {
      fontSize: moderateScale(16),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: scale(32),
    },
    emptyState: {
      alignItems: "center",
    },
    emptyTitle: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
    },
    emptySubtitle: {
      fontSize: moderateScale(14),
      textAlign: "center",
    },
    listContent: {
      padding: scale(16),
      paddingBottom: verticalScale(100),
    },
    contactCard: {
      borderRadius: moderateScale(12),
      marginBottom: verticalScale(12),
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
      padding: scale(16),
      borderBottomWidth: 1,
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: scale(8),
    },
    contactName: {
      fontSize: moderateScale(16),
      fontWeight: "bold",
      marginLeft: scale(8),
    },
    contactAlias: {
      fontSize: moderateScale(12),
      marginTop: verticalScale(2),
      marginLeft: scale(8),
    },
    contactActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: scale(8),
      marginLeft: scale(8),
    },
    cardBody: {
      padding: scale(16),
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    contactDetail: {
      fontSize: moderateScale(14),
      marginLeft: scale(8),
      flex: 1,
    },
    actionIcons: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      padding: scale(4),
      marginLeft: scale(8),
    },
    fab: {
      position: "absolute",
      right: scale(20),
      bottom: verticalScale(20),
      width: scale(60),
      height: verticalScale(60),
      borderRadius: moderateScale(30),
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    helpButton: {
      padding: scale(8),
    },
  };
}

export default ContactsScreen;
