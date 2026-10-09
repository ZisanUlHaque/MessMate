import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";
import { useUIStore } from "@/stores/uiStore";

export interface InviteCodeBoxProps {
  code: string;
  onRefresh?: () => void;
  canRefresh?: boolean;
}

export const InviteCodeBox: React.FC<InviteCodeBoxProps> = ({
  code,
  onRefresh,
  canRefresh = false,
}) => {
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        Clipboard.setString(code);
      }
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch {
      Clipboard.setString(code);
    }
    showSnackbar("Invite code copied to clipboard!", "success");
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptic fallback
      }
      onRefresh();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MESS INVITE CODE</Text>
      <Text style={styles.code}>{code}</Text>

      <View style={styles.buttonsRow}>
        <Pressable onPress={handleCopy} style={styles.button}>
          <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
          <Text style={styles.buttonText}>Copy Code</Text>
        </Pressable>

        {canRefresh && onRefresh ? (
          <Pressable onPress={handleRefresh} style={styles.button}>
            <Ionicons name="refresh" size={16} color={COLORS.primary} />
            <Text style={styles.buttonText}>Refresh</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.md,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  code: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 8,
    marginVertical: 12,
    fontFamily: "monospace",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  buttonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
