import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const AddContactScreen = ({ navigation, route }) => {
  const { addContact, updateContact } = useApp();
  const { colors } = useTheme();
  const isEditing = route.params?.contact != null;
  const contactToEdit = route.params?.contact;

  const [formData, setFormData] = useState({
    alias: contactToEdit?.notes || "",
    nombre: contactToEdit?.name || "",
    telefono: contactToEdit?.phone || "",
    correo: contactToEdit?.email || "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return false;
    }
    if (!formData.telefono.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Map Spanish field names to English for the service
      const contactData = {
        name: formData.nombre,
        phone: formData.telefono,
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
      Alert.alert("Error", "No se pudo guardar el contacto");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Text style={[styles.label, { color: colors.text }]}>Teléfono *</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.text },
            ]}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange("telefono", value)}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text + "80"}
          />
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
    </ScrollView>
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
});

export default AddContactScreen;
