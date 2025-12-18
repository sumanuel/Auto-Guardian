import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "../components/common/DatePicker";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { getDocumentTypes } from "../services/documentService";
import {
  addVehicleDocument,
  updateVehicleDocument,
} from "../services/vehicleDocumentService";

const AddDocumentScreen = ({ navigation, route }) => {
  const { vehicleId, vehicle, document } = route.params;
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();

  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!document;

  useEffect(() => {
    const types = getDocumentTypes();
    setDocumentTypes(types);

    if (isEditing && document) {
      const type = types.find((t) => t.id === document.document_type_id);
      setSelectedDocumentType(type);
      setIssueDate(document.issue_date);
      setExpiryDate(document.expiry_date || "");
    }
  }, []);

  const handleSelectDocumentType = (type) => {
    setSelectedDocumentType(type);
    setShowTypePicker(false);
  };

  const handleSave = () => {
    if (!selectedDocumentType) {
      showDialog({
        title: "Error",
        message: "Debes seleccionar un tipo de documento",
        type: "error",
      });
      return;
    }

    if (!issueDate) {
      showDialog({
        title: "Error",
        message: "Debes ingresar la fecha de expedición",
        type: "error",
      });
      return;
    }

    if (!expiryDate) {
      showDialog({
        title: "Error",
        message: "Debes ingresar la fecha de vencimiento",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      let success;
      if (isEditing) {
        success = updateVehicleDocument(
          document.id,
          selectedDocumentType.id,
          issueDate,
          expiryDate || null
        );
      } else {
        success = addVehicleDocument(
          vehicleId,
          selectedDocumentType.id,
          issueDate,
          expiryDate || null
        );
      }

      if (success) {
        showDialog({
          title: "Éxito",
          message: `Documento ${
            isEditing ? "actualizado" : "agregado"
          } correctamente`,
          type: "success",
          onConfirm: () => {
            navigation.goBack();
          },
        });
      } else {
        showDialog({
          title: "Error",
          message: `No se pudo ${
            isEditing ? "actualizar" : "agregar"
          } el documento`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error guardando documento:", error);
      showDialog({
        title: "Error",
        message: "Ocurrió un error inesperado",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentTypeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.typeOption,
        {
          backgroundColor:
            selectedDocumentType?.id === item.id
              ? colors.primary + "20"
              : colors.cardBackground,
          borderColor:
            selectedDocumentType?.id === item.id
              ? colors.primary
              : colors.border,
        },
      ]}
      onPress={() => handleSelectDocumentType(item)}
    >
      <Text
        style={[
          styles.typeOptionText,
          {
            color:
              selectedDocumentType?.id === item.id
                ? colors.primary
                : colors.text,
          },
        ]}
      >
        {item.type_document}
      </Text>
      {item.description && (
        <Text
          style={[
            styles.typeOptionDescription,
            {
              color:
                selectedDocumentType?.id === item.id
                  ? colors.primary
                  : colors.textSecondary,
            },
          ]}
        >
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.vehicleName, { color: colors.textSecondary }]}>
            {vehicle?.name || "Vehículo"}
          </Text>

          {/* Selector de tipo de documento */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tipo de Documento *
            </Text>
            <TouchableOpacity
              style={[
                styles.selector,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                },
              ]}
              onPress={() => setShowTypePicker(true)}
            >
              <Text
                style={[
                  styles.selectorText,
                  {
                    color: selectedDocumentType
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
              >
                {selectedDocumentType
                  ? selectedDocumentType.type_document
                  : "Seleccionar tipo de documento"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Fecha de expedición */}
          <DatePicker
            label="Fecha de Expedición *"
            value={issueDate ? new Date(issueDate) : new Date()}
            onChange={(date) => setIssueDate(date.toISOString().split("T")[0])}
          />

          {/* Fecha de vencimiento */}
          <DatePicker
            label="Fecha de Vencimiento *"
            value={expiryDate ? new Date(expiryDate) : null}
            onChange={(date) =>
              setExpiryDate(date ? date.toISOString().split("T")[0] : "")
            }
          />

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
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
                  : "Agregar"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal para seleccionar tipo de documento */}
        <Modal
          visible={showTypePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTypePicker(false)}
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
                  Seleccionar Tipo
                </Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={documentTypes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderDocumentTypeItem}
                contentContainerStyle={styles.typeList}
                showsVerticalScrollIndicator={false}
              />
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
    padding: 20,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
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
  typeList: {
    padding: 20,
  },
  typeOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  typeOptionDescription: {
    fontSize: 14,
  },
});

export default AddDocumentScreen;
