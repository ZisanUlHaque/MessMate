import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useBazarById, useDeleteBazar } from "@/hooks/useBazar";
import { useUIStore } from "@/stores/uiStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
} from "@/lib/helpers";

export default function BazarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const { data: bazar, isLoading } = useBazarById(id || "");
  const deleteMutation = useDeleteBazar();

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const isOwnerOrManager =
    user?.id === bazar?.addedBy || user?.role === "MANAGER";

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id || "");
      setConfirmDeleteVisible(false);
      showSnackbar("Expense deleted successfully", "success");
      router.back();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to delete expense", "error");
    }
  };

  if (isLoading || !bazar) {
    return <LoadingSpinner fullScreen message="Loading expense details..." />;
  }

  const items = bazar.items || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Expense Detail</Text>
          {isOwnerOrManager ? (
            <Pressable
              onPress={() => setConfirmDeleteVisible(true)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* Main Info Card */}
        <Card padding={16} style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <Badge label={bazar.category} variant="info" />
            <Text style={styles.dateText}>{formatDate(bazar.date)}</Text>
          </View>

          <Text style={styles.amountLabel}>Total Expense</Text>
          <Text style={styles.amountText}>{formatCurrency(bazar.totalAmount)}</Text>

          {bazar.description ? (
            <Text style={styles.descriptionText}>{bazar.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Added by{" "}
              <Text style={{ fontWeight: "700" }}>
                {bazar.addedByUser?.fullName || "Member"}
              </Text>
            </Text>
            <Text style={styles.metaTime}>{getTimeAgo(bazar.createdAt)}</Text>
          </View>
        </Card>

        {/* Itemized Breakdown Table */}
        {items.length > 0 && (
          <Card padding={16} style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Itemized Details</Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, { flex: 2 }]}>Item</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "center" }]}>
                Qty
              </Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>
                Rate
              </Text>
              <Text style={[styles.tableCol, { flex: 1.2, textAlign: "right" }]}>
                Total
              </Text>
            </View>

            {items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                  {item.itemName}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  ৳{item.unitPrice}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.2, textAlign: "right", fontWeight: "700" },
                  ]}
                >
                  {formatCurrency(item.totalPrice)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Receipt Section */}
        {bazar.receiptUrl && (
          <Card padding={16} style={styles.receiptCard}>
            <Text style={styles.sectionTitle}>Receipt Attachment</Text>
            <Pressable onPress={() => setFullscreenImage(true)}>
              <Image
                source={{ uri: bazar.receiptUrl }}
                style={styles.receiptThumbnail}
                resizeMode="cover"
              />
              <Text style={styles.tapToViewText}>Tap to view fullscreen</Text>
            </Pressable>
          </Card>
        )}
      </ScrollView>

      {/* Fullscreen Receipt Modal */}
      <Modal
        visible={fullscreenImage}
        transparent
        onRequestClose={() => setFullscreenImage(false)}
      >
        <View style={styles.fullscreenModal}>
          <Pressable
            style={styles.closeModalButton}
            onPress={() => setFullscreenImage(false)}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </Pressable>
          {bazar.receiptUrl && (
            <Image
              source={{ uri: bazar.receiptUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  mainCard: {
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  amountLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  amountText: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: "800",
    color: COLORS.text,
    marginVertical: 4,
  },
  descriptionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  metaTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  itemsCard: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableCol: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    alignItems: "center",
  },
  tableCell: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
  },
  receiptCard: {
    marginBottom: 14,
  },
  receiptThumbnail: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.divider,
  },
  tapToViewText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
});
