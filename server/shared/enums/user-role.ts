export const UserRole = {
  Owner: 'owner',
  Admin: 'admin',
  Member: 'member',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export function userRoleToInt(role: UserRole): number {
  switch (role) {
    case UserRole.Owner:
      return 3;
    case UserRole.Admin:
      return 2;
    case UserRole.Member:
      return 1;
    default:
      throw new Error(`Unknown user role: ${role}`);
  }
}