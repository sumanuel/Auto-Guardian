import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import {
  exportDatabaseBackup,
  importDatabaseBackupFromUri,
  pickBackupFile,
  shareBackupFile,
} from "../services/backup/backupService";
import { getAllVehicles } from "../services/vehicleService";
import {
  borderRadius,
  iconSize,
  ms,
  rf,
  s,
  spacing,
} from "../utils/responsive";

const DataManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const [backupBusy, setBackupBusy] = useState(false);

  const handleExportData = async () => {
    try {
      // Verificar que haya al menos un vehículo registrado
      const vehicles = getAllVehicles();
      if (!vehicles || vehicles.length === 0) {
        showDialog({
          title: "No hay datos para respaldar",
          message:
            "Debes tener al menos un vehículo registrado para crear un respaldo.",
          type: "warning",
        });
        return;
      }

      setBackupBusy(true);
      const { uri } = await exportDatabaseBackup();
      await shareBackupFile(uri);
      showDialog({
        title: "Respaldo creado",
        message: "Tus datos fueron exportados correctamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      showDialog({
        title: "Error",
        message: "No se pudo exportar el respaldo.",
        type: "error",
      });
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

      showDialog({
        title: "Respaldo importado",
        message:
          "Los datos se importaron correctamente. Por favor, reinicia la aplicación manualmente para ver los cambios.",
        type: "success",
        buttons: [{ text: "Entendido", onPress: () => navigation.goBack() }],
      });
    } catch (error) {
      console.error("Error importing data:", error);
      showDialog({
        title: "Error",
        message: error?.message || "No se pudo importar el respaldo.",
        type: "error",
      });
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImportData = async () => {
    const confirmed = await showDialog({
      title: "Importar datos",
      message:
        "Esto reemplazará los datos actuales por los del respaldo. ¿Deseas continuar?",
      type: "confirm",
    });

    if (confirmed) {
      doImport();
    }
  };

  const showBackupInfo = () => {
    showDialog({
      title: "💡 Recomendación de respaldo",
      message:
        "Te recomendamos guardar tus respaldos en Google Drive u otro servicio en la nube para tener una copia segura fuera de tu dispositivo.\n\nEsto te protegerá en caso de pérdida, robo o daño del teléfono.",
      type: "info",
    });
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
          <Ionicons name="arrow-back" size={iconSize.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Gestión de Datos
        </Text>
        <TouchableOpacity style={styles.infoButton} onPress={showBackupInfo}>
          <Ionicons
            name="information-circle-outline"
            size={iconSize.md}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="server-outline"
              size={iconSize.lg}
              color={colors.primary}
            />
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
                  <Ionicons
                    name="download-outline"
                    size={iconSize.sm}
                    color="#fff"
                  />
                  <Text style={styles.actionButtonText}>Exportar Datos</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: colors.primary, borderWidth: ms(1) },
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
                    size={iconSize.sm}
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
              size={iconSize.sm}
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
              size={iconSize.lg}
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
              <Ionicons
                name="car-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Vehículos registrados
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="build-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Historial de mantenimientos
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="document-text-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Documentos guardados
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="person-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Contactos y proveedores
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons
                name="settings-outline"
                size={iconSize.sm}
                color={colors.primary}
              />
              <Text style={[styles.dataItemText, { color: colors.text }]}>
                Configuración de la app
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <DialogComponent />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: s(1),
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: rf(20),
    fontWeight: "bold",
  },
  infoButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: s(3),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: rf(14),
    lineHeight: rf(20),
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: borderRadius.sm,
    gap: spacing.md,
  },
  infoText: {
    fontSize: rf(14),
    lineHeight: rf(20),
    flex: 1,
  },
  dataList: {
    gap: spacing.md,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dataItemText: {
    fontSize: rf(16),
    flex: 1,
  },
});

export default DataManagementScreen;
