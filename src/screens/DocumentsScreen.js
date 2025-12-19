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
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { getVehicleDocuments } from "../services/vehicleDocumentService";

const DocumentsScreen = ({ navigation }) => {
  const { vehicles } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [vehiclesWithDocs, setVehiclesWithDocs] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadVehiclesWithDocuments();
    }, [vehicles])
  );

  const loadVehiclesWithDocuments = () => {
    const vehiclesWithDocuments = vehicles.map((vehicle) => {
      const documents = getVehicleDocuments(vehicle.id);
      return {
        ...vehicle,
        documentCount: documents.length,
        documents: documents,
      };
    });
    setVehiclesWithDocs(vehiclesWithDocuments);
  };

  // Usar datos del estado si existen, sino calcular
  const displayVehicles =
    vehiclesWithDocs.length > 0
      ? vehiclesWithDocs
      : vehicles.map((vehicle) => {
          const documents = getVehicleDocuments(vehicle.id);
          return {
            ...vehicle,
            documentCount: documents.length,
            documents: documents,
          };
        });

  const handleVehiclePress = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    navigation.navigate("VehicleDocuments", { vehicleId, vehicle });
  };

  const renderVehicleCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.vehicleCard,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => handleVehiclePress(item.id)}
    >
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleHeader}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {item.name}
          </Text>
        </View>
        <View style={styles.documentsRow}>
          <View style={styles.documentItem}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.documentText, { color: colors.textSecondary }]}
            >
              {item.documentCount}{" "}
              {item.documentCount === 1 ? "documento" : "documentos"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Documentos
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              showDialog({
                title: "Gestión de Documentos",
                message:
                  "Aquí puedes ver y gestionar todos los documentos asociados a tus vehículos. Organizados por vehículo, incluye licencias, seguros, revisiones técnicas y otros documentos importantes. Mantén al día la información de vencimiento para evitar multas o problemas legales.",
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
          data={displayVehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVehicleCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="car-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tienes vehículos registrados
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Agrega un vehículo para gestionar sus documentos
              </Text>
            </View>
          }
        />
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  documentsRow: {
    flexDirection: "row",
    gap: 16,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  documentText: {
    fontSize: 13,
  },
  arrowContainer: {
    marginLeft: 12,
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
  helpButton: {
    padding: 8,
  },
});

export default DocumentsScreen;
