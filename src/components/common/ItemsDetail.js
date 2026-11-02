import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/formatUtils";
import { itemSubtotal, itemsTotal, newDraftItem } from "../../utils/itemsUtils";
import { borderRadius, iconSize, rf, s, spacing, vs } from "../../utils/responsive";

// Detalle por ítems: nombre, cantidad y costo unitario. El total (suma de
// cantidad × costo unitario) lo calcula el padre con itemsTotal().
const ItemsDetail = ({ items, onChange, currencySymbol = "$" }) => {
  const { colors } = useTheme();
  const [name, setName] = useState("");

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  const addItem = () => {
    if (!name.trim()) return;
    onChange([...items, newDraftItem(name)]);
    setName("");
  };

  const updateItem = (id, field, value) =>
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const removeItem = (id) => onChange(items.filter((item) => item.id !== id));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Detalle</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {items.length} {items.length === 1 ? "ítem" : "ítems"}
        </Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={[...inputStyle, styles.nameInput]}
          value={name}
          onChangeText={setName}
          placeholder="Ej: aceite, filtro, mano de obra"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addItem}
          accessibilityLabel="Agregar ítem"
        >
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.itemBlock, { borderTopColor: colors.border }]}
        >
          <View style={styles.itemTop}>
            <Text
              style={[styles.itemName, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              hitSlop={8}
              accessibilityLabel={`Quitar ${item.name}`}
            >
              <Ionicons
                name="close"
                size={iconSize.sm}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.itemFields}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Cantidad
              </Text>
              <TextInput
                style={[...inputStyle, styles.numberInput]}
                value={item.quantity}
                onChangeText={(v) => updateItem(item.id, "quantity", v)}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Costo unit.
              </Text>
              <TextInput
                style={[...inputStyle, styles.numberInput]}
                value={item.unitCost}
                onChangeText={(v) => updateItem(item.id, "unitCost", v)}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.subtotalField}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.subtotal, { color: colors.text }]}>
                {formatCurrency(itemSubtotal(item), currencySymbol)}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {items.length > 0 && (
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(itemsTotal(items), currencySymbol)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: vs(16),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(10),
  },
  title: { fontSize: rf(16), fontWeight: "700" },
  count: { fontSize: rf(13) },
  addRow: { flexDirection: "row", alignItems: "center" },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(8),
    fontSize: rf(15),
  },
  nameInput: { flex: 1, marginRight: spacing.sm },
  addButton: {
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: borderRadius.sm,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: rf(14) },
  itemBlock: { borderTopWidth: 1, marginTop: vs(12), paddingTop: vs(10) },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(6),
  },
  itemName: { flex: 1, fontSize: rf(15), fontWeight: "600", marginRight: spacing.sm },
  itemFields: { flexDirection: "row", alignItems: "flex-end" },
  field: { flex: 1, marginRight: spacing.sm },
  fieldLabel: { fontSize: rf(12), marginBottom: vs(4) },
  numberInput: { textAlign: "right" },
  subtotalField: { flex: 1, alignItems: "flex-end", paddingBottom: vs(8) },
  subtotal: { fontSize: rf(15), fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    marginTop: vs(12),
    paddingTop: vs(10),
  },
  totalLabel: { fontSize: rf(16), fontWeight: "700" },
  totalValue: { fontSize: rf(18), fontWeight: "700" },
});

export default ItemsDetail;
