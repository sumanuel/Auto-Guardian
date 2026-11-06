import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { formatKm } from "../../utils/formatUtils";
import { borderRadius, rf, s, spacing } from "../../utils/responsive";

// Campo opcional para actualizar el kilometraje del vehículo desde un registro
const KmField = ({
  value,
  onChangeText,
  currentKm,
  inputRef,
  onFocus,
  onSubmitEditing,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>
        Kilometraje actual
      </Text>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSubmitEditing={onSubmitEditing}
        placeholder="Ej: 45000"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Opcional. Si lo cambias, se actualiza en el vehículo
        {currentKm != null ? ` (ahora: ${formatKm(currentKm)})` : ""}.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: spacing.xl },
  label: {
    fontSize: rf(14),
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: s(1),
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: rf(16),
  },
  hint: { fontSize: rf(12), marginTop: spacing.xs },
});

export default KmField;
