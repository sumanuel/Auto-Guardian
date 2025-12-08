import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getMaintenanceTypes } from "../services/maintenanceService";

const CategoriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const types = getMaintenanceTypes();
    setCategories(types);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Categorías de Mantenimiento
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {categories.map((type) => (
          <View
            key={type.id}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.typeItem}>
              <View style={styles.typeInfo}>
                <Ionicons
                  name={type.icon || "construct-outline"}
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.typeDetails}>
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {type.name}
                  </Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {type.category}
                  </Text>
                  <View style={styles.intervalsContainer}>
                    <View style={styles.intervalRow}>
                      <Ionicons
                        name="speedometer-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.intervalText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cada {type.defaultIntervalKm?.toLocaleString()} km
                      </Text>
                    </View>
                    <View style={styles.intervalRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.intervalText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cada {type.defaultIntervalMonths} meses
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  typeDetails: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  intervalsContainer: {
    marginTop: 8,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  intervalText: {
    fontSize: 13,
    lineHeight: 16,
  },
  editButton: {
    padding: 8,
    marginTop: 4,
  },
});

export default CategoriesScreen;
