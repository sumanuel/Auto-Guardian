import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  createDocumentType,
  deleteDocumentType,
  getDocumentTypes,
  isDocumentTypeInUse,
  updateDocumentType,
} from "../services/documentService";

const DocumentTypesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editTypeDocument, setEditTypeDocument] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newTypeDocument, setNewTypeDocument] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [addError, setAddError] = useState("");

  // Referencias para navegación en modal de nuevo tipo
  const newTypeDocumentRef = useRef(null);
  const newTypeDescriptionRef = useRef(null);

  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const loadDocumentTypes = () => {
    const types = getDocumentTypes();
    setDocumentTypes(types);
  };

  const renderDocumentTypeItem = ({ item }) => (
    <View
      style={[
        styles.documentTypeCard,
        { backgroundColor: colors.cardBackground },
      ]}
    >
      <View style={styles.typeItem}>
        <View style={styles.typeInfo}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={colors.primary}
          />
          <View style={styles.typeDetails}>
            <Text style={[styles.typeName, { color: colors.text }]}>
              {item.type_document}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.descriptionText,
                  { color: colors.textSecondary },
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditType(item)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteType(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleEditType = (type) => {
    setSelectedType(type);
    setEditTypeDocument(type.type_document);
    setEditDescription(type.description || "");
    setEditError(""); // Limpiar error al abrir
    setEditModalVisible(true);
  };

  const handleSaveType = async () => {
    if (!editTypeDocument.trim()) {
      setEditError("El nombre del documento es obligatorio");
      return;
    }

    try {
      await updateDocumentType(selectedType.id, {
        type_document: editTypeDocument.trim(),
        description: editDescription.trim(),
      });

      setEditModalVisible(false);
      loadDocumentTypes();
      showDialog({
        title: "Éxito",
        message: "Tipo de documento actualizado correctamente",
        type: "success",
      });
    } catch (error) {
      setEditError(error.message || "Error al actualizar el tipo de documento");
    }
  };

  const handleAddType = async () => {
    if (!newTypeDocument.trim()) {
      setAddError("El nombre del documento es obligatorio");
      return;
    }

    try {
      await createDocumentType({
        type_document: newTypeDocument.trim(),
        description: newTypeDescription.trim(),
      });

      setAddModalVisible(false);
      setNewTypeDocument("");
      setNewTypeDescription("");
      loadDocumentTypes();
      showDialog({
        title: "Éxito",
        message: "Tipo de documento creado correctamente",
        type: "success",
      });
    } catch (error) {
      setAddError(error.message || "Error al crear el tipo de documento");
    }
  };

  const handleDeleteType = async (type) => {
    try {
      const inUse = await isDocumentTypeInUse(type.id);

      if (inUse) {
        showDialog({
          title: "No se puede eliminar",
          message: `El tipo "${type.type_document}" está siendo usado en vehículos y no puede ser eliminado.`,
          type: "warning",
        });
        return;
      }

      showDialog({
        title: "Eliminar Tipo de Documento",
        message: `¿Estás seguro de eliminar "${type.type_document}"?`,
        type: "confirm",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteDocumentType(type.id);
                loadDocumentTypes();
                showDialog({
                  title: "Éxito",
                  message: "Tipo de documento eliminado correctamente",
                  type: "success",
                });
              } catch (error) {
                showDialog({
                  title: "Error",
                  message: "No se pudo eliminar el tipo de documento",
                  type: "error",
                });
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error verificando tipo de documento:", error);
      showDialog({
        title: "Error",
        message: "No se pudo verificar el tipo de documento",
        type: "error",
      });
    }
  };

  return (
    <DialogComponent>
      <View
        style={[
          styles.container,
          styles.content,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tipos de Documentos
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              showDialog({
                title: "Tipos de Documentos",
                message:
                  "Aquí puedes gestionar los diferentes tipos de documentos que requieren tus vehículos, como licencias de conducir, seguros, revisiones técnicas, etc. Puedes agregar, editar o eliminar tipos según tus necesidades.",
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

        <FlatList
          data={documentTypes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDocumentTypeItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            setAddError("");
            setAddModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>

        {/* Modal para editar tipo de documento */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
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
                  Editar Tipo de Documento
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Tipo de Documento *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={editTypeDocument}
                  onChangeText={setEditTypeDocument}
                  placeholder="Ej: Licencia de Conducir"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>
                  Descripción
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Descripción opcional..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {editError ? (
                  <Text style={styles.errorText}>{editError}</Text>
                ) : null}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSaveType}
                  >
                    <Text style={{ color: "white" }}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para agregar tipo de documento */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddModalVisible(false)}
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
                  Nuevo Tipo de Documento
                </Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Tipo de Documento *
                </Text>
                <TextInput
                  ref={newTypeDocumentRef}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={newTypeDocument}
                  onChangeText={setNewTypeDocument}
                  placeholder="Ej: Seguro de Vida"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                  onSubmitEditing={() => newTypeDescriptionRef.current?.focus()}
                  blurOnSubmit={false}
                />

                <Text style={[styles.label, { color: colors.text }]}>
                  Descripción
                </Text>
                <TextInput
                  ref={newTypeDescriptionRef}
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={newTypeDescription}
                  onChangeText={setNewTypeDescription}
                  placeholder="Descripción opcional..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                />

                {addError ? (
                  <Text style={styles.errorText}>{addError}</Text>
                ) : null}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setAddModalVisible(false)}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleAddType}
                  >
                    <Text style={{ color: "white" }}>Crear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  documentTypeCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  typeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  typeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 0,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#E53935",
    fontSize: 14,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  helpButton: {
    padding: 8,
  },
});

export default DocumentTypesScreen;
