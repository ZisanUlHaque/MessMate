export interface Notification {
  id: string;
  userId: string;
  messId: string;
  title: string;
  body: string;
  type: "REMINDER" | "BILL" | "APPROVAL" | "ALERT";
  isRead: boolean;
  createdAt: string;
}
