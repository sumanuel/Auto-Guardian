import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../data/constants";

const AlertModal = ({ visible, onClose, summary }) => {
  const { colors } = useTheme();

  if (!summary) return null;

  const overdueAlerts = summary.alerts.filter((a) => a.type === "overdue");
  const urgentAlerts = summary.alerts.filter((a) => a.type === "urgent");

  const hasAlerts = overdueAlerts.length > 0 || urgentAlerts.length > 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              {hasAlerts ? (
                <>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={32}
                      color={COLORS.warning}
                    />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Resumen de Alertas
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.iconContainer, styles.iconSuccess]}>
                    <Ionicons
                      name="checkmark-circle"
                      size={32}
                      color={COLORS.success}
                    />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Todo al día
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!hasAlerts ? (
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No tienes mantenimientos pendientes o vencidos en este
                  momento.
                </Text>
              </View>
            ) : (
              <>
                {/* Vencidos */}
                {overdueAlerts.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons
                        name="warning"
                        size={20}
                        color={COLORS.danger}
                      />
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        URGENTES ({overdueAlerts.length})
                      </Text>
                    </View>
                    {overdueAlerts.map((alert, index) => (
                      <View
                        key={index}
                        style={[
                          styles.alertCard,
                          { backgroundColor: colors.inputBackground },
                        ]}
                      >
                        <View
                          style={[
                            styles.alertIndicator,
                            { backgroundColor: COLORS.danger },
                          ]}
                        />
                        <View style={styles.alertContent}>
                          <Text
                            style={[
                              styles.alertVehicle,
                              { color: colors.text },
                            ]}
                          >
                            {alert.vehicle}
                          </Text>
                          <Text
                            style={[
                              styles.alertMaintenance,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {alert.maintenance}
                          </Text>
                          <Text style={styles.alertReason}>{alert.reason}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Urgentes */}
                {urgentAlerts.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color={COLORS.warning}
                      />
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        PRÓXIMOS ({urgentAlerts.length})
                      </Text>
                    </View>
                    {urgentAlerts.map((alert, index) => (
                      <View
                        key={index}
                        style={[
                          styles.alertCard,
                          { backgroundColor: colors.inputBackground },
                        ]}
                      >
                        <View
                          style={[
                            styles.alertIndicator,
                            { backgroundColor: COLORS.warning },
                          ]}
                        />
                        <View style={styles.alertContent}>
                          <Text
                            style={[
                              styles.alertVehicle,
                              { color: colors.text },
                            ]}
                          >
                            {alert.vehicle}
                          </Text>
                          <Text
                            style={[
                              styles.alertMaintenance,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {alert.maintenance}
                          </Text>
                          <Text style={styles.alertReason}>{alert.reason}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconSuccess: {
    backgroundColor: "#f0fdf4",
    borderRadius: 20,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
    padding: 20,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  alertCard: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  alertIndicator: {
    width: 4,
  },
  alertContent: {
    flex: 1,
    padding: 16,
  },
  alertVehicle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  alertMaintenance: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertReason: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AlertModal;
