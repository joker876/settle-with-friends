

export const LogoutReason = {
  SessionExpired: 'session-expired',
  LoggedOut: 'logged-out',
} as const;
export type LogoutReason = typeof LogoutReason[keyof typeof LogoutReason];