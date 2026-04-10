# PedeFree

Sistema completo de pedidos para pequenas empresas no nicho de fastfood. Pedidos livres, rápidos e acessíveis — sem depender de plataformas externas de delivery.

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Banco de dados:** PostgreSQL (Docker)
- **ORM:** Prisma 6
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Storage:** UploadThing
- **Linguagem:** TypeScript

---

## Funcionalidades

- Cardápio por estabelecimento com slug único
- Busca de produtos no cardápio
- Produtos em destaque (badges)
- Carrinho de compras com notas por item
- Cupom de desconto por restaurante
- Identificação do cliente (nome, telefone, mesa)
- Geração de QR Code por mesa
- Confirmação de pedido com tracking em tempo real
- Histórico de pedidos por telefone
- Display de cozinha com autenticação por senha
- Painel Admin para gerenciar restaurantes, categorias e produtos

---

## Configuração local

### 1. Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
DATABASE_URL="postgresql://pedefree:pedefree123@localhost:5433/pedefree?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
UPLOADTHING_SECRET="seu-secret-uploadthing"
UPLOADTHING_APP_ID="Pedefree"
ADMIN_EMAIL="admin@pedefree.com"
ADMIN_PASSWORD="sua-senha-admin"
```

### 2. Banco de dados

```bash
docker compose up -d
npx prisma db push
npx prisma db seed
```

### 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Docker

```bash
# Subir banco
docker compose up -d

# Parar banco
docker compose down
```

Container: `pedefree-db` · Porta: `5433`

---

## Admin

Acesse `/admin` para gerenciar o sistema.

Credenciais padrão definidas no `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/:slug/menu?consumptionMethod=DINE_IN` | Cardápio do restaurante |
| `/:slug/kitchen` | Display da cozinha |
| `/:slug/orders/:id` | Status do pedido |
| `/:slug/order-history` | Histórico por telefone |
| `/:slug/qrcode` | Gerador de QR Code |
| `/admin` | Painel administrativo |
