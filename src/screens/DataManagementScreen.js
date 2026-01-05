import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useDialog } from "../hooks/useDialog";
import { useResponsive } from "../hooks/useResponsive";
import {
  exportDatabaseBackup,
  importDatabaseBackupFromUri,
  pickBackupFile,
  shareBackupFile,
} from "../services/backup/backupService";
import { getAllVehicles } from "../services/vehicleService";

const DataManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { DialogComponent, showDialog } = useDialog();
  const { scale, verticalScale, moderateScale } = useResponsive();
  const [backupBusy, setBackupBusy] = useState(false);

  // Crear estilos responsivos
  const responsiveStyles = {
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(15),
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    backButton: {
      padding: scale(5),
    },
    title: {
      fontSize: moderateScale(20),
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
    },
    infoButton: {
      padding: scale(5),
    },
    content: {
      flex: 1,
      padding: scale(20),
    },
    card: {
      borderRadius: scale(12),
      padding: scale(20),
      marginBottom: verticalScale(20),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(20),
    },
    cardInfo: {
      flex: 1,
      marginLeft: scale(15),
    },
    cardTitle: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
      marginBottom: verticalScale(4),
    },
    cardSubtitle: {
      fontSize: moderateScale(14),
      lineHeight: moderateScale(20),
    },
    actionsContainer: {
      gap: verticalScale(12),
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(20),
      borderRadius: scale(10),
      gap: scale(10),
    },
    actionButtonText: {
      color: "#fff",
      fontSize: moderateScale(16),
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: verticalScale(20),
      padding: scale(15),
      backgroundColor: "rgba(255, 193, 7, 0.1)",
      borderRadius: scale(8),
      gap: scale(10),
    },
    infoText: {
      fontSize: moderateScale(14),
      lineHeight: moderateScale(20),
      flex: 1,
    },
    dataList: {
      gap: verticalScale(12),
    },
    dataItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    dataItemText: {
      fontSize: moderateScale(16),
      flex: 1,
    },
  };

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
      style={[
        responsiveStyles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={responsiveStyles.header}>
        <TouchableOpacity
          style={responsiveStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[responsiveStyles.title, { color: colors.text }]}>
          Gestión de Datos
        </Text>
        <TouchableOpacity
          style={responsiveStyles.infoButton}
          onPress={showBackupInfo}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={responsiveStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            responsiveStyles.card,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={responsiveStyles.cardHeader}>
            <Ionicons name="server-outline" size={32} color={colors.primary} />
            <View style={responsiveStyles.cardInfo}>
              <Text
                style={[responsiveStyles.cardTitle, { color: colors.text }]}
              >
                Respaldos y Gestión
              </Text>
              <Text
                style={[
                  responsiveStyles.cardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Exporta e importa tus datos de Auto Guardian
              </Text>
            </View>
          </View>

          <View style={responsiveStyles.actionsContainer}>
            <TouchableOpacity
              style={[
                responsiveStyles.actionButton,
                { backgroundColor: colors.primary },
                backupBusy && responsiveStyles.buttonDisabled,
              ]}
              onPress={handleExportData}
              disabled={backupBusy}
            >
              {backupBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={responsiveStyles.actionButtonText}>
                    Exportar Datos
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                responsiveStyles.actionButton,
                { borderColor: colors.primary, borderWidth: 1 },
                backupBusy && responsiveStyles.buttonDisabled,
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
                    style={[
                      responsiveStyles.actionButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Importar Datos
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={responsiveStyles.infoContainer}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text
              style={[
                responsiveStyles.infoText,
                { color: colors.textSecondary },
              ]}
            >
              La importación reemplazará todos los datos actuales. Asegúrate de
              tener un respaldo antes de importar.
            </Text>
          </View>
        </View>

        <View
          style={[
            responsiveStyles.card,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={responsiveStyles.cardHeader}>
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={colors.success || "#4CAF50"}
            />
            <View style={responsiveStyles.cardInfo}>
              <Text
                style={[responsiveStyles.cardTitle, { color: colors.text }]}
              >
                Datos Incluidos
              </Text>
              <Text
                style={[
                  responsiveStyles.cardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Información que se respalda
              </Text>
            </View>
          </View>

          <View style={responsiveStyles.dataList}>
            <View style={responsiveStyles.dataItem}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
              <Text
                style={[responsiveStyles.dataItemText, { color: colors.text }]}
              >
                Vehículos registrados
              </Text>
            </View>
            <View style={responsiveStyles.dataItem}>
              <Ionicons name="build-outline" size={20} color={colors.primary} />
              <Text
                style={[responsiveStyles.dataItemText, { color: colors.text }]}
              >
                Historial de mantenimientos
              </Text>
            </View>
            <View style={responsiveStyles.dataItem}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[responsiveStyles.dataItemText, { color: colors.text }]}
              >
                Documentos guardados
              </Text>
            </View>
            <View style={responsiveStyles.dataItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[responsiveStyles.dataItemText, { color: colors.text }]}
              >
                Contactos y proveedores
              </Text>
            </View>
            <View style={responsiveStyles.dataItem}>
              <Ionicons
                name="settings-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[responsiveStyles.dataItemText, { color: colors.text }]}
              >
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

export default DataManagementScreen;
