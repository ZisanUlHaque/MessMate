import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bill } from "@/types/bill.types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COLORS, FONT_SIZE, BORDER_RADIUS } from "@/lib/constants";
import { formatCurrency, getMonthName } from "@/lib/helpers";

export interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
  compact?: boolean;
}

export const BillCard: React.FC<BillCardProps> = ({
  bill,
  onPress,
  compact = false,
}) => {
  const monthName = getMonthName(bill.month);
  const total = bill.totalAmount || 0;
  const paid = bill.paidAmount || 0;
  const due = bill.dueAmount || 0;
  const progressRatio = total > 0 ? Math.min(1, Math.max(0, paid / total)) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PARTIAL":
        return "warning";
      case "UNPAID":
      default:
        return "danger";
    }
  };

  if (compact) {
    return (
      <Card onPress={onPress} style={styles.cardContainer} padding={12}>
        <View style={styles.compactRow}>
          <View>
            <Text style={styles.compactTitle}>
              {bill.user?.fullName || `${monthName} ${bill.year}`}
            </Text>
            <Text style={styles.compactSub}>Due: {formatCurrency(due)}</Text>
          </View>
          <View style={styles.compactRight}>
            <Text style={styles.compactAmount}>{formatCurrency(total)}</Text>
            <Badge label={bill.status} variant={getStatusBadgeVariant(bill.status)} />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={styles.cardContainer} padding={16}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerMonth}>
            {monthName} {bill.year}
          </Text>
          {bill.user?.fullName ? (
            <Text style={styles.headerUser}>{bill.user.fullName}</Text>
          ) : null}
        </View>
        <Badge label={bill.status} variant={getStatusBadgeVariant(bill.status)} />
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Bill</Text>
        <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercent}% Paid</Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Paid</Text>
          <Text style={styles.paidText}>{formatCurrency(paid)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Due</Text>
          <Text style={styles.dueText}>{formatCurrency(due)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerMonth: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerUser: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    marginVertical: 6,
  },
  amountLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  totalAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  progressSection: {
    marginVertical: 10,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.divider,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  footerCol: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  paidText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.success,
    marginTop: 2,
  },
  dueText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.danger,
    marginTop: 2,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  compactSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: "500",
    marginTop: 2,
  },
  compactRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  compactAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
});
