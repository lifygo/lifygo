// Centralized API endpoint paths.
// Never hardcode a path string in a component — always reference this file.

export const ENDPOINTS = {
  ACCOUNT: {
    DELETE: "/account",
  },

  API_KEYS: {
    CREATE: "/api-keys",
    LIST: "/api-keys",
    DELETE: (id: string) => `/api-keys/${id}`,
  },

  SMTP: {
    UPSERT: "/smtp-config",
    GET: "/smtp-config",
    DELETE: "/smtp-config",
  },

  EMAIL: {
    SEND: "/send",
    SEND_OTP: "/send/otp",
    VERIFY_OTP: "/verify/otp",
    LOGS: "/logs",
  },

  HEALTH: "/health",
} as const;