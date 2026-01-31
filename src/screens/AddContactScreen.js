import { Ionicons } from "@expo/vector-icons";
// CONTACTOS DESHABILITADO: se removió `expo-contacts` para pasar revisión (permisos sensibles).
// import * as Contacts from "expo-contacts";
import { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COUNTRIES } from "../constants/countries";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { ms, rf } from "../utils/responsive";

const AddContactScreen = ({ navigation, route }) => {
  const { addContact, updateContact } = useApp();
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const isEditing = route.params?.contact != null;
  const contactToEdit = route.params?.contact;

  const [formData, setFormData] = useState(() => {
    let telefono = contactToEdit?.phone || "";

    // Si estamos editando y el teléfono tiene un código de país, extraer el número local
    if (contactToEdit?.phone) {
      const country = COUNTRIES.find((c) =>
        contactToEdit.phone.startsWith(c.code),
      );
      if (country) {
        telefono = contactToEdit.phone.replace(country.code, "");
      }
    }

    return {
      alias: contactToEdit?.notes || "",
      nombre: contactToEdit?.name || "",
      telefono: telefono,
      correo: contactToEdit?.email || "",
    };
  });

  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Si estamos editando, intentar encontrar el país basado en el número
    if (contactToEdit?.phone) {
      const phone = contactToEdit.phone;
      const country = COUNTRIES.find((c) => phone.startsWith(c.code));
      return country || null;
    }
    // Para nuevos contactos, no hay país seleccionado por defecto
    return null;
  });

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Referencias para navegación entre campos
  const scrollViewRef = useRef(null);
  const aliasRef = useRef(null);
  const nombreRef = useRef(null);
  const telefonoRef = useRef(null);
  const correoRef = useRef(null);

  const scrollToInput = (inputRef) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: y - ms(150),
            animated: true,
          });
        },
        () => {},
      );
    }
  };

  const importContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitas permitir el acceso a contactos.",
        );
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });
      setPhoneContacts(
        data.filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0,
        ),
      );
      setImportModalVisible(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los contactos.");
    }
  };

  const selectContact = (contact) => {
    const name = contact.name;
    const phone = contact.phoneNumbers[0].number;
    const email = contact.emails ? contact.emails[0].email : "";

    // Extract country code
    let country = null;
    let localPhone = phone.replace(/\D/g, ""); // Remove non-digits
    for (const c of COUNTRIES) {
      if (localPhone.startsWith(c.code.replace(/\D/g, ""))) {
        country = c;
        localPhone = localPhone.replace(c.code.replace(/\D/g, ""), "");
        break;
      }
    }

    setFormData({
      ...formData,
      alias: name,
      nombre: name,
      telefono: localPhone,
      correo: email,
    });
    if (country) {
      setSelectedCountry(country);
    }
    setImportModalVisible(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountrySelect = (country) => {
    // Si estamos editando y el teléfono ya tiene un código de país,
    // extraer solo el número local cuando cambiamos de país
    if (isEditing && formData.telefono && selectedCountry) {
      const currentPhone = formData.telefono;
      // Si el teléfono actual comienza con el código del país anterior, extraer el número local
      if (currentPhone.startsWith(selectedCountry.code)) {
        const localNumber = currentPhone.replace(selectedCountry.code, "");
        setFormData((prev) => ({ ...prev, telefono: localNumber }));
      }
    }

    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showDialog({
        title: "Campo requerido",
        message: "El nombre es obligatorio",
        type: "error",
      });
      return false;
    }
    if (!selectedCountry) {
      showDialog({
        title: "Campo requerido",
        message: "Debes seleccionar el país del número telefónico",
        type: "error",
      });
      return false;
    }
    if (!formData.telefono.trim()) {
      showDialog({
        title: "Campo requerido",
        message: "El teléfono es obligatorio",
        type: "error",
      });
      return false;
    }
    if (formData.correo.trim() && !validateEmail(formData.correo.trim())) {
      showDialog({
        title: "Formato inválido",
        message: "El formato del correo electrónico no es válido",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Combinar código de país con número de teléfono
      const fullPhoneNumber = formData.telefono.startsWith("+")
        ? formData.telefono // Ya tiene código
        : (selectedCountry?.code || "") + formData.telefono.replace(/^0+/, ""); // Agregar código y remover ceros iniciales

      // Map Spanish field names to English for the service
      const contactData = {
        name: formData.nombre,
        phone: fullPhoneNumber,
        email: formData.correo,
        notes: formData.alias, // Using alias as notes
      };

      if (isEditing) {
        await updateContact(contactToEdit.id, contactData);
      } else {
        await addContact(contactData);
      }
      navigation.goBack();
    } catch (error) {
      showDialog({
        title: "Error al guardar",
        message: "No se pudo guardar el contacto. Inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogComponent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={ms(24)} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? "Editar Contacto" : "Agregar Contacto"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.importButton, { borderColor: colors.primary }]}
            onPress={importContacts}
          >
            <Ionicons name="person-add" size={ms(20)} color={colors.primary} />
            <Text style={[styles.importButtonText, { color: colors.primary }]}>
              Importar desde Contactos
            </Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Alias</Text>
              <TextInput
                ref={aliasRef}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.text },
                ]}
                value={formData.alias}
                onChangeText={(value) => handleInputChange("alias", value)}
                placeholder="Ej: Mecanico de confianza, Proveedor, etc."
                placeholderTextColor={colors.text + "80"}
                returnKeyType="next"
                onFocus={() => scrollToInput(aliasRef)}
                onSubmitEditing={() => nombreRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nombre *
              </Text>
              <TextInput
                ref={nombreRef}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.text },
                ]}
                value={formData.nombre}
                onChangeText={(value) => handleInputChange("nombre", value)}
                placeholder="Nombre completo"
                placeholderTextColor={colors.text + "80"}
                returnKeyType="next"
                onFocus={() => scrollToInput(nombreRef)}
                onSubmitEditing={() => telefonoRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>País *</Text>
              <TouchableOpacity
                style={[
                  styles.countrySelector,
                  { borderColor: selectedCountry ? colors.text : "#ff4444" },
                ]}
                onPress={() => setShowCountryModal(true)}
              >
                <Text
                  style={[
                    styles.countryText,
                    {
                      color: selectedCountry
                        ? colors.text
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {selectedCountry
                    ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.code})`
                    : "Selecciona un país..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={ms(20)}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Teléfono *
              </Text>
              <View style={styles.phoneInputContainer}>
                <Text style={[styles.countryCode, { color: colors.text }]}>
                  {selectedCountry ? selectedCountry.code : "+__"}
                </Text>
                <TextInput
                  ref={telefonoRef}
                  style={[
                    styles.phoneInput,
                    { color: colors.text, borderColor: colors.text },
                  ]}
                  value={formData.telefono}
                  onChangeText={(value) => handleInputChange("telefono", value)}
                  placeholder="Número sin código de país"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.text + "80"}
                  returnKeyType="next"
                  onFocus={() => scrollToInput(telefonoRef)}
                  onSubmitEditing={() => correoRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Correo</Text>
              <TextInput
                ref={correoRef}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.text },
                ]}
                value={formData.correo}
                onChangeText={(value) => handleInputChange("correo", value)}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                placeholderTextColor={colors.text + "80"}
                returnKeyType="done"
                onFocus={() => scrollToInput(correoRef)}
                onSubmitEditing={handleSave}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal para seleccionar país */}
          <Modal
            visible={showCountryModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCountryModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar País
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCountryModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={ms(24)} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={COUNTRIES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.countryItem,
                        selectedCountry?.code === item.code && {
                          backgroundColor: colors.primary + "20",
                        },
                      ]}
                      onPress={() => handleCountrySelect(item)}
                    >
                      <Text
                        style={[styles.countryItemText, { color: colors.text }]}
                      >
                        {item.flag} {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.countryCodeText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.code}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </Modal>

          {/* Modal para importar contacto */}
          <Modal
            visible={importModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setImportModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Contacto
                  </Text>
                  <TouchableOpacity
                    onPress={() => setImportModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={ms(24)} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[
                    styles.searchInput,
                    { color: colors.text, borderColor: colors.text },
                  ]}
                  placeholder="Buscar contacto..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchText}
                  onChangeText={setSearchText}
                />

                <FlatList
                  data={phoneContacts.filter(
                    (contact) =>
                      contact.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                      contact.phoneNumbers[0].number.includes(searchText),
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.contactItem}
                      onPress={() => selectContact(item)}
                    >
                      <Ionicons
                        name="person"
                        size={ms(24)}
                        color={colors.primary}
                        style={styles.contactIcon}
                      />
                      <View style={styles.contactInfo}>
                        <Text
                          style={[styles.contactName, { color: colors.text }]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            styles.contactPhone,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.phoneNumbers[0].number}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: ms(16),
    paddingTop: ms(50),
  },
  backButton: {
    marginRight: ms(16),
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  form: {
    padding: ms(16),
  },
  inputContainer: {
    marginBottom: ms(20),
  },
  label: {
    fontSize: rf(16),
    fontWeight: "500",
    marginBottom: ms(8),
  },
  input: {
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    fontSize: rf(16),
    backgroundColor: "transparent",
  },
  saveButton: {
    padding: ms(16),
    borderRadius: ms(8),
    alignItems: "center",
    marginTop: ms(20),
  },
  saveButtonText: {
    color: "#fff",
    fontSize: rf(18),
    fontWeight: "bold",
  },
  countrySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    backgroundColor: "transparent",
  },
  countryText: {
    fontSize: rf(16),
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: ms(1),
    borderRadius: ms(8),
    backgroundColor: "transparent",
  },
  countryCode: {
    fontSize: rf(16),
    paddingLeft: ms(12),
    paddingRight: ms(8),
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    padding: ms(12),
    fontSize: rf(16),
    borderLeftWidth: ms(1),
    borderLeftColor: "#ccc",
    paddingLeft: ms(12),
  },
  helperText: {
    fontSize: rf(12),
    marginTop: ms(4),
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: ms(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ms(20),
    borderBottomWidth: ms(1),
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  closeButton: {
    padding: ms(4),
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ms(16),
    borderBottomWidth: ms(1),
    borderBottomColor: "#f0f0f0",
  },
  countryItemText: {
    fontSize: rf(16),
  },
  countryCodeText: {
    fontSize: rf(14),
    fontWeight: "500",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: ms(12),
    borderRadius: ms(8),
    borderWidth: ms(1),
    marginTop: ms(10),
    marginHorizontal: ms(16),
  },
  importButtonText: {
    fontSize: rf(16),
    marginLeft: ms(8),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: ms(16),
    borderBottomWidth: ms(1),
    borderBottomColor: "#eee",
  },
  contactIcon: {
    marginRight: ms(12),
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: rf(16),
    fontWeight: "bold",
  },
  contactPhone: {
    fontSize: rf(14),
    marginTop: ms(4),
  },
  searchInput: {
    margin: ms(16),
    padding: ms(12),
    borderWidth: ms(1),
    borderRadius: ms(8),
    fontSize: rf(16),
  },
});

export default AddContactScreen;
