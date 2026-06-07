# Arquitetura, Camadas e Auth — PedeFree

## Monorepo

```
apps/admin/   → Next.js 15 — painel do dono (porta 3015)
apps/store/   → Next.js 15 — loja/cozinha/QR (porta 3013)
prisma/       → schema compartilhado (PostgreSQL)
```

## Camadas por Requisição

```
Browser / QR code
  → Next.js App Router (RSC ou Client Component)
  → Server Action ("use server") ou Route Handler (app/api/*)
  → lib/prisma.ts (Prisma Client singleton)
  → PostgreSQL via DATABASE_URL
```

## Multi-tenancy

O slug do restaurante é a chave de tenant. Toda query deve incluir `restaurantId` ou `restaurant: { slug }` no `where`. Não confie em `orderId` sem cruzar com o tenant.

## Auth — Admin

- Sessão HMAC SHA-256 em cookie `admin_session` (httpOnly, sameSite: strict, secure em prod, 8h)
- Implementação: `apps/admin/src/lib/session.ts` (signAdminSession / verifyAdminSession)
- Middleware: `apps/admin/src/middleware.ts` (Web Crypto, protege `/admin/*`)
- O middleware **NÃO** protege `/api/admin/*` — rotas de API adicionam verificação manual de sessão
- Credenciais: `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt) ou `ADMIN_PASSWORD` (plaintext dev)
- NEXTAUTH_SECRET obrigatório — falha ruidosamente se não definido

## Auth — Cozinha

- Sessão HMAC por slug em cookie `kitchen_{slug}` (httpOnly, sameSite: strict, secure em prod, 12h)
- Implementação: `apps/store/src/lib/session.ts` (signKitchenSession / verifyKitchenSession)
- Verificação feita na KitchenPage (SSR), não no middleware
- Server Actions de cozinha (`updateOrderStatus`, `cancelOrder`) validam tenant via `slug` no banco

## Firebase FCM

- **Cliente** (`lib/firebase.ts` + `lib/use-fcm-token.ts`): solicita permissão, registra SW, obtém token
- **Servidor** (`lib/firebase-admin.ts`): Admin SDK inicializado com credenciais de env
- Token FCM armazenado no campo `Order.fcmToken`
- Envio feito em `sendPushIfAvailable()` dentro de `kitchen/actions.ts`
- Falha silenciosa — token inválido/expirado não quebra a operação

## Polling de Status

- `OrderStatusPoller` (client) faz `GET /api/orders/:id` a cada 10s
- Backoff exponencial em caso de falha (max 60s)
- Para quando status é FINISHED ou CANCELLED
- Retoma ao voltar a aba (visibilitychange)

## Rotas de API

| App   | Rota                                          | Auth?     | Descrição              |
|-------|-----------------------------------------------|-----------|------------------------|
| store | GET /api/orders/[orderId]                     | ❌ nenhuma    | Status do pedido (polling) |
| admin | GET /api/admin/restaurants/[id]/export-orders | ✅ admin_session | Export CSV             |
