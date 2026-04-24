export interface UserProfile {
  userId: string;
  displayName: string;
  avatarColor: string;
  createdAt: string;
  lastLoginAt: string;
}

export const AVATAR_COLORS = [
  '#2563EB','#7C3AED','#DB2777','#059669','#D97706',
  '#DC2626','#0891B2','#65A30D','#9333EA','#F97316',
];

export const MAX_USERS = 5;
