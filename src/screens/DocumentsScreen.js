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
import { ms, rf } from "../utils/responsive";

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
              size={ms(16)}
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
          size={ms(20)}
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
              size={ms(24)}
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
                size={ms(64)}
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
    marginBottom: ms(20),
    paddingTop: ms(20),
    paddingHorizontal: ms(20),
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  listContainer: {
    padding: ms(20),
    paddingTop: 0,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: ms(12),
    elevation: ms(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: ms(3),
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    marginBottom: ms(8),
  },
  vehicleName: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: ms(4),
  },
  documentsRow: {
    flexDirection: "row",
    gap: ms(16),
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(4),
  },
  documentText: {
    fontSize: rf(13),
  },
  arrowContainer: {
    marginLeft: ms(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ms(60),
  },
  emptyText: {
    fontSize: rf(18),
    fontWeight: "600",
    marginTop: ms(16),
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: rf(14),
    marginTop: ms(8),
    textAlign: "center",
    paddingHorizontal: ms(40),
  },
  helpButton: {
    padding: ms(8),
  },
});

export default DocumentsScreen;
