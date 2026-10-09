import React from "react";
import { View, Text, StyleSheet, KeyboardTypeOptions } from "react-native";
import { TextInput } from "react-native-paper";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = "default",
  icon,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  maxLength,
  autoCapitalize = "none",
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        outlineColor={error ? COLORS.danger : COLORS.border}
        activeOutlineColor={error ? COLORS.danger : COLORS.primary}
        style={styles.input}
        theme={{
          roundness: 8,
          colors: {
            background: COLORS.card,
          },
        }}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    fontSize: FONT_SIZE.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
    marginLeft: 4,
  },
});
