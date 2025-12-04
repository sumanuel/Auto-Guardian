import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { formatKm } from "../../utils/formatUtils";
import { COLORS } from "../../data/constants";
import { useTheme } from "../../context/ThemeContext";

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
                <Ionicons name="car" size={40} color={colors.textTertiary} />
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
                size={16}
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
                  size={14}
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
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  imageContainer: {
    marginRight: 16,
  },
  vehicleImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginBottom: 6,
  },
  kmContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  kmText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.warning,
    marginLeft: 4,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});

export default VehicleCard;
