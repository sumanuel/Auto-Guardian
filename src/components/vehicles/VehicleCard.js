import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";
import { formatKm } from "../../utils/formatUtils";
import {
  borderRadius,
  hs,
  iconSize,
  ms,
  rf,
  spacing,
  vs,
} from "../../utils/responsive";

const VehicleCard = ({
  vehicle,
  compact = false,
  onPress,
  onEdit,
  onDelete,
  showUpcoming,
  showDialog,
}) => {
  const { colors } = useTheme();
  const imageSize = compact ? ms(54) : ms(64);
  const actionSize = compact ? ms(30) : ms(34);
  const actionIconSize = compact ? ms(16) : ms(18);
  const plateMaxWidth = compact ? "38%" : "42%";
  const verticalPadding = compact ? spacing.sm : spacing.md;
  const horizontalPadding = compact ? spacing.sm : spacing.md;
  const titleSize = compact ? rf(15) : rf(17);
  const metaSize = compact ? rf(12) : rf(13);

  const handleDelete = () => {
    if (showDialog) {
      showDialog({
        title: "Eliminar vehículo",
        message: `¿Estás seguro de eliminar ${vehicle.name}?`,
        type: "confirm",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => onDelete(vehicle.id),
          },
        ],
      });
    } else {
      // Fallback a Alert si no se pasa showDialog
      const Alert = require("react-native").Alert;
      Alert.alert(
        "Eliminar vehículo",
        `¿Estás seguro de eliminar ${vehicle.name}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => onDelete(vehicle.id),
          },
        ],
      );
    }
  };

  const handleEdit = () => {
    onEdit(vehicle);
  };

  const vehicleTitle = vehicle.name || "Vehículo sin nombre";
  const vehicleMeta = [
    vehicle.brand,
    vehicle.model,
    vehicle.year && `${vehicle.year}`,
  ]
    .filter(Boolean)
    .join(" • ");
  const plateLabel = vehicle.plate || "Sin placa";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          marginBottom: compact ? vs(10) : vs(12),
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View
          style={[
            styles.cardContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingVertical: verticalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.imageContainer,
              { marginRight: compact ? hs(10) : hs(12) },
            ]}
          >
            {vehicle.photo ? (
              <Image
                source={{ uri: vehicle.photo }}
                style={[
                  styles.vehicleImage,
                  { width: imageSize, height: imageSize },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: colors.inputBackground },
                  { width: imageSize, height: imageSize },
                ]}
              >
                <Ionicons
                  name="car-sport-outline"
                  size={compact ? ms(24) : ms(28)}
                  color={colors.textSecondary}
                />
              </View>
            )}
            <View
              style={[
                styles.imageBadge,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={iconSize.xs}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.info}>
            <View
              style={[
                styles.titleRow,
                { marginBottom: compact ? vs(3) : vs(4) },
              ]}
            >
              <Text
                style={[
                  styles.name,
                  { color: colors.text, fontSize: titleSize },
                ]}
                numberOfLines={1}
              >
                {vehicleTitle}
              </Text>
              <View
                style={[
                  styles.platePill,
                  { backgroundColor: colors.inputBackground },
                  { maxWidth: plateMaxWidth },
                ]}
              >
                <Text
                  style={[
                    styles.plateText,
                    {
                      color: colors.textSecondary,
                      fontSize: compact ? rf(10) : rf(11),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {plateLabel}
                </Text>
              </View>
            </View>

            {!!vehicleMeta && (
              <Text
                style={[
                  styles.details,
                  {
                    color: colors.textSecondary,
                    fontSize: metaSize,
                    marginBottom: compact ? vs(6) : vs(8),
                  },
                ]}
                numberOfLines={1}
              >
                {vehicleMeta}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.metricPill,
                  { backgroundColor: colors.inputBackground },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={compact ? ms(13) : ms(14)}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.metricText,
                    { color: colors.text, fontSize: compact ? rf(11) : rf(12) },
                  ]}
                >
                  {formatKm(vehicle.currentKm)}
                </Text>
              </View>

              {showUpcoming && vehicle.upcomingCount > 0 && (
                <View style={styles.badge}>
                  <Ionicons
                    name="time-outline"
                    size={compact ? ms(12) : ms(13)}
                    color={COLORS.warning}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      { fontSize: compact ? rf(10) : rf(11) },
                    ]}
                  >
                    {vehicle.upcomingCount} próximo
                    {vehicle.upcomingCount > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.inputBackground },
                {
                  width: actionSize,
                  height: actionSize,
                  borderRadius: actionSize / 2,
                },
              ]}
              onPress={handleEdit}
            >
              <Ionicons
                name="create-outline"
                size={actionIconSize}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.inputBackground },
                {
                  width: actionSize,
                  height: actionSize,
                  borderRadius: actionSize / 2,
                },
              ]}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={actionIconSize}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    elevation: ms(3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: ms(10),
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  vehicleImage: {
    width: ms(64),
    height: ms(64),
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    width: ms(64),
    height: ms(64),
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBadge: {
    position: "absolute",
    right: ms(-6),
    bottom: ms(-6),
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: "center",
    justifyContent: "center",
    elevation: ms(2),
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(4),
  },
  name: {
    flex: 1,
    fontWeight: "800",
    marginRight: hs(8),
  },
  platePill: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(999),
  },
  plateText: {
    fontSize: rf(11),
    fontWeight: "700",
    textTransform: "uppercase",
  },
  details: {},
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: hs(8),
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(999),
  },
  metricText: {
    marginLeft: hs(6),
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(999),
  },
  badgeText: {
    color: COLORS.warning,
    marginLeft: hs(4),
    fontWeight: "600",
  },
  actions: {
    flexDirection: "column",
    marginLeft: hs(10),
    gap: vs(8),
  },
  actionButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default VehicleCard;
