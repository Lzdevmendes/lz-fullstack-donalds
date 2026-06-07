export const SESSION_CONSTANTS = {
  ADMIN_MAX_AGE_MS: 8 * 60 * 60 * 1000, // 8 hours
  KITCHEN_MAX_AGE_MS: 12 * 60 * 60 * 1000, // 12 hours
  ADMIN_COOKIE_NAME: "admin_session",
  KITCHEN_COOKIE_PREFIX: "kitchen_",
} as const;

export const UI_CONSTANTS = {
  DAYS_OF_WEEK: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const,
  BADGE_OPTIONS: [
    { value: "", label: "Sem badge" },
    { value: "NOVO", label: "Novo" },
    { value: "MAIS_PEDIDO", label: "Mais pedido" },
    { value: "PROMOCAO", label: "Promoção" },
  ] as const,
  DEFAULT_OPENING_TIME: "08:00",
  DEFAULT_CLOSING_TIME: "22:00",
  DEFAULT_TABLE_COUNT: 20,
} as const;

export const COUPON_CONSTANTS = {
  MIN_DISCOUNT_PERCENT: 1,
  MAX_DISCOUNT_PERCENT: 100,
  DEFAULT_MAX_USES: 100,
} as const;

export const POLLING_CONSTANTS = {
  BASE_INTERVAL: 10_000, // 10 seconds
  MAX_FAILURES: 3,
  MAX_BACKOFF: 60_000, // 60 seconds
} as const;

export const TIMEOUTS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 3000,
} as const;
