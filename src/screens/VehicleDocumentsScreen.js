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

  const handleDeleteDocument = (document) => {
    showDialog({
      title: "Eliminar Documento",
      message: `¿Estás seguro de que quieres eliminar "${document.type_document}"?`,
      type: "warning",
      onConfirm: () => {
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
      },
    });
  };

  const renderDocumentItem = ({ item }) => {
    const isExpired =
      item.expiry_date && new Date(item.expiry_date) < new Date();
    const isExpiringSoon =
      item.expiry_date &&
      new Date(item.expiry_date) <=
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
      new Date(item.expiry_date) > new Date();

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
            size={24}
            color={colors.primary}
          />
          <View style={styles.documentDetails}>
            <Text style={[styles.documentType, { color: colors.text }]}>
              {item.type_document}
            </Text>
            <Text style={[styles.issueDate, { color: colors.textSecondary }]}>
              Expedición: {new Date(item.issue_date).toLocaleDateString()}
            </Text>
            {item.expiry_date && (
              <Text
                style={[
                  styles.expiryDate,
                  {
                    color: isExpired
                      ? "#E53935"
                      : isExpiringSoon
                      ? "#FF9800"
                      : colors.textSecondary,
                  },
                ]}
              >
                Vencimiento: {new Date(item.expiry_date).toLocaleDateString()}
                {isExpired && " (VENCIDO)"}
                {isExpiringSoon && " (VENCE PRONTO)"}
              </Text>
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
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteDocument(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
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
                size={64}
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
          <Ionicons name="add" size={24} color="white" />
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
    padding: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  documentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  issueDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: "500",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
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
});

export default VehicleDocumentsScreen;
