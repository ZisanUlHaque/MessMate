import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bill } from "@/types/bill.types";
import { Card } from "@/components/ui/Card";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { formatCurrency } from "@/lib/helpers";

export interface BillBreakdownProps {
  bill: Bill;
}

export const BillBreakdown: React.FC<BillBreakdownProps> = ({ bill }) => {
  const totalMeals = bill.totalMeals || 0;
  const mealRate = bill.mealRate || 0;
  const totalBazarShare = bill.totalBazarShare || 0;
  const fixedCostShare = bill.fixedCostShare || 0;
  const totalAmount = bill.totalAmount || 0;
  const paidAmount = bill.paidAmount || 0;
  const dueAmount = bill.dueAmount || 0;

  return (
    <Card padding={16} style={styles.container}>
      <Text style={styles.title}>Cost Breakdown</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Total Meals Consumed</Text>
        <Text style={styles.value}>{totalMeals.toFixed(1)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Calculated Meal Rate</Text>
        <Text style={styles.value}>{formatCurrency(mealRate)} / meal</Text>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Bazar Share</Text>
          <Text style={styles.subLabel}>
            {totalMeals.toFixed(1)} meals × {formatCurrency(mealRate)}
          </Text>
        </View>
        <Text style={styles.value}>{formatCurrency(totalBazarShare)}</Text>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Fixed Cost Share</Text>
          <Text style={styles.subLabel}>Gas + Utility charges</Text>
        </View>
        <Text style={styles.value}>{formatCurrency(fixedCostShare)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.paidLabel}>Paid Amount</Text>
        <Text style={styles.paidValue}>{formatCurrency(paidAmount)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.dueLabel}>Remaining Due</Text>
        <Text style={styles.dueValue}>{formatCurrency(dueAmount)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  subLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  value: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
    color: COLORS.text,
  },
  paidLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.success,
  },
  paidValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.success,
  },
  dueLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.danger,
  },
  dueValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "800",
    color: COLORS.danger,
  },
});
