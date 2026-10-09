export interface Mess {
  id: string;
  name: string;
  inviteCode: string;
  managerId: string;
  address: string | null;
  monthlyGasBill: number;
  monthlyUtilityBill: number;
  isActive: boolean;
  createdAt: string;
}

export interface MessMemberUser {
  id: string;
  fullName: string;
  phone: string;
}

export interface MessMember {
  id: string;
  messId: string;
  userId: string;
  role: "MANAGER" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  joinedAt: string;
  user?: MessMemberUser;
}

export interface MessWithMembers extends Mess {
  members: MessMember[];
}
