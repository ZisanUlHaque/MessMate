import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useAuth } from "@/hooks/useAuth";
import { useMessStore } from "@/stores/messStore";
import { useAllBills, useRecordPayment } from "@/hooks/useBills";
import { useUIStore } from "@/stores/uiStore";
import { BillBreakdown } from "@/components/bill/BillBreakdown";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  getMonthName,
} from "@/lib/helpers";
import { Portal, Dialog } from "react-native-paper";

const PAYMENT_METHODS = ["CASH", "BKASH", "BANK"] as const;

export default function BillDetailScreen() {
  const { id, month: paramMonth, year: paramYear } = useLocalSearchParams<{
    id: string;
    month?: string;
    year?: string;
  }>();
  const { user } = useAuth();
  const currentMess = useMessStore((state) => state.currentMess);
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const currentDate = new Date();
  const month = paramMonth ? parseInt(paramMonth, 10) : currentDate.getMonth() + 1;
  const year = paramYear ? parseInt(paramYear, 10) : currentDate.getFullYear();

  const messId = currentMess?.id || "";
  const { data: allBills = [], isLoading, refetch } = useAllBills(
    messId,
    month,
    year
  );

  const recordPaymentMutation = useRecordPayment();

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"CASH" | "BKASH" | "BANK">("CASH");
  const [payNote, setPayNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Find the bill from loaded bills
  const bill = useMemo(() => {
    return allBills.find((b) => b.id === id) || allBills[0] || null;
  }, [allBills, id]);

  const isManager = user?.role === "MANAGER";

  const handleRecordPayment = async () => {
    if (!bill) return;
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showSnackbar("Please enter a valid payment amount", "error");
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        billId: bill.id,
        data: {
          amount: amountNum,
          method: payMethod,
          note: payNote.trim() || undefined,
        },
      });
      setPaymentModalVisible(false);
      setPayAmount("");
      setPayNote("");
      showSnackbar("Payment recorded successfully!", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to record payment", "error");
    }
  };

  const handleExportPDF = async () => {
    if (!bill) return;

    try {
      setIsExporting(true);
      const messName = currentMess?.name || "MessMate";
      const memberName = bill.user?.fullName || "Mess Member";
      const monthStr = `${getMonthName(bill.month)} ${bill.year}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1F2937; }
            .header { text-align: center; border-bottom: 2px solid #1A73E8; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 26px; font-weight: bold; color: #1A73E8; margin: 0; }
            .subtitle { font-size: 14px; color: #6B7280; margin-top: 4px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
            th { background-color: #F3F4F6; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #1F2937; }
            .due-row { font-weight: bold; color: #EA4335; font-size: 16px; }
            .paid-row { font-weight: bold; color: #34A853; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${messName}</h1>
            <div class="subtitle">Monthly Mess Bill Statement - ${monthStr}</div>
          </div>

          <div class="bill-info">
            <div>
              <strong>Member:</strong> ${memberName}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Status:</strong> ${bill.status}<br/>
              <strong>Bill ID:</strong> ${bill.id.slice(0, 8)}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Calculation</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Meals Consumed</td>
                <td style="text-align: right;">${bill.totalMeals.toFixed(1)} meals</td>
                <td style="text-align: right;">Rate: ${formatCurrency(bill.mealRate)}</td>
              </tr>
              <tr>
                <td>Bazar Share</td>
                <td style="text-align: right;">${bill.totalMeals.toFixed(1)} × ${formatCurrency(bill.mealRate)}</td>
                <td style="text-align: right;">${formatCurrency(bill.totalBazarShare)}</td>
              </tr>
              <tr>
                <td>Fixed Costs (Gas + Utility)</td>
                <td style="text-align: right;">Shared equally</td>
                <td style="text-align: right;">${formatCurrency(bill.fixedCostShare)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">Total Billed Amount</td>
                <td style="text-align: right;">${formatCurrency(bill.totalAmount)}</td>
              </tr>
              <tr class="paid-row">
                <td colspan="2">Amount Paid</td>
                <td style="text-align: right;">${formatCurrency(bill.paidAmount)}</td>
              </tr>
              <tr class="due-row">
                <td colspan="2">Net Due</td>
                <td style="text-align: right;">${formatCurrency(bill.dueAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Generated via MessMate - Smart Bachelor Mess Manager
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
      showSnackbar("Statement exported to PDF!", "success");
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to export PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading bill statement..." />;
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Bill Statement</Text>
          <View style={{ width: 24 }} />
        </View>
        <Card padding={20} style={{ margin: 16 }}>
          <Text style={{ textAlign: "center", color: COLORS.textSecondary }}>
            Bill record not found for this period.
          </Text>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {getMonthName(bill.month)} {bill.year} Bill
          </Text>
          <Pressable onPress={handleExportPDF} style={styles.exportButton}>
            <Ionicons name="share-outline" size={22} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Member Name Banner */}
        {bill.user?.fullName ? (
          <Card padding={14} style={styles.userBannerCard}>
            <Text style={styles.bannerLabel}>STATEMENT FOR</Text>
            <Text style={styles.bannerName}>{bill.user.fullName}</Text>
          </Card>
        ) : null}

        {/* Breakdown Component */}
        <BillBreakdown bill={bill} />

        {/* Action Buttons */}
        <View style={styles.actionButtonsCol}>
          {isManager && bill.dueAmount > 0 && (
            <Button
              title="Record Payment"
              onPress={() => setPaymentModalVisible(true)}
              fullWidth
              style={{ marginBottom: 10 }}
            />
          )}

          <Button
            title="Export as PDF Statement"
            variant="outline"
            icon={<Ionicons name="document-text-outline" size={18} color={COLORS.primary} />}
            loading={isExporting}
            onPress={handleExportPDF}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Record Payment Dialog */}
      <Portal>
        <Dialog
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Record Payment</Dialog.Title>
          <Dialog.Content>
            <Input
              label="Amount Paid (৳)"
              placeholder={`Max ${formatCurrency(bill.dueAmount)}`}
              keyboardType="numeric"
              value={payAmount}
              onChangeText={setPayAmount}
            />

            <Text style={styles.methodLabel}>Payment Method</Text>
            <View style={styles.methodChipsRow}>
              {PAYMENT_METHODS.map((method) => (
                <Pressable
                  key={method}
                  style={[
                    styles.methodChip,
                    payMethod === method && styles.activeMethodChip,
                  ]}
                  onPress={() => setPayMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      payMethod === method && styles.activeMethodChipText,
                    ]}
                  >
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Note (Optional)"
              placeholder="e.g. Paid via bKash TrxID..."
              value={payNote}
              onChangeText={setPayNote}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => setPaymentModalVisible(false)}
            />
            <Button
              title="Confirm"
              size="sm"
              loading={recordPaymentMutation.isPending}
              onPress={handleRecordPayment}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    padding: 4,
  },
  exportButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  userBannerCard: {
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 10,
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  bannerName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  actionButtonsCol: {
    marginTop: 16,
  },
  dialog: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  dialogTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  methodLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
  },
  methodChipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.divider,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeMethodChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeMethodChipText: {
    color: COLORS.white,
  },
});
