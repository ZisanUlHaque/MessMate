import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useMessStore } from "@/stores/messStore";
import {
  useMyBill,
  useAllBills,
  useGenerateBills,
  useExtraEaters,
} from "@/hooks/useBills";
import { useUIStore } from "@/stores/uiStore";
import { BillCard } from "@/components/bill/BillCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { getMonthName } from "@/lib/helpers";

export default function BillsScreen() {
  const { user } = useAuth();
  const currentMess = useMessStore((state) => state.currentMess);
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const [date, setDate] = useState(() => new Date());
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const [confirmGenerateVisible, setConfirmGenerateVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messId = currentMess?.id || "";
  const isManager = user?.role === "MANAGER";

  const {
    data: myBill,
    isLoading: isMyBillLoading,
    refetch: refetchMyBill,
  } = useMyBill(messId, month, year);

  const {
    data: allBills = [],
    isLoading: isAllBillsLoading,
    refetch: refetchAllBills,
  } = useAllBills(messId, month, year);

  const {
    data: extraEaters = [],
    isLoading: isExtraEatersLoading,
    refetch: refetchExtraEaters,
  } = useExtraEaters(messId, month, year);

  const generateBillsMutation = useGenerateBills();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMyBill(),
      refetchAllBills(),
      refetchExtraEaters(),
    ]);
    setRefreshing(false);
  }, [refetchMyBill, refetchAllBills, refetchExtraEaters]);

  const handlePrevMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGenerateBills = async () => {
    try {
      await generateBillsMutation.mutateAsync({
        messId,
        month,
        year,
      });
      setConfirmGenerateVisible(false);
      showSnackbar("Bills generated successfully!", "success");
      onRefresh();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to generate bills", "error");
    }
  };

  if (!currentMess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          icon="receipt-outline"
          title="No Mess Selected"
          subtitle="Join or create a mess to view and manage monthly bills."
        />
      </SafeAreaView>
    );
  }

  const isLoading =
    isMyBillLoading && isAllBillsLoading && isExtraEatersLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Month Navigation */}
        <View style={styles.monthHeaderRow}>
          <Pressable onPress={handlePrevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.monthHeaderText}>
            {getMonthName(month)} {year}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </Pressable>
        </View>

        {isLoading ? (
          <LoadingSpinner message="Loading bills..." />
        ) : (
          <>
            {/* My Bill Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Bill</Text>
            </View>

            {myBill ? (
              <BillCard
                bill={myBill}
                onPress={() => router.push(`/bill/${myBill.id}`)}
              />
            ) : (
              <Card padding={16}>
                <Text style={styles.noBillText}>
                  No bill generated for you in {getMonthName(month)} {year}.
                </Text>
              </Card>
            )}

            {/* Manager-Only Section */}
            {isManager && (
              <View style={styles.managerSection}>
                <View style={styles.managerHeaderRow}>
                  <Text style={styles.sectionTitle}>Manager Actions</Text>
                  <Button
                    title="Generate Bills"
                    size="sm"
                    variant="primary"
                    loading={generateBillsMutation.isPending}
                    onPress={() => setConfirmGenerateVisible(true)}
                  />
                </View>

                {/* Extra Eaters Warning Card */}
                {extraEaters.length > 0 && (
                  <Card style={styles.extraEatersCard} padding={14}>
                    <View style={styles.extraEatersHeader}>
                      <Ionicons
                        name="warning"
                        size={20}
                        color={COLORS.danger}
                      />
                      <Text style={styles.extraEatersTitle}>
                        Extra Eaters Flagged ({extraEaters.length})
                      </Text>
                    </View>
                    <Text style={styles.extraEatersDesc}>
                      Members with significantly higher meal intake than average:
                    </Text>
                    {extraEaters.map((eater) => (
                      <View key={eater.userId} style={styles.eaterRow}>
                        <Text style={styles.eaterName}>{eater.fullName}</Text>
                        <Text style={styles.eaterStats}>
                          {eater.totalMeals} meals (+{eater.deviation.toFixed(0)}%)
                        </Text>
                      </View>
                    ))}
                  </Card>
                )}

                {/* All Members Bills */}
                <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
                  <Text style={styles.sectionTitle}>
                    All Members ({allBills.length})
                  </Text>
                </View>

                {allBills.length === 0 ? (
                  <Card padding={16}>
                    <Text style={styles.noBillText}>
                      No member bills generated yet. Tap "Generate Bills" to calculate.
                    </Text>
                  </Card>
                ) : (
                  allBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      compact
                      onPress={() => router.push(`/bill/${bill.id}`)}
                    />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Confirm Bill Generation Dialog */}
      <ConfirmDialog
        visible={confirmGenerateVisible}
        title="Generate Monthly Bills?"
        message={`This will compute meal rates and individual shares for ${getMonthName(
          month
        )} ${year}. Existing bills will be updated.`}
        confirmLabel="Generate"
        onConfirm={handleGenerateBills}
        onCancel={() => setConfirmGenerateVisible(false)}
      />
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
    paddingBottom: 32,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  navButton: {
    padding: 6,
  },
  monthHeaderText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  noBillText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  managerSection: {
    marginTop: 20,
  },
  managerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  extraEatersCard: {
    borderColor: COLORS.danger,
    borderWidth: 1.5,
    backgroundColor: COLORS.dangerLight,
    marginBottom: 12,
  },
  extraEatersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  extraEatersTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.danger,
  },
  extraEatersDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  eaterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(234, 67, 53, 0.2)",
  },
  eaterName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    color: COLORS.text,
  },
  eaterStats: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.danger,
  },
});
