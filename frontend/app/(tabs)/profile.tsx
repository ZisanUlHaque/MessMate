import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useMessStore } from "@/stores/messStore";
import { useUIStore } from "@/stores/uiStore";
import * as authService from "@/services/auth.service";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MessCard } from "@/components/mess/MessCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { COLORS, FONT_SIZE } from "@/lib/constants";
import { Portal, Dialog } from "react-native-paper";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const messes = useMessStore((state) => state.messes);
  const currentMess = useMessStore((state) => state.currentMess);
  const setCurrentMess = useMessStore((state) => state.setCurrentMess);
  const showSnackbar = useUIStore((state) => state.showSnackbar);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // Change password dialog states
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    await logout();
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      showSnackbar("Please fill in both password fields", "error");
      return;
    }
    if (newPassword.length < 6) {
      showSnackbar("New password must be at least 6 characters", "error");
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(oldPassword, newPassword);
      setPasswordDialogVisible(false);
      setOldPassword("");
      setNewPassword("");
      showSnackbar("Password updated successfully!", "success");
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar name={user?.fullName || "User"} size={80} />
          <Text style={styles.userName}>{user?.fullName || "User"}</Text>
          <Text style={styles.userPhone}>{user?.phone || ""}</Text>
          <View style={styles.roleBadgeContainer}>
            <Badge
              label={user?.role || "MEMBER"}
              variant={user?.role === "MANAGER" ? "info" : "default"}
            />
          </View>
        </View>

        {/* My Messes Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Messes ({messes.length})</Text>
        </View>

        {messes.length === 0 ? (
          <Card padding={16}>
            <Text style={styles.noMessText}>You are not joined to any mess.</Text>
          </Card>
        ) : (
          messes.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              isSelected={currentMess?.id === mess.id}
              onPress={() => {
                setCurrentMess(mess);
                router.push(`/mess/${mess.id}`);
              }}
            />
          ))
        )}

        <View style={styles.messActionRow}>
          <Button
            title="Create New Mess"
            onPress={() => router.push("/mess/create")}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="Join a Mess"
            onPress={() => router.push("/mess/join")}
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
          />
        </View>

        {/* Settings Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <Card padding={16} style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.card}
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() => setPasswordDialogVisible(true)}
          >
            <View style={styles.settingLabelRow}>
              <Ionicons name="key-outline" size={20} color={COLORS.text} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textSecondary}
            />
          </Pressable>
        </Card>

        {/* About Section */}
        <Card padding={16} style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.aboutTitle}>MessMate v1.0.0</Text>
          </View>
          <Text style={styles.aboutDesc}>
            Made with ❤️ for bachelors managing shared messes, meals, and finances.
          </Text>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="danger"
            onPress={() => setLogoutDialogVisible(true)}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Confirm Log Out"
        message="Are you sure you want to log out of MessMate?"
        confirmLabel="Log Out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogVisible(false)}
      />

      {/* Change Password Dialog */}
      <Portal>
        <Dialog
          visible={passwordDialogVisible}
          onDismiss={() => setPasswordDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Change Password</Dialog.Title>
          <Dialog.Content>
            <Input
              label="Old Password"
              placeholder="••••••"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              variant="ghost"
              size="sm"
              onPress={() => setPasswordDialogVisible(false)}
            />
            <Button
              title="Save"
              size="sm"
              loading={passwordLoading}
              onPress={handleChangePassword}
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 10,
  },
  userPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadgeContainer: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  noMessText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  messActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 4,
  },
  aboutCard: {
    marginBottom: 20,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  aboutTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "700",
    color: COLORS.text,
  },
  aboutDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  logoutContainer: {
    marginTop: 8,
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
});
