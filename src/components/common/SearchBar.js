import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";
import { ms, rf } from "../../utils/responsive";

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Buscar...",
  onClear,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.inputBackground, shadowColor: colors.shadow },
      ]}
    >
      <Ionicons
        name="search"
        size={ms(20)}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons
            name="close-circle"
            size={ms(20)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: ms(10),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    elevation: ms(2),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: ms(2),
  },
  icon: {
    marginRight: ms(8),
  },
  input: {
    flex: 1,
    fontSize: rf(16),
    paddingVertical: ms(4),
  },
  clearButton: {
    padding: ms(4),
  },
});

export default SearchBar;
