import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  exportDatabaseBackup,
  importDatabaseBackupFromUri,
  pickBackupFile,
  shareBackupFile,
} from "../services/backup/backupService";

const DataManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [backupBusy, setBackupBusy] = useState(false);

  const handleExportData = async () => {
    try {
      setBackupBusy(true);
      const { uri } = await exportDatabaseBackup();
      await shareBackupFile(uri);
      Alert.alert(
        "Respaldo creado",
        "Tus datos fueron exportados correctamente.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Error", "No se pudo exportar el respaldo.", [
        { text: "OK" },
      ]);
    } finally {
      setBackupBusy(false);
    }
  };

  const doImport = async () => {
    try {
      setBackupBusy(true);
      const file = await pickBackupFile();
      if (!file) return;

      await importDatabaseBackupFromUri(file.uri);

      Alert.alert(
        "Respaldo importado",
        "Los datos se importaron correctamente. La aplicación se reiniciará.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error importing data:", error);
      Alert.alert(
        "Error",
        error?.message || "No se pudo importar el respaldo.",
        [{ text: "OK" }]
      );
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      "Importar datos",
      "Esto reemplazará los datos actuales por los del respaldo. ¿Deseas continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Importar", onPress: doImport },
      ]
    );
  };

  const showBackupInfo = () => {
    Alert.alert(
      "💡 Recomendación de respaldo",
      "Te recomendamos guardar tus respaldos en Google Drive u otro servicio en la nube para tener una copia segura fuera de tu dispositivo.\n\nEsto te protegerá en caso de pérdida, robo o daño del teléfono.",
      [{ text: "Entendido" }]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Gestión de Datos
        </Text>
        <TouchableOpacity style={styles.infoButton} onPress={showBackupInfo}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={32} color={colors.primary} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Respaldos y Gestión
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.textSecondary }]}
              >
                Exporta e importa tus datos de Auto Guardian
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary },
                backupBusy && styles.buttonDisabled,
              ]}
              onPress={handleExportData}
              disabled={backupBusy}
            >
              {backupBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Exportar Datos</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: colors.primary, borderWidth: 1 },
                backupBusy && styles.buttonDisabled,
              ]}
              onPress={handleImportData}
              disabled={backupBusy}
            >
              {backupBusy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.actionButtonText, { color: colors.primary }]}
                  >
                    Importar Datos
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              La importación reemplazará todos los datos actuales. Asegúrate de
              tener un respaldo antes de importar.
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={colors.success || "#4CAF50"}
            />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Datos Incluidos
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.textSecondary }]}
              >
                Información que se respalda
              </Text>
            </View>
          </View>

          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Vehículos registrados
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="build-outline" size={20} color={colors.primary} />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Historial de mantenimientos
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Documentos guardados
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Contactos y proveedores
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="settings-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Configuración de la app
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  dataList: {
    gap: 12,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dataItemText: {
    fontSize: 16,
    flex: 1,
  },
});

export default DataManagementScreen;
