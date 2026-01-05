import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../utils/dateUtils";
import { ms, rf } from "../../utils/responsive";

const DatePicker = ({ value, onChange, label, style }) => {
  const { colors } = useTheme();
  const [show, setShow] = React.useState(false);
  const [date, setDate] = React.useState(value || new Date());

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const onChangeInternal = (event, selectedDate) => {
    const currentDate = selectedDate || date;

    if (Platform.OS === "android") {
      setShow(false);
      if (selectedDate) {
        setDate(currentDate);
        onChange(currentDate);
      }
    } else {
      // iOS
      setShow(Platform.OS === "ios");
      if (selectedDate) {
        setDate(currentDate);
        onChange(currentDate);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setShow(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={ms(20)}
          color={colors.primary}
        />
        <Text style={[styles.dateButtonText, { color: colors.text }]}>
          {formatDate(date)}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ms(16),
  },
  label: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: ms(8),
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: ms(1),
    borderRadius: ms(8),
    padding: ms(12),
    gap: ms(8),
  },
  dateButtonText: {
    fontSize: rf(16),
  },
});

export default DatePicker;
