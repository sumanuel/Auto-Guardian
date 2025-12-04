import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../../utils/dateUtils";
import Button from "./Button";

const DatePicker = ({ value, onChange, label, style }) => {
  const [show, setShow] = React.useState(false);
  const [date, setDate] = React.useState(value || new Date());

  const onChangeInternal = (event, selectedDate) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      onChange(selectedDate);
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
          display="default"
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
