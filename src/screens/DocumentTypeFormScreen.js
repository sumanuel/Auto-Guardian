import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/common/Button";
import { useTheme } from "../context/ThemeContext";
import {
  createDocumentType,
  updateDocumentType,
} from "../services/documentService";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

// Crear o editar un tipo de documento
const DocumentTypeFormScreen = ({ route, navigation }) => {
  const type = route.params?.type;
  const isEditing = !!type;
  const { colors } = useTheme();

  const [typeDocument, setTypeDocument] = useState(type?.type_document || "");
  const [description, setDescription] = useState(type?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const descriptionRef = useRef(null);

  const handleSave = async () => {
    if (!typeDocument.trim()) {
      setError("El nombre del documento es obligatorio");
      return;
    }

    setError("");
    setSaving(true);
    const data = {
      type_document: typeDocument.trim(),
      description: description.trim(),
    };

    try {
      if (isEditing) {
        await updateDocumentType(type.id, data);
      } else {
        await createDocumentType(data);
      }
      navigation.goBack();
    } catch (err) {
      setError(
        err.message ||
          (isEditing
            ? "Error al actualizar el tipo de documento"
            : "Error al crear el tipo de documento"),
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>
            Tipo de Documento *
          </Text>
          <TextInput
            style={inputStyle}
            value={typeDocument}
            onChangeText={setTypeDocument}
            placeholder="Ej: Licencia de Conducir"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.text }]}>
            Descripción
          </Text>
          <TextInput
            ref={descriptionRef}
            style={[...inputStyle, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción opcional..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={iconSize.sm} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          title={isEditing ? "Guardar cambios" : "Crear tipo"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },
  group: { marginBottom: spacing.lg },
  label: { fontSize: rf(14), fontWeight: "600", marginBottom: spacing.xs },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: { minHeight: vs(90) },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee",
    borderColor: "#e74c3c",
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: rf(14),
    marginLeft: spacing.xs,
    flex: 1,
  },
  saveButton: { marginTop: spacing.xs },
});

export default DocumentTypeFormScreen;
