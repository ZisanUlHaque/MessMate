import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";

export interface ReceiptCameraProps {
  onCapture: (uri: string | null) => void;
  existingUri?: string | null;
}

export const ReceiptCamera: React.FC<ReceiptCameraProps> = ({
  onCapture,
  existingUri,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(existingUri || null);

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to take photos of receipts."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onCapture(uri);
      }
    } catch {
      Alert.alert("Error", "Could not capture image from camera.");
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Gallery access is needed to select receipt photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onCapture(uri);
      }
    } catch {
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const handleRemove = () => {
    setImageUri(null);
    onCapture(null);
  };

  const showOptions = () => {
    Alert.alert("Attach Receipt", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        <View style={styles.actionRow}>
          <Pressable onPress={showOptions} style={styles.retakeButton}>
            <Ionicons name="refresh" size={16} color={COLORS.primary} />
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Pressable onPress={handleRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable onPress={showOptions} style={styles.placeholderContainer}>
      <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
      <Text style={styles.placeholderTitle}>📷 Add Receipt Photo</Text>
      <Text style={styles.placeholderSubtitle}>Tap to take photo or choose from library</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.md,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    marginVertical: 10,
  },
  placeholderTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 6,
  },
  placeholderSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retakeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: "600",
    marginLeft: 4,
  },
});
