import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
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
        contactToEdit.phone.startsWith(c.code)
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEditing ? "Editar Contacto" : "Agregar Contacto"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Alias</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={formData.alias}
              onChangeText={(value) => handleInputChange("alias", value)}
              placeholder="Ej: Mecanico de confianza, Proveedor, etc."
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Nombre *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={formData.nombre}
              onChangeText={(value) => handleInputChange("nombre", value)}
              placeholder="Nombre completo"
              placeholderTextColor={colors.text + "80"}
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
                    color: selectedCountry ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.code})`
                  : "Selecciona un país..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
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
                style={[
                  styles.phoneInput,
                  { color: colors.text, borderColor: colors.text },
                ]}
                value={formData.telefono}
                onChangeText={(value) => handleInputChange("telefono", value)}
                placeholder="Número sin código de país"
                keyboardType="phone-pad"
                placeholderTextColor={colors.text + "80"}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Correo</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={formData.correo}
              onChangeText={(value) => handleInputChange("correo", value)}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
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
                  <Ionicons name="close" size={24} color={colors.text} />
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
      </ScrollView>
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
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  countrySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "transparent",
  },
  countryText: {
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  countryCode: {
    fontSize: 16,
    paddingLeft: 12,
    paddingRight: 8,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    paddingLeft: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  countryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryItemText: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AddContactScreen;
