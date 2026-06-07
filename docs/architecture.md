# Arquitetura do Projeto

## Visão Geral

PedeFree é uma plataforma de cardápio digital e pedidos online para restaurantes. O sistema é dividido em dois apps Next.js independentes dentro de um monorepo npm workspaces.

## Estrutura de Apps

```
apps/
├── admin/   → Painel do dono do restaurante (porta 3015 em dev)
└── store/   → Loja do cliente / cozinha (porta 3013 em dev)
```

### Admin (`apps/admin`)
- Cadastro e edição de restaurantes
- Gerenciamento de produtos e categorias
- Visualização de pedidos e analytics
- Exportação de pedidos (CSV)
- Autenticação via sessão HMAC (cookie `admin_session`)
- Acesso: `localhost:3015` em dev

### Store (`apps/store`)
- Cardápio digital do restaurante (`/[slug]/menu`)
- Fluxo de pedido com carrinho
- Acompanhamento de pedido em tempo real (`/[slug]/orders/[orderId]`)
- Painel de cozinha com senha (`/[slug]/kitchen`)
- Geração de QR codes (`/[slug]/qrcode`)
- Push notifications via Firebase FCM
- PWA instalável no celular
- Acesso: `localhost:3013` em dev

## Stack Tecnológico

- **Framework:** Next.js 15 (App Router) com React 19
- **Linguagem:** TypeScript 5
- **Banco de dados:** PostgreSQL via Prisma ORM
- **Notificações:** Firebase Admin SDK (server) + Firebase JS SDK (client)
- **Estilização:** Tailwind CSS + shadcn/ui (Radix UI)
- **Auth Admin:** HMAC SHA-256 com cookie de sessão (8h)
- **Infraestrutura DB:** Docker Compose (local)

## Fluxo de Dados

```
Cliente (QR Code)
  → apps/store/:slug/menu         → visualiza cardápio
  → apps/store/:slug/orders       → faz pedido
  → apps/store/api/orders/:id     → polling de status (SSE-like)

Dono do restaurante
  → apps/admin/admin/login        → autentica
  → apps/admin/admin/restaurants  → gerencia restaurante

Cozinha
  → apps/store/:slug/kitchen      → visualiza e atualiza pedidos (senha protegida)
  → Firebase FCM                  → recebe notificação de novo pedido
```

## Prisma (raiz do monorepo)

O schema Prisma vive na raiz (`/prisma/schema.prisma`). Ambos os apps usam `@prisma/client` do `node_modules` compartilhado pelo workspace.

Comandos:
```bash
npm run db:generate   # prisma generate
npm run db:push       # prisma db push
npm run db:seed       # seed padrão
npm run prisma:seed:gamboa  # seed do restaurante Gamboa
```
