import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { HELP_TOPICS } from "../data/guideContent";
import {
  borderRadius,
  iconSize,
  rf,
  s,
  spacing,
  vs,
} from "../utils/responsive";

const HelpCenterScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, "#1673E6", "#0F5FD2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroMediaRow}>
            <View style={styles.heroIconBadge}>
              <Ionicons
                name="help-buoy-outline"
                size={iconSize.lg}
                color="#D6E7FF"
              />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroEyebrow}>Soporte</Text>
              <Text style={styles.title}>Centro de ayuda</Text>
              <Text style={styles.heroSubtitle}>
                Toca un tema para ver cómo funciona cada parte de la app.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {HELP_TOPICS.map((topic, index) => {
          const isOpen = open === index;
          return (
            <View
              key={topic.title}
              style={[
                styles.topicCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.topicHeader}
                onPress={() => setOpen(isOpen ? -1 : index)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
              >
                <Text style={[styles.topicTitle, { color: colors.text }]}>
                  {topic.title}
                </Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={iconSize.sm}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.topicBody}>
                  {topic.body.map((paragraph) => (
                    <Text
                      key={paragraph}
                      style={[
                        styles.paragraph,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {paragraph}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.guideLink}
          onPress={() => navigation.navigate("GettingStarted")}
        >
          <Text style={[styles.guideLinkText, { color: colors.primary }]}>
            Ver guía de primeros pasos
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: vs(100),
  },
  heroCard: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroIconBadge: {
    width: s(68),
    height: s(68),
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroInfo: { flex: 1 },
  heroEyebrow: {
    fontSize: rf(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "rgba(255,255,255,0.74)",
    marginBottom: spacing.xxs,
  },
  title: { fontSize: rf(22), fontWeight: "800", color: "#fff" },
  heroSubtitle: {
    fontSize: rf(13),
    lineHeight: rf(18),
    color: "rgba(255,255,255,0.84)",
    marginTop: spacing.xxs,
  },
  topicCard: {
    borderRadius: borderRadius.md,
    borderWidth: s(1),
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: vs(52),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topicTitle: { flex: 1, fontSize: rf(15), fontWeight: "700" },
  topicBody: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  paragraph: { fontSize: rf(13), lineHeight: rf(19) },
  guideLink: {
    minHeight: vs(48),
    alignItems: "center",
    justifyContent: "center",
  },
  guideLinkText: { fontSize: rf(14), fontWeight: "700" },
});

export default HelpCenterScreen;
