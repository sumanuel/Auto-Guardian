import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Button from "../components/common/Button";
import SearchBar from "../components/common/SearchBar";
import VehicleCard from "../components/vehicles/VehicleCard";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../data/constants";
import { useDialog } from "../hooks/useDialog";
import { ms, rf } from "../utils/responsive";

const HomeScreen = ({ navigation }) => {
  const {
    vehicles,
    loading,
    loadVehicles,
    removeVehicle,
    getUpcomingMaintenances,
    checkPendingMaintenances,
    notificationsEnabled,
  } = useApp();
  const { DialogComponent, showDialog } = useDialog();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredVehicles, setFilteredVehicles] = React.useState([]);
  const [alertSummary, setAlertSummary] = React.useState(null);

  React.useEffect(() => {
    loadAlertSummary();
  }, [vehicles]);

  const loadAlertSummary = async () => {
    if (!checkPendingMaintenances) return;

    const summary = await checkPendingMaintenances();
    if (summary) {
      setAlertSummary(summary);
    }
  };

  const showAlertDetails = () => {
    navigation.navigate("AlertSummary", { summary: alertSummary });
  };

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      const vehiclesWithUpcoming = vehicles.map((v) => ({
        ...v,
        upcomingCount: getUpcomingMaintenances(v.id, v.currentKm).length,
      }));
      setFilteredVehicles(vehiclesWithUpcoming);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vehicles
        .filter(
          (v) =>
            (v.name || "").toLowerCase().includes(query) ||
            (v.brand || "").toLowerCase().includes(query) ||
            (v.model || "").toLowerCase().includes(query) ||
            (v.plate || "").toLowerCase().includes(query)
        )
        .map((v) => ({
          ...v,
          upcomingCount: getUpcomingMaintenances(v.id, v.currentKm).length,
        }));
      setFilteredVehicles(filtered);
    }
  }, [vehicles, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const renderVehicleCard = ({ item }) => (
    <VehicleCard
      vehicle={item}
      onPress={() =>
        navigation.navigate("VehicleDetail", { vehicleId: item.id })
      }
      onEdit={(vehicle) => navigation.navigate("AddVehicle", { vehicle })}
      onDelete={handleDeleteVehicle}
      showUpcoming
      showDialog={showDialog}
    />
  );

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await removeVehicle(vehicleId);
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="car-sport-outline"
        size={ms(80)}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No hay vehículos registrados
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Agrega tu primer vehículo para comenzar a llevar el control de su
        mantenimiento
      </Text>
      <Button
        title="Agregar Vehículo"
        onPress={() => navigation.navigate("AddVehicle")}
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading) {
    return (
      <DialogComponent>
        <View style={styles.loadingContainer}>
          <Text>Cargando...</Text>
        </View>
      </DialogComponent>
    );
  }

  return (
    <DialogComponent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Auto Guardian</Text>
            <Text style={styles.headerSubtitle}>
              {vehicles.length} vehículo{vehicles.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Badge de alertas */}
          {alertSummary &&
            (alertSummary.totalOverdue > 0 ||
              alertSummary.totalUrgent > 0 ||
              (alertSummary.totalDocuments || 0) > 0) && (
              <TouchableOpacity
                style={styles.alertBadge}
                onPress={showAlertDetails}
              >
                <Ionicons
                  name="notifications"
                  size={ms(24)}
                  color={
                    alertSummary.totalOverdue > 0
                      ? COLORS.danger
                      : COLORS.warning
                  }
                />
                <View
                  style={[
                    styles.alertCount,
                    {
                      backgroundColor:
                        alertSummary.totalOverdue > 0
                          ? COLORS.danger
                          : COLORS.warning,
                    },
                  ]}
                >
                  <Text style={styles.alertCountText}>
                    {alertSummary.totalOverdue +
                      alertSummary.totalUrgent +
                      (alertSummary.totalDocuments || 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
        </View>

        {vehicles.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBarContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar vehículo..."
                onClear={() => setSearchQuery("")}
              />
            </View>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() =>
                showDialog({
                  title: "Inicio",
                  message:
                    "Aquí puedes ver todos tus vehículos registrados. Presiona sobre cualquier vehículo para ver opciones adicionales. El badge de notificaciones te informa sobre mantenimientos pendientes o vencidos.",
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
        )}

        {vehicles.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderEmptyState()}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderVehicleCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              searchQuery.trim() !== "" && (
                <View style={styles.noResultsContainer}>
                  <Ionicons
                    name="search-outline"
                    size={ms(60)}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.noResultsText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No se encontraron vehículos
                  </Text>
                </View>
              )
            }
          />
        )}

        {vehicles.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate("AddVehicle")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={ms(30)} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </DialogComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: ms(20),
    paddingTop: ms(50),
    paddingBottom: ms(30),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: rf(28),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: ms(4),
  },
  headerSubtitle: {
    fontSize: rf(16),
    color: "#fff",
    opacity: 0.9,
  },
  alertBadge: {
    position: "relative",
    padding: ms(8),
  },
  alertCount: {
    position: "absolute",
    top: ms(4),
    right: ms(4),
    minWidth: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: ms(2),
    borderColor: "#fff",
  },
  alertCountText: {
    color: "#fff",
    fontSize: rf(12),
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
  },
  searchBarContainer: {
    flex: 1,
  },
  helpButton: {
    padding: ms(8),
  },
  listContent: {
    padding: ms(16),
  },
  scrollContent: {
    flexGrow: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ms(60),
  },
  noResultsText: {
    fontSize: rf(16),
    marginTop: ms(16),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: ms(32),
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    marginTop: ms(16),
    marginBottom: ms(8),
  },
  emptySubtitle: {
    fontSize: rf(14),
    textAlign: "center",
    marginBottom: ms(24),
  },
  emptyButton: {
    minWidth: ms(200),
  },
  fab: {
    position: "absolute",
    right: ms(20),
    bottom: ms(20),
    backgroundColor: COLORS.primary,
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: ms(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: ms(4),
  },
});

export default HomeScreen;
