import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useTheme } from "../../context/ThemeContext";
import { dayKey, shouldShowUpdatePrompt } from "../../utils/versionUtils";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../../utils/responsive";

const PROMPT_KEY = "@update_prompt_last";

// Aviso de nueva versión: opcional (una vez al día) u obligatorio si la versión
// instalada es menor que `minimumVersion` del version.json publicado.
const UpdatePromptModal = () => {
  const { colors } = useTheme();
  const {
    storeUpdateAvailable,
    storeForceUpdate,
    storeLatestVersion,
    openStoreUpdate,
  } = useAppSettings();
  const [optionalVisible, setOptionalVisible] = useState(false);

  useEffect(() => {
    if (!storeUpdateAvailable || storeForceUpdate || !storeLatestVersion) {
      setOptionalVisible(false);
      return;
    }
    let active = true;
    (async () => {
      let last = null;
      try {
        const raw = await AsyncStorage.getItem(PROMPT_KEY);
        last = raw ? JSON.parse(raw) : null;
      } catch {
        last = null;
      }
      if (active && shouldShowUpdatePrompt(last, storeLatestVersion)) {
        setOptionalVisible(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [storeUpdateAvailable, storeForceUpdate, storeLatestVersion]);

  const dismissForToday = async () => {
    setOptionalVisible(false);
    try {
      await AsyncStorage.setItem(
        PROMPT_KEY,
        JSON.stringify({
          version: storeLatestVersion,
          day: dayKey(new Date()),
        }),
      );
    } catch {
      // Sin almacenamiento el aviso puede repetirse al reabrir la app
    }
  };

  const visible = storeForceUpdate || optionalVisible;
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // Con actualización obligatoria el botón atrás no cierra el aviso
      onRequestClose={storeForceUpdate ? () => {} : dismissForToday}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View
            style={[styles.iconBadge, { backgroundColor: colors.primaryDark }]}
          >
            <Ionicons
              name="cloud-download-outline"
              size={iconSize.xl}
              color="#fff"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {storeForceUpdate
              ? "Actualización necesaria"
              : "Hay una nueva versión"}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {storeForceUpdate
              ? "Esta versión de Auto-Guardian ya no es compatible. Actualiza desde Play Store para seguir usando la app."
              : `Está disponible la versión ${storeLatestVersion} con mejoras y correcciones. Actualiza desde Play Store para aprovecharlas.`}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primaryDark },
            ]}
            onPress={openStoreUpdate}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>
              {storeForceUpdate ? "Actualizar ahora" : "Actualizar"}
            </Text>
          </TouchableOpacity>

          {!storeForceUpdate && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={dismissForToday}
            >
              <Text
                style={[styles.secondaryText, { color: colors.textSecondary }]}
              >
                Más tarde
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: s(420),
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  iconBadge: {
    width: s(76),
    height: s(76),
    borderRadius: s(38),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: rf(20),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: rf(14),
    lineHeight: rf(20),
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  primaryButton: {
    alignSelf: "stretch",
    minHeight: vs(48),
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontSize: rf(15), fontWeight: "700" },
  secondaryButton: {
    minHeight: vs(44),
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  secondaryText: { fontSize: rf(14), fontWeight: "600" },
});

export default UpdatePromptModal;
