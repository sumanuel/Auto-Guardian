import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
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
  deleteVehicleDocument,
  getVehicleDocuments,
} from "../services/vehicleDocumentService";
import { getDocumentExpiryColor } from "../utils/formatUtils";
import {
  borderRadius,
  hs,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const VehicleDocumentsScreen = ({ navigation, route }) => {
  const { vehicleId, vehicle } = route.params;
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
    }, [vehicleId])
  );

  const loadDocuments = () => {
    setLoading(true);
    const docs = getVehicleDocuments(vehicleId);
    setDocuments(docs);
    setLoading(false);
  };

  const handleDeleteDocument = async (document) => {
    const confirmed = await showDialog({
      title: "Eliminar Documento",
      message: `¿Estás seguro de que quieres eliminar "${document.type_document}"?`,
      type: "confirm",
    });

    if (!confirmed) {
      return; // Usuario canceló
    }

    const success = deleteVehicleDocument(document.id);
    if (success) {
      loadDocuments();
      showDialog({
        title: "Éxito",
        message: "Documento eliminado correctamente",
        type: "success",
      });
    } else {
      showDialog({
        title: "Error",
        message: "No se pudo eliminar el documento",
        type: "error",
      });
    }
  };

  const renderDocumentItem = ({ item }) => {
    const expiryColor = getDocumentExpiryColor(item.expiry_date);

    // Helper function to format date as dd/mm/yyyy
    const formatDate = (dateString) => {
      const [year, month, day] = dateString.split("-");
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    };

    const getExpiryText = (expiryDate) => {
      if (!expiryDate) return null;

      const expiry = new Date(expiryDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysRemaining = Math.floor(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining < 0) {
        return `Vencido hace ${Math.abs(daysRemaining)} día${
          Math.abs(daysRemaining) !== 1 ? "s" : ""
        }`;
      } else if (daysRemaining === 0) {
        return "Vence hoy";
      } else if (daysRemaining === 1) {
        return "Vence en 1 día";
      } else if (daysRemaining < 10) {
        return `Vence en ${daysRemaining} días`;
      } else if (daysRemaining < 30) {
        return `Vence en ${Math.floor(daysRemaining / 7)} semana${
          Math.floor(daysRemaining / 7) !== 1 ? "s" : ""
        }`;
      } else {
        return `Vence en ${Math.floor(daysRemaining / 30)} mes${
          Math.floor(daysRemaining / 30) !== 1 ? "es" : ""
        }`;
      }
    };

    return (
      <View
        style={[
          styles.documentCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.documentInfo}>
          <Ionicons
            name="document-text-outline"
            size={iconSize.md}
            color={colors.primary}
          />
          <View style={styles.documentDetails}>
            <Text style={[styles.documentType, { color: colors.text }]}>
              {item.type_document}
            </Text>
            <Text style={[styles.issueDate, { color: colors.textSecondary }]}>
              Expedición: {formatDate(item.issue_date)}
            </Text>
            {item.expiry_date && (
              <View style={styles.expiryContainer}>
                <Text
                  style={[styles.expiryDate, { color: colors.textSecondary }]}
                >
                  Vencimiento: {formatDate(item.expiry_date)}
                </Text>
                <Text style={[styles.expiryStatus, { color: expiryColor }]}>
                  {getExpiryText(item.expiry_date)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("AddDocument", {
                vehicleId,
                vehicle,
                document: item,
              })
            }
          >
            <Ionicons
              name="create-outline"
              size={iconSize.md}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteDocument(item)}
          >
            <Ionicons name="trash-outline" size={iconSize.md} color="#E53935" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.vehicleHeader}>
          <Text style={[styles.vehicleName, { color: colors.textSecondary }]}>
            {vehicle?.name || "Vehículo"}
          </Text>
        </View>

        <FlatList
          data={documents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDocumentItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={iconSize.xxl}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay documentos registrados
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Presiona el botón + para agregar el primer documento
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() =>
            navigation.navigate("AddDocument", { vehicleId, vehicle })
          }
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
  vehicleHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: "center",
  },
  vehicleName: {
    fontSize: rf(16),
    fontWeight: "600",
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: vs(100),
  },
  documentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: s(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: s(2),
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  documentDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  documentType: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  issueDate: {
    fontSize: rf(14),
    marginBottom: spacing.xxs,
  },
  expiryDate: {
    fontSize: rf(14),
    marginBottom: spacing.xxs,
  },
  expiryContainer: {
    marginTop: spacing.xs,
  },
  expiryStatus: {
    fontSize: rf(14),
    fontWeight: "500",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyText: {
    fontSize: rf(18),
    fontWeight: "600",
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: rf(14),
    marginTop: spacing.xs,
    textAlign: "center",
    paddingHorizontal: hs(40),
  },
  floatingAddButton: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: s(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
  },
});

export default VehicleDocumentsScreen;
