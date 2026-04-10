# PedeFree

Sistema de cardápio digital e pedidos online para **fast foods e restaurantes locais**.
Desenvolvido para estabelecimentos da sua cidade que precisam de uma solução segura, moderna e sem mensalidade de plataformas de terceiros.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Banco de dados | PostgreSQL 16 (via Docker) |
| ORM | Prisma 6 |
| Estilização | Tailwind CSS + shadcn/ui |
| Autenticação | HMAC-SHA256 + bcryptjs |
| Linguagem | TypeScript 5 |
| Infra local | Docker Compose |

---

## Funcionalidades

### Cardápio do cliente
- Cardápio digital acessível por QR code de mesa ou link direto
- Busca de produtos em tempo real
- Badges de destaque: **Novo**, **Mais pedido**, **Promoção**
- Seção de destaques automática para produtos com badge
- Produtos indisponíveis ocultos do cardápio
- Cor primária personalizada por restaurante

### Pedido
- Escolha entre **Comer aqui (Mesa)** ou **Retirar**
- Identificação do cliente: nome, telefone e número da mesa
- Observações por item no carrinho
- Aplicação de **cupom de desconto** (% de desconto, validade, limite de usos)
- Confirmação com resumo do pedido

### Rastreamento em tempo real
- Linha do tempo de status: **Aguardando → Em preparo → Pronto**
- Polling automático a cada 10 segundos
- Aviso imediato caso o pedido seja **cancelado**

### Avaliação pós-pedido
- Formulário de 1 a 5 estrelas disponível após o pedido ser concluído
- Campo de comentário opcional
- Avaliação registrada apenas uma vez por pedido

### Histórico de pedidos
- Busca de pedidos por número de telefone do cliente

### Cozinha
- Painel protegido por senha (hash bcrypt por restaurante)
- Colunas: **Aguardando** e **Em preparo**
- Botão para avançar status do pedido
- Botão para **cancelar** pedido (com confirmação)
- Exibe observações por item e número da mesa
- Atualização automática a cada 30 segundos

### Gerador de QR Code
- Página para gerar QR codes por número de mesa
- Impressão direta pelo navegador

### Painel Administrativo
- Login seguro (HMAC assinado + bcrypt)
- Cadastro e edição de restaurantes com cor primária, avatar, capa e senha da cozinha
- Gerenciamento de **categorias** do cardápio
- Gerenciamento de **produtos** com badge e toggle de disponibilidade
- CRUD completo de **cupons de desconto** com ativação/desativação
- Configuração de **horários de funcionamento** por dia da semana
- Gestão do **número de mesas**
- **Analytics** por restaurante: faturamento hoje / 7 dias / 30 dias, ticket médio, top 5 produtos, pedidos recentes

### PWA
- App instalável em celular via `manifest.json`
- Meta tags completas para iOS e Android
- Tema e cor configurados

---

## Segurança

| Ponto | Mecanismo |
|---|---|
| Sessão do admin | Cookie `httpOnly + sameSite:strict` com token **HMAC-SHA256** assinado |
| Senha do admin | `ADMIN_PASSWORD_HASH` (bcrypt) ou `ADMIN_PASSWORD` (plain, só em dev) |
| Senha da cozinha | Hash **bcrypt** armazenado no banco, jamais o texto puro |
| Autenticação da cozinha | Cookie signed por slug, verificado no middleware |
| Middleware | Valida assinatura antes de qualquer rota protegida |
| Cupons | Validação de limite de usos e validade no servidor |

> **Produção**: gere o hash da senha admin com:
> ```bash
> node -e "const b=require('bcryptjs'); b.hash('sua_senha', 10).then(console.log)"
> ```
> Cole o resultado em `ADMIN_PASSWORD_HASH` no `.env` e remova `ADMIN_PASSWORD`.

---

## Como rodar

### Pré-requisitos
- Node.js 20+
- Docker + Docker Compose

### 1. Clone e instale

```bash
git clone <repo>
cd Pedefree
npm install
```

### 2. Configure o ambiente

Crie o `.env` baseado nas variáveis abaixo:

```env
DATABASE_URL="postgresql://pedefree:pedefree123@localhost:5433/pedefree?schema=public"
NEXTAUTH_SECRET="gere-uma-chave-aleatoria-forte"
ADMIN_EMAIL="seu@email.com"
ADMIN_PASSWORD="senha-temporaria"   # substitua por ADMIN_PASSWORD_HASH em produção
```

### 3. Suba o banco

```bash
docker compose up -d
```

### 4. Aplique o schema e seed

```bash
npx prisma db push
npx prisma db seed
```

### 5. Rode o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Página inicial |
| `/{slug}` | Escolha método (mesa ou retirada) |
| `/{slug}/menu?consumptionMethod=DINE_IN` | Cardápio |
| `/{slug}/orders/{id}` | Confirmação e rastreamento |
| `/{slug}/orders` | Histórico por telefone |
| `/{slug}/kitchen` | Painel da cozinha (senha) |
| `/{slug}/qrcode` | Gerador de QR codes |
| `/admin` | Painel administrativo |
| `/admin/restaurants/{id}/analytics` | Analytics do restaurante |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── admin/               # Painel administrativo
│   │   └── restaurants/
│   │       └── [id]/
│   │           ├── analytics/  # Dashboard de vendas
│   │           └── edit/
│   ├── api/orders/          # API route de status do pedido
│   └── [slug]/              # Rotas públicas por restaurante
│       ├── menu/            # Cardápio + carrinho
│       ├── kitchen/         # Painel da cozinha
│       ├── orders/          # Histórico e confirmação
│       └── qrcode/          # Gerador de QR
├── components/ui/           # shadcn/ui
├── contexts/                # Cart context
└── lib/
    ├── prisma.ts            # Client do banco
    ├── session.ts           # HMAC sign/verify
    └── utils.ts
prisma/
├── schema.prisma            # Modelos do banco
├── seed.ts                  # Dados iniciais
└── migrations/
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL |
| `NEXTAUTH_SECRET` | Sim | Chave para assinar sessões (mín. 32 chars) |
| `ADMIN_EMAIL` | Sim | Email do administrador |
| `ADMIN_PASSWORD` | Dev | Senha em texto plano (só para desenvolvimento) |
| `ADMIN_PASSWORD_HASH` | Produção | Hash bcrypt da senha admin |

---

## Roadmap

- [ ] Integração com pagamento (Pix via Mercado Pago ou Stripe)
- [ ] Notificações push para o cliente via Firebase Cloud Messaging
- [ ] Suporte a múltiplos admins por restaurante (multi-tenant)
- [ ] Upload de imagens integrado (Uploadthing já configurado no .env)
- [ ] Service Worker para cache offline PWA

---

## Licença

Uso privado — todos os direitos reservados.
