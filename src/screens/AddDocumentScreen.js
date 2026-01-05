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
  getVehicleDocuments,
  updateVehicleDocument,
} from "../services/vehicleDocumentService";
import { ms, rf } from "../utils/responsive";

const AddDocumentScreen = ({ navigation, route }) => {
  const { vehicleId, vehicle, document } = route.params;
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();

  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [issueDate, setIssueDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issueDateSelected, setIssueDateSelected] = useState(false);
  const [expiryDateSelected, setExpiryDateSelected] = useState(false);

  const isEditing = !!document;

  // Función para parsear fechas locales correctamente
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const types = getDocumentTypes();
    setDocumentTypes(types);

    if (isEditing && document) {
      const type = types.find((t) => t.id === document.document_type_id);
      setSelectedDocumentType(type);
      setIssueDate(parseLocalDate(document.issue_date));
      setExpiryDate(parseLocalDate(document.expiry_date));
      // En edición, consideramos que las fechas ya fueron "seleccionadas"
      setIssueDateSelected(true);
      setExpiryDateSelected(!!document.expiry_date);
    } else {
      // Setear fechas por defecto para nuevo documento
      const today = new Date();
      // Ajustar la fecha para que sea local (evitar problemas de zona horaria)
      const localToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      setIssueDate(localToday);
      setIssueDateSelected(true); // La fecha de expedición por defecto ya está "seleccionada"

      // Fecha de vencimiento por defecto: misma fecha actual
      setExpiryDate(localToday);
      setExpiryDateSelected(true); // La fecha de vencimiento por defecto ya está "seleccionada"
    }
  }, []);

  const handleSelectDocumentType = (type) => {
    setSelectedDocumentType(type);
    setShowTypePicker(false);
  };

  const handleIssueDateChange = (date) => {
    setIssueDate(date);
    setIssueDateSelected(true);
  };

  const handleExpiryDateChange = (date) => {
    setExpiryDate(date);
    setExpiryDateSelected(true);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    return localToday.getTime() === compareDate.getTime();
  };

  const handleSave = async () => {
    if (!selectedDocumentType) {
      showDialog({
        title: "Error",
        message: "Debes seleccionar un tipo de documento",
        type: "error",
      });
      return;
    }

    // Verificar si ya existe un documento del mismo tipo para este vehículo
    const existingDocuments = getVehicleDocuments(vehicleId);
    const duplicateDocument = existingDocuments.find(
      (doc) =>
        doc.document_type_id === selectedDocumentType.id &&
        (!isEditing || doc.id !== document.id)
    );

    if (duplicateDocument) {
      showDialog({
        title: "Error",
        message: `Ya existe un documento de tipo "${selectedDocumentType.type_document}" para este vehículo. No se pueden duplicar tipos de documento.`,
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

    // Verificar que la fecha de vencimiento sea posterior a la fecha de expedición
    // Comparar solo fecha (sin hora) para evitar problemas con horas diferentes
    const issueDateOnly = new Date(
      issueDate.getFullYear(),
      issueDate.getMonth(),
      issueDate.getDate()
    );
    const expiryDateOnly = new Date(
      expiryDate.getFullYear(),
      expiryDate.getMonth(),
      expiryDate.getDate()
    );

    if (expiryDateOnly <= issueDateOnly) {
      showDialog({
        title: "Error",
        message:
          "La fecha de vencimiento debe ser posterior a la fecha de expedición",
        type: "error",
      });
      return;
    }

    // Proceder con el guardado
    proceedWithSave();
  };

  const proceedWithSave = () => {
    setLoading(true);

    try {
      // Convertir fechas a formato YYYY-MM-DD local para guardar
      const issueDateString = issueDate.toLocaleDateString("en-CA");
      const expiryDateString = expiryDate
        ? expiryDate.toLocaleDateString("en-CA")
        : null;

      let success;
      if (isEditing) {
        success = updateVehicleDocument(
          document.id,
          selectedDocumentType.id,
          issueDateString,
          expiryDateString
        );
      } else {
        success = addVehicleDocument(
          vehicleId,
          selectedDocumentType.id,
          issueDateString,
          expiryDateString
        );
      }

      if (success) {
        navigation.goBack();
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
                size={ms(20)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Fecha de expedición */}
          <DatePicker
            label="Fecha de Expedición *"
            value={issueDate}
            onChange={handleIssueDateChange}
          />

          {/* Fecha de vencimiento */}
          <DatePicker
            label="Fecha de Vencimiento *"
            value={expiryDate}
            onChange={handleExpiryDateChange}
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
                  <Ionicons name="close" size={ms(24)} color={colors.text} />
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
    padding: ms(20),
  },
  vehicleName: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: ms(20),
    textAlign: "center",
  },
  section: {
    marginBottom: ms(20),
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: ms(8),
  },
  selector: {
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: rf(16),
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: ms(30),
    gap: ms(12),
  },
  cancelButton: {
    flex: 1,
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: rf(16),
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    borderRadius: ms(8),
    padding: ms(12),
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: rf(16),
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
    borderRadius: ms(12),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: ms(20),
    borderBottomWidth: ms(1),
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
  typeList: {
    padding: ms(20),
  },
  typeOption: {
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(16),
    marginBottom: ms(8),
  },
  typeOptionText: {
    fontSize: rf(16),
    fontWeight: "500",
    marginBottom: ms(4),
  },
  typeOptionDescription: {
    fontSize: rf(14),
  },
});

export default AddDocumentScreen;
