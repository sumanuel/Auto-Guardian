import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../utils/dateUtils";
import Button from "./Button";

const DatePicker = ({ value, onChange, label, style }) => {
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
      {label && <Text style={styles.label}>{label}</Text>}
      <Button
        title={formatDate(date)}
        onPress={() => setShow(true)}
        variant="outline"
      />
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "default" : "spinner"}
          onChange={onChangeInternal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
});

export default DatePicker;
