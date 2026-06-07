# PedeFree

Plataforma de cardápio digital e pedidos por QR code para restaurantes. Clientes escaneiam o QR code na mesa, fazem o pedido e acompanham o status em tempo real. A cozinha gerencia os pedidos pelo celular; o dono gerencia tudo pelo painel admin.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Prisma 6** + **PostgreSQL** (Docker em dev)
- **Firebase Cloud Messaging** — push notifications
- **shadcn/ui** (Radix UI + CVA + Tailwind CSS)
- **Auth custom** — HMAC-SHA256 em cookie de sessão

---

## Arquitetura

Monorepo com dois apps Next.js independentes:

```
apps/
├── admin/   → painel do dono do restaurante  (porta 3015 em dev)
└── store/   → loja/cozinha/QR codes          (porta 3013 em dev)
prisma/      → schema PostgreSQL compartilhado
docs/        → documentação do projeto
agents/      → contexto para IA (domínio, arquitetura, stack, glossário)
```

### Fluxo do cliente
```
QR Code → /:slug?consumptionMethod=DINE_IN&table=5
  → cardápio → carrinho → createOrder() → /[slug]/orders/[id]
  → polling de status a cada 10s
  → FCM push quando status muda
```

### Rotas principais

| App   | URL                                | Descrição                  |
|-------|------------------------------------|----------------------------|
| store | `/:slug`                           | Cardápio do restaurante    |
| store | `/:slug/kitchen`                   | Visão da cozinha           |
| store | `/:slug/orders/:id`                | Acompanhamento de pedido   |
| store | `/:slug/qrcode`                    | Gerador de QR codes        |
| admin | `/admin`                           | Lista de restaurantes      |
| admin | `/admin/restaurants/:id`           | Gerenciar restaurante      |
| admin | `/admin/restaurants/:id/analytics` | Analytics de vendas        |

---

## Setup Local

### 1. Pré-requisitos
- Node.js 20+
- Docker (para o PostgreSQL)

### 2. Clone e instale

```bash
git clone <repo>
cd Pedefree
npm install
```

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz:

```bash
cp .env.example .env
```

Edite `.env` — mínimo para funcionar localmente:

```env
DATABASE_URL="postgresql://pedefree:pedefree123@localhost:5433/pedefree?schema=public"
NEXTAUTH_SECRET="qualquer-string-aleatoria-longa"
ADMIN_EMAIL="admin@pedefree.com"
ADMIN_PASSWORD="senha123"
```

Firebase é opcional localmente (push notifications não funcionarão sem as credenciais).

### 4. Banco de dados

```bash
docker compose up -d          # sobe PostgreSQL na porta 5433
npm run db:push               # aplica schema
npm run db:seed               # seed padrão (opcional)
npm run prisma:seed:gamboa    # seed do restaurante Gamboa (opcional)
```

### 5. Rodar

```bash
npm run dev          # admin em :3015 + store em :3013
npm run dev:admin    # só o admin
npm run dev:store    # só a loja
```

Acesse:
- Admin: http://localhost:3015/admin
- Loja: http://localhost:3013/gamboa (se usar o seed Gamboa)

---

## Scripts

| Script                       | O que faz                                |
|------------------------------|------------------------------------------|
| `npm run dev`                | Sobe admin (:3015) + store (:3013)       |
| `npm run dev:admin`          | Só o admin                               |
| `npm run dev:store`          | Só a loja                                |
| `npm run build`              | Build de produção dos dois apps          |
| `npm run build:admin`        | Build só do admin                        |
| `npm run build:store`        | Build só da loja                         |
| `npm run db:generate`        | `prisma generate`                        |
| `npm run db:push`            | `prisma db push`                         |
| `npm run db:seed`            | Seed padrão                              |
| `npm run prisma:seed:gamboa` | Seed restaurante Gamboa                  |

---

## Documentação

- `docs/architecture.md` — arquitetura detalhada e fluxos
- `docs/database.md` — modelos e índices do banco
- `docs/EXPLICACAO.md` — explicação didática do projeto e de cada tecnologia
- `agents/overview.md` — domínio e regras de negócio
- `agents/architecture.md` — camadas, auth, multi-tenancy
- `agents/stack.md` — libs e por que cada uma existe
- `agents/conventions.md` — padrões de código
- `agents/glossary.md` — glossário de entidades
- `CLAUDE.md` — regras e contexto para Claude Code
