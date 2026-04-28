import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { getVehicleDocuments } from "../services/vehicleDocumentService";
import { getDocumentExpiryColor } from "../utils/formatUtils";
import { borderRadius, hs, iconSize, ms, rf, s, vs } from "../utils/responsive";

const getDocumentHealth = (documents) => {
  if (!documents.length) {
    return {
      label: "Sin archivos",
      color: "#6B7280",
      tone: "rgba(107,114,128,0.12)",
      urgentCount: 0,
    };
  }

  const urgentCount = documents.filter((document) => {
    if (!document.expiry_date) return false;
    const expiry = new Date(document.expiry_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 15;
  }).length;

  if (urgentCount > 0) {
    return {
      label: `${urgentCount} por revisar`,
      color: "#ff6b00",
      tone: "rgba(255,107,0,0.12)",
      urgentCount,
    };
  }

  return {
    label: "Al día",
    color: "#00C851",
    tone: "rgba(0,200,81,0.12)",
    urgentCount: 0,
  };
};

const getNextExpiryText = (documents) => {
  const documentsWithExpiry = documents.filter(
    (document) => document.expiry_date,
  );
  if (!documentsWithExpiry.length) return "Sin vencimientos registrados";

  const nextDocument = [...documentsWithExpiry].sort(
    (a, b) => new Date(a.expiry_date) - new Date(b.expiry_date),
  )[0];

  const expiryColor = getDocumentExpiryColor(nextDocument.expiry_date);
  const expiry = new Date(nextDocument.expiry_date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0)
    return {
      text: `${nextDocument.type_document} vencido`,
      color: expiryColor,
    };
  if (daysRemaining === 0)
    return {
      text: `${nextDocument.type_document} vence hoy`,
      color: expiryColor,
    };
  return {
    text: `${nextDocument.type_document} en ${daysRemaining} días`,
    color: expiryColor,
  };
};

const DocumentsScreen = ({ navigation }) => {
  const { vehicles } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [vehiclesWithDocs, setVehiclesWithDocs] = useState([]);

  const loadVehiclesWithDocuments = useCallback(() => {
    const vehiclesWithDocuments = vehicles.map((vehicle) => {
      const documents = getVehicleDocuments(vehicle.id);
      return {
        ...vehicle,
        documentCount: documents.length,
        documents: documents,
      };
    });
    setVehiclesWithDocs(vehiclesWithDocuments);
  }, [vehicles]);

  useFocusEffect(
    useCallback(() => {
      loadVehiclesWithDocuments();
    }, [loadVehiclesWithDocuments]),
  );

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
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => handleVehiclePress(item.id)}
    >
      {(() => {
        const health = getDocumentHealth(item.documents);
        const nextExpiry = getNextExpiryText(item.documents);

        return (
          <>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleHeader}>
                <View
                  style={[
                    styles.vehicleIconWrap,
                    { backgroundColor: colors.inputBackground },
                  ]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={iconSize.sm}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.vehicleTitleWrap}>
                  <View style={styles.vehicleTitleRow}>
                    <Text style={[styles.vehicleName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: health.tone },
                      ]}
                    >
                      <Text
                        style={[styles.statusPillText, { color: health.color }]}
                      >
                        {health.label}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.vehicleHint,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.documentCount}{" "}
                    {item.documentCount === 1 ? "documento" : "documentos"}{" "}
                    registrados
                  </Text>
                </View>
              </View>

              <View style={styles.documentsRow}>
                <View
                  style={[
                    styles.metaPill,
                    { backgroundColor: colors.inputBackground },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={iconSize.xs}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.documentText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Expediente activo
                  </Text>
                </View>
                <View
                  style={[
                    styles.metaPill,
                    { backgroundColor: colors.inputBackground },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={iconSize.xs}
                    color={nextExpiry.color || colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.documentText,
                      { color: nextExpiry.color || colors.textSecondary },
                    ]}
                  >
                    {nextExpiry.text}
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
          </>
        );
      })()}
    </TouchableOpacity>
  );

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[COLORS.primary, "#0F5FD2", "#0A3F8F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroMediaRow}>
              <View
                style={[styles.imagePlaceholder, styles.heroImagePlaceholder]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={s(44)}
                  color="#D6E7FF"
                />
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.headerEyebrow}>Centro documental</Text>
                <Text style={styles.headerTitle}>Documentos</Text>
                <Text style={styles.headerSubtitle}>
                  Controla vencimientos, expedientes y estado legal por
                  vehículo.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
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
                size={iconSize.lg}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

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
  heroGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(18),
    paddingBottom: vs(18),
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroMediaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(12),
  },
  heroImagePlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerInfo: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.74)",
  },
  headerTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    marginTop: vs(4),
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.84)",
  },
  listContainer: {
    paddingHorizontal: hs(16),
    paddingVertical: ms(20),
    paddingTop: vs(14),
    paddingBottom: ms(32),
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: ms(18),
    borderWidth: 1,
    padding: ms(16),
    marginBottom: ms(12),
    elevation: ms(2),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: ms(10),
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: ms(10),
  },
  vehicleIconWrap: {
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    alignItems: "center",
    justifyContent: "center",
    marginRight: hs(12),
  },
  vehicleTitleWrap: {
    flex: 1,
  },
  vehicleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: hs(8),
  },
  vehicleName: {
    fontSize: rf(18),
    fontWeight: "800",
    flex: 1,
  },
  vehicleHint: {
    fontSize: rf(13),
    marginTop: ms(4),
  },
  statusPill: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  statusPillText: {
    fontSize: rf(10),
    fontWeight: "800",
    textTransform: "uppercase",
  },
  documentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ms(8),
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  documentText: {
    fontSize: rf(13),
    fontWeight: "600",
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
    fontSize: rf(17),
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
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DocumentsScreen;
