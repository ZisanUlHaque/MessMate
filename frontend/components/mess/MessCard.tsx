import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Mess } from "@/types/mess.types";
import { Card } from "@/components/ui/Card";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";

export interface MessCardProps {
  mess: Mess;
  memberCount?: number;
  onPress?: () => void;
  isSelected?: boolean;
}

export const MessCard: React.FC<MessCardProps> = ({
  mess,
  memberCount,
  onPress,
  isSelected = false,
}) => {
  return (
    <Card
      onPress={onPress}
      style={[
        styles.cardContainer,
        isSelected && styles.selectedBorder,
      ]}
      padding={14}
    >
      <View style={styles.topRow}>
        <View style={styles.nameSection}>
          <Text style={styles.messName} numberOfLines={1}>
            {mess.name}
          </Text>
          {mess.address ? (
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.addressText} numberOfLines={1}>
                {mess.address}
              </Text>
            </View>
          ) : null}
        </View>

        {memberCount !== undefined ? (
          <View style={styles.memberBadge}>
            <Ionicons name="people" size={14} color={COLORS.primary} />
            <Text style={styles.memberCount}>{memberCount} members</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.codeLabel}>Invite Code:</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{mess.inviteCode}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 5,
  },
  selectedBorder: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameSection: {
    flex: 1,
    marginRight: 10,
  },
  messName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  addressText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  memberCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  codeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  codeBox: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
});
