import React, { memo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MessMember } from "@/types/mess.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { COLORS, FONT_SIZE } from "@/lib/constants";

export interface MemberListProps {
  members: MessMember[];
  isManager: boolean;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

interface MemberItemProps {
  member: MessMember;
  isManager: boolean;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

const MemberItem = memo<MemberItemProps>(
  ({ member, isManager, onApprove, onReject, onRemove }) => {
    const fullName = member.user?.fullName || "Member";
    const phone = member.user?.phone || "";

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "APPROVED":
          return "success";
        case "PENDING":
          return "warning";
        case "REJECTED":
        default:
          return "danger";
      }
    };

    return (
      <View style={styles.memberRow}>
        <Avatar name={fullName} size={42} />

        <View style={styles.infoCol}>
          <Text style={styles.nameText} numberOfLines={1}>
            {fullName}
          </Text>
          {phone ? <Text style={styles.phoneText}>{phone}</Text> : null}
          <View style={styles.badgeRow}>
            <Badge
              label={member.role}
              variant={member.role === "MANAGER" ? "info" : "default"}
            />
            <Badge
              label={member.status}
              variant={getStatusVariant(member.status)}
            />
          </View>
        </View>

        {isManager ? (
          <View style={styles.actionCol}>
            {member.status === "PENDING" ? (
              <View style={styles.approvalButtons}>
                {onApprove ? (
                  <Pressable
                    onPress={() => onApprove(member.userId)}
                    style={[styles.miniButton, styles.approveButton]}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </Pressable>
                ) : null}
                {onReject ? (
                  <Pressable
                    onPress={() => onReject(member.userId)}
                    style={[styles.miniButton, styles.rejectButton]}
                  >
                    <Ionicons name="close" size={16} color={COLORS.white} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {member.status === "APPROVED" && member.role !== "MANAGER" && onRemove ? (
              <Pressable
                onPress={() => onRemove(member.userId)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
);

MemberItem.displayName = "MemberItem";

export const MemberList: React.FC<MemberListProps> = ({
  members,
  isManager,
  onApprove,
  onReject,
  onRemove,
}) => {
  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id || item.userId}
      renderItem={({ item }) => (
        <MemberItem
          member={item}
          isManager={isManager}
          onApprove={onApprove}
          onReject={onReject}
          onRemove={onRemove}
        />
      )}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  phoneText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  actionCol: {
    marginLeft: 8,
    alignItems: "flex-end",
  },
  approvalButtons: {
    flexDirection: "row",
    gap: 8,
  },
  miniButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  deleteButton: {
    padding: 8,
  },
});
