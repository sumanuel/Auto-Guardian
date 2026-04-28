import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
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

const formatDateLabel = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const getExpiryMeta = (expiryDate) => {
  if (!expiryDate) {
    return {
      label: "Sin vencimiento",
      tone: "rgba(107,114,128,0.12)",
    };
  }

  const expiry = new Date(expiryDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  const color = getDocumentExpiryColor(expiryDate);

  if (daysRemaining < 0) {
    return {
      label: `Vencido hace ${Math.abs(daysRemaining)} día${Math.abs(daysRemaining) !== 1 ? "s" : ""}`,
      color,
      tone: `${color}20`,
    };
  }
  if (daysRemaining === 0) {
    return { label: "Vence hoy", color, tone: `${color}20` };
  }
  return {
    label: `Vence en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`,
    color,
    tone: `${color}20`,
  };
};

const HeroMetricCard = ({ icon, label, value, accent }) => (
  <View style={[styles.heroMetricCard, { borderColor: accent }]}>
    <View
      style={[styles.heroMetricIconWrap, { backgroundColor: `${accent}22` }]}
    >
      <Ionicons name={icon} size={iconSize.sm} color="#fff" />
    </View>
    <Text style={styles.heroMetricValue}>{value}</Text>
    <Text style={styles.heroMetricLabel}>{label}</Text>
  </View>
);

const VehicleDocumentsScreen = ({ navigation, route }) => {
  const { vehicleId, vehicle } = route.params;
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [documents, setDocuments] = useState([]);

  const documentStats = useMemo(() => {
    const totals = documents.reduce(
      (accumulator, document) => {
        if (!document.expiry_date) {
          accumulator.valid += 1;
          return accumulator;
        }

        const expiry = new Date(document.expiry_date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysRemaining = Math.floor(
          (expiry - today) / (1000 * 60 * 60 * 24),
        );

        if (daysRemaining <= 30) {
          accumulator.review += 1;
        } else {
          accumulator.valid += 1;
        }

        return accumulator;
      },
      { total: documents.length, valid: 0, review: 0 },
    );

    return totals;
  }, [documents]);
  const vehicleMeta = [
    vehicle?.brand,
    vehicle?.model,
    vehicle?.year && `${vehicle.year}`,
  ]
    .filter(Boolean)
    .join(" • ");

  const loadDocuments = useCallback(() => {
    const docs = getVehicleDocuments(vehicleId);
    setDocuments(docs);
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments]),
  );

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
    const expiryMeta = getExpiryMeta(item.expiry_date);

    return (
      <View
        style={[
          styles.documentCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.documentTopRow}>
          <View style={styles.documentInfo}>
            <View
              style={[
                styles.documentIconWrap,
                { backgroundColor: `${expiryColor}16` },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={iconSize.md}
                color={expiryColor}
              />
            </View>
            <View style={styles.documentDetails}>
              <Text
                style={[styles.documentType, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.type_document}
              </Text>

              <View style={styles.documentMetaWrap}>
                <View
                  style={[
                    styles.documentMetaPill,
                    { backgroundColor: colors.inputBackground },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={iconSize.xs}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.issueDate, { color: colors.textSecondary }]}
                  >
                    Expedición {formatDateLabel(item.issue_date)}
                  </Text>
                </View>
                {item.expiry_date && (
                  <View
                    style={[
                      styles.documentMetaPill,
                      { backgroundColor: colors.inputBackground },
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={iconSize.xs}
                      color={expiryColor}
                    />
                    <Text
                      style={[
                        styles.expiryDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDateLabel(item.expiry_date)}
                    </Text>
                  </View>
                )}
                {item.expiry_date && (
                  <View
                    style={[
                      styles.expiryPill,
                      { backgroundColor: expiryMeta.tone },
                    ]}
                  >
                    <Text
                      style={[
                        styles.expiryPillText,
                        { color: expiryMeta.color || colors.textSecondary },
                      ]}
                    >
                      {expiryMeta.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: colors.inputBackground },
              ]}
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
              style={[
                styles.deleteButton,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={() => handleDeleteDocument(item)}
            >
              <Ionicons
                name="trash-outline"
                size={iconSize.md}
                color="#E53935"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
              {vehicle?.photo ? (
                <Image
                  source={{ uri: vehicle.photo }}
                  style={styles.vehicleImage}
                />
              ) : (
                <View
                  style={[styles.imagePlaceholder, styles.heroImagePlaceholder]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={s(44)}
                    color="#D6E7FF"
                  />
                </View>
              )}

              <View style={styles.headerInfo}>
                <Text style={styles.heroEyebrow}>Expediente</Text>
                <Text style={styles.heroTitle}>
                  {vehicle?.name || "Vehículo"}
                </Text>
                {!!vehicleMeta && (
                  <Text style={styles.heroSubtitle}>{vehicleMeta}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.helpButtonHero}
              onPress={() =>
                showDialog({
                  title: "Expediente del vehículo",
                  message:
                    "Aquí puedes revisar los documentos cargados, controlar vencimientos y editar cada archivo del vehículo desde un solo lugar.",
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

          <View style={styles.heroStatsGrid}>
            <HeroMetricCard
              icon="document-text-outline"
              label="Documentos"
              value={documentStats.total}
              accent={COLORS.warning}
            />
            <HeroMetricCard
              icon="checkmark-done-outline"
              label="Al día"
              value={documentStats.valid}
              accent="#8ED1FF"
            />
            <HeroMetricCard
              icon="alert-circle-outline"
              label="Por revisar"
              value={documentStats.review}
              accent="#B8F1C6"
            />
          </View>
        </LinearGradient>

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
  heroGradient: {
    paddingHorizontal: hs(20),
    paddingTop: vs(18),
    paddingBottom: vs(18),
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
  vehicleImage: {
    width: s(78),
    height: s(78),
    borderRadius: borderRadius.md,
    marginRight: hs(12),
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
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: vs(4),
    color: "rgba(255,255,255,0.74)",
  },
  heroTitle: {
    fontSize: rf(22),
    fontWeight: "800",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: rf(13),
    color: "rgba(255,255,255,0.84)",
    marginTop: vs(4),
    marginBottom: vs(4),
  },
  helpButtonHero: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: hs(12),
  },
  heroStatsGrid: {
    flexDirection: "row",
    gap: hs(8),
    marginTop: vs(18),
  },
  heroMetricCard: {
    flex: 1,
    minHeight: vs(92),
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroMetricIconWrap: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: vs(10),
  },
  heroMetricValue: {
    fontSize: rf(16),
    fontWeight: "800",
    color: "#fff",
    marginBottom: vs(3),
  },
  heroMetricLabel: {
    fontSize: rf(11),
    fontWeight: "600",
    color: "rgba(255,255,255,0.74)",
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: 0,
    marginTop: vs(14),
  },
  documentCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: vs(76),
    shadowOpacity: 0.08,
    shadowRadius: s(10),
  },
  width: s(28),
  height: s(28),
  borderRadius: s(14),
  justifyContent: "space-between",
  gap: hs(10),
  marginBottom: vs(8),
  documentInfo: {
    flexDirection: "row",
    fontSize: rf(18),
    flex: 1,
    minWidth: 0,
  },
  documentIconWrap: {
    width: s(44),
    fontSize: rf(10),
    borderRadius: s(22),
    alignItems: "center",
    justifyContent: "center",
  },
  documentDetails: {
    flex: 1,
    marginLeft: spacing.sm,
    minWidth: 0,
  },
  documentType: {
    fontSize: rf(16),
    fontWeight: "700",
    lineHeight: rf(22),
    marginBottom: spacing.sm,
  },
  expiryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  expiryPillText: {
    fontSize: rf(10),
    fontWeight: "800",
    textTransform: "uppercase",
  },
  documentMetaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(8),
  },
  documentMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: s(999),
  },
  issueDate: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  expiryDate: {
    fontSize: rf(12),
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  editButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    alignItems: "center",
    justifyContent: "center",
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
