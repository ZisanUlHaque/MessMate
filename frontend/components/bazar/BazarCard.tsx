import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Bazar } from "@/types/bazar.types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/helpers";

export interface BazarCardProps {
  bazar: Bazar;
  onPress?: () => void;
}

export const BazarCard: React.FC<BazarCardProps> = ({ bazar, onPress }) => {
  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case "GROCERY":
        return "success";
      case "GAS":
        return "warning";
      case "UTILITY":
        return "info";
      default:
        return "default";
    }
  };

  const addedByName = bazar.addedByUser?.fullName || "Member";

  return (
    <Card onPress={onPress} style={styles.cardContainer} padding={14}>
      <View style={styles.topRow}>
        <Badge
          label={bazar.category}
          variant={getCategoryBadgeVariant(bazar.category)}
        />
        <Text style={styles.dateText}>{formatDate(bazar.date)}</Text>
      </View>

      <View style={styles.middleRow}>
        <Text style={styles.amountText}>{formatCurrency(bazar.totalAmount)}</Text>
        {bazar.description ? (
          <Text style={styles.descText} numberOfLines={1}>
            {bazar.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.addedByRow}>
          <Ionicons
            name="person-circle-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.addedByText} numberOfLines={1}>
            {addedByName}
          </Text>
        </View>

        {bazar.receiptUrl ? (
          <View style={styles.receiptIndicator}>
            <Ionicons name="document-attach" size={16} color={COLORS.primary} />
            <Text style={styles.receiptText}>Receipt</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  middleRow: {
    marginVertical: 4,
  },
  amountText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  descText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  addedByRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addedByText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  receiptIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiptText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    marginLeft: 3,
    fontWeight: "600",
  },
});
