import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  deleteDocumentType,
  getDocumentTypes,
  isDocumentTypeInUse,
} from "../services/documentService";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const DocumentTypesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [documentTypes, setDocumentTypes] = useState([]);
  useEffect(() => {
    loadDocumentTypes();
    const unsubscribe = navigation.addListener("focus", loadDocumentTypes);
    return unsubscribe;
  }, [navigation]);

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
            size={iconSize.md}
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
            <Ionicons
              name="create-outline"
              size={iconSize.sm}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteType(item)}
          >
            <Ionicons name="trash-outline" size={iconSize.sm} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleEditType = (type) => {
    navigation.navigate("DocumentTypeForm", { type });
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
              } catch (_error) {
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
        <LinearGradient
          colors={[colors.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroMediaRow}>
              <View style={[styles.iconBadge, styles.heroIconBadge]}>
                <Ionicons
                  name="document-text-outline"
                  size={iconSize.lg}
                  color="#D6E7FF"
                />
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroEyebrow}>Catálogo documental</Text>
                <Text style={styles.headerTitle}>Tipos de Documentos</Text>
                <Text style={styles.heroSubtitle}>
                  Define el universo documental que la app controlará para cada
                  vehículo y sus vencimientos.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
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
                size={iconSize.lg}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

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
            { backgroundColor: colors.primaryDark },
          ]}
          onPress={() => navigation.navigate("DocumentTypeForm")}
        >
          <Ionicons name="add" size={iconSize.md} color="white" />
        </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroGradient: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroIconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: borderRadius.lg,
  },
  heroInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#D6E7FF",
  },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "#D6E7FF",
  },
  helpButtonHero: {
    width: s(42),
    height: s(42),
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: vs(100),
  },
  documentTypeCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(2),
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  typeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  typeDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  typeName: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: rf(14),
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  editButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: vs(20),
    right: hs(20),
    width: iconSize.xl,
    height: iconSize.xl,
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: s(420),
    borderRadius: borderRadius.md,
    padding: 0,
    elevation: s(5),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: s(1),
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: rf(17),
    fontWeight: "bold",
  },
  modalBody: {
    padding: spacing.lg,
  },
  label: {
    fontSize: rf(14),
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  textArea: {
    minHeight: s(80),
    textAlignVertical: "top",
  },
  errorText: {
    color: "#E53935",
    fontSize: rf(14),
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  helpButton: {
    padding: spacing.xs,
  },
});

export default DocumentTypesScreen;
