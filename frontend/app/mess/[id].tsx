import React, { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import {
  useMessById,
  useApproveMember,
  useRejectMember,
  useRemoveMember,
  useUpdateMess,
  useRefreshInviteCode,
} from "@/hooks/useMess";
import { useUIStore } from "@/stores/uiStore";
import { InviteCodeBox } from "@/components/mess/InviteCodeBox";
import { MemberList } from "@/components/mess/MemberList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export default function MessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const { data: mess, isLoading, refetch } = useMessById(id || "");
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();
  const removeMutation = useRemoveMember();
  const updateMessMutation = useUpdateMess();
  const refreshInviteCodeMutation = useRefreshInviteCode();

  const [showSettings, setShowSettings] = useState(false);
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  // Settings form local state
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGas, setEditGas] = useState("");
  const [editUtility, setEditUtility] = useState("");
  const [isFormInit, setIsFormInit] = useState(false);

  if (mess && !isFormInit) {
    setEditName(mess.name);
    setEditAddress(mess.address || "");
    setEditGas(String(mess.monthlyGasBill || 0));
    setEditUtility(String(mess.monthlyUtilityBill || 0));
    setIsFormInit(true);
  }

  const isManager = user?.id === mess?.managerId || user?.role === "MANAGER";
  const members = mess?.members || [];
  const pendingMembers = members.filter((m) => m.status === "PENDING");

  const handleApprove = async (userId: string) => {
    try {
      await approveMutation.mutateAsync({ messId: id || "", userId });
      showSnackbar("Member approved!", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to approve member", "error");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectMutation.mutateAsync({ messId: id || "", userId });
      showSnackbar("Member rejected", "info");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to reject member", "error");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMutation.mutateAsync({ messId: id || "", userId });
      showSnackbar("Member removed", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to remove member", "error");
    }
  };

  const handleLeaveMess = async () => {
    if (!user) return;
    try {
      await removeMutation.mutateAsync({ messId: id || "", userId: user.id });
      setLeaveDialogVisible(false);
      showSnackbar("You have left the mess", "info");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to leave mess", "error");
    }
  };

  const handleRefreshCode = async () => {
    try {
      await refreshInviteCodeMutation.mutateAsync(id || "");
      showSnackbar("Invite code refreshed!", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to refresh code", "error");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateMessMutation.mutateAsync({
        id: id || "",
        data: {
          name: editName,
          address: editAddress,
          monthlyGasBill: parseFloat(editGas) || 0,
          monthlyUtilityBill: parseFloat(editUtility) || 0,
        },
      });
      setShowSettings(false);
      showSnackbar("Mess settings saved!", "success");
      refetch();
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to save settings", "error");
    }
  };

  if (isLoading || !mess) {
    return <LoadingSpinner fullScreen message="Loading mess details..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mess.name}
          </Text>
          {isManager ? (
            <Pressable
              onPress={() => setShowSettings(!showSettings)}
              style={styles.settingsButton}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={showSettings ? COLORS.primary : COLORS.text}
              />
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* Invite Code Box */}
        <InviteCodeBox
          code={mess.inviteCode}
          canRefresh={isManager}
          onRefresh={handleRefreshCode}
        />

        {/* Manager Settings Collapsible Section */}
        {isManager && showSettings && (
          <Card padding={16} style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Mess Settings</Text>

            <Input
              label="Mess Name"
              value={editName}
              onChangeText={setEditName}
            />

            <Input
              label="Address"
              value={editAddress}
              onChangeText={setEditAddress}
              multiline
            />

            <Input
              label="Monthly Gas Bill (৳)"
              value={editGas}
              onChangeText={setEditGas}
              keyboardType="numeric"
            />

            <Input
              label="Monthly Utility Bill (৳)"
              value={editUtility}
              onChangeText={setEditUtility}
              keyboardType="numeric"
            />

            <Button
              title="Save Changes"
              onPress={handleSaveSettings}
              loading={updateMessMutation.isPending}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </Card>
        )}

        {/* Members Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Members ({members.length})
          </Text>
          {isManager && pendingMembers.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>
                {pendingMembers.length} Pending
              </Text>
            </View>
          )}
        </View>

        <MemberList
          members={members}
          isManager={isManager}
          onApprove={handleApprove}
          onReject={handleReject}
          onRemove={handleRemove}
        />

        {/* Leave Mess Button for non-managers */}
        {!isManager && (
          <View style={styles.leaveContainer}>
            <Button
              title="Leave Mess"
              variant="danger"
              onPress={() => setLeaveDialogVisible(true)}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* Leave Mess Confirmation Dialog */}
      <ConfirmDialog
        visible={leaveDialogVisible}
        title="Leave Mess?"
        message="Are you sure you want to leave this mess? You will lose access to its meals and bills."
        confirmLabel="Leave"
        variant="danger"
        onConfirm={handleLeaveMess}
        onCancel={() => setLeaveDialogVisible(false)}
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
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginHorizontal: 12,
  },
  settingsButton: {
    padding: 4,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
  },
  leaveContainer: {
    marginTop: 24,
  },
});
