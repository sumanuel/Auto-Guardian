import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";
import { formatKm } from "../../utils/formatUtils";
import { ms, rf } from "../../utils/responsive";

const VehicleCard = ({
  vehicle,
  onPress,
  onEdit,
  onDelete,
  showUpcoming,
  showDialog,
}) => {
  const { colors } = useTheme();
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
        ]
      );
    }
  };

  const handleEdit = () => {
    onEdit(vehicle);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            {vehicle.photo ? (
              <Image
                source={{ uri: vehicle.photo }}
                style={styles.vehicleImage}
              />
            ) : (
              <View
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: colors.disabled },
                ]}
              >
                <Ionicons
                  name="car"
                  size={ms(40)}
                  color={colors.textTertiary}
                />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {vehicle.name}
            </Text>
            <Text
              style={[styles.details, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {vehicle.brand} {vehicle.model}{" "}
              {vehicle.year ? `(${vehicle.year})` : ""}
            </Text>
            <View style={styles.kmContainer}>
              <Ionicons
                name="speedometer-outline"
                size={ms(16)}
                color={colors.primary}
              />
              <Text style={[styles.kmText, { color: colors.primary }]}>
                {formatKm(vehicle.currentKm)}
              </Text>
            </View>

            {showUpcoming && vehicle.upcomingCount > 0 && (
              <View style={styles.badge}>
                <Ionicons
                  name="time-outline"
                  size={ms(14)}
                  color={COLORS.warning}
                />
                <Text style={styles.badgeText}>
                  {vehicle.upcomingCount} próximo
                  {vehicle.upcomingCount > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons
                name="create-outline"
                size={ms(22)}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={ms(22)}
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
    borderRadius: ms(12),
    marginBottom: ms(16),
    elevation: ms(2),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: ms(16),
  },
  imageContainer: {
    marginRight: ms(16),
  },
  vehicleImage: {
    width: ms(70),
    height: ms(70),
    borderRadius: ms(8),
  },
  imagePlaceholder: {
    width: ms(70),
    height: ms(70),
    borderRadius: ms(8),
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: ms(4),
  },
  details: {
    fontSize: rf(14),
    marginBottom: ms(6),
  },
  kmContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  kmText: {
    fontSize: rf(14),
    marginLeft: ms(6),
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: ms(6),
    backgroundColor: "#FFF9E6",
    paddingHorizontal: ms(8),
    paddingVertical: ms(4),
    borderRadius: ms(12),
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: rf(12),
    color: COLORS.warning,
    marginLeft: ms(4),
    fontWeight: "600",
  },
  actions: {
    flexDirection: "column",
    gap: ms(8),
  },
  actionButton: {
    padding: ms(4),
  },
});

export default VehicleCard;
