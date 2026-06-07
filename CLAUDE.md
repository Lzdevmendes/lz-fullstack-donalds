# PedeFree — Regras do Projeto

## Contexto Rápido

SaaS multi-tenant de cardápio digital por QR code. Monorepo npm workspaces:
- `apps/admin` → painel do dono (porta 3015)
- `apps/store` → loja/cozinha/QR codes (porta 3013)
- `prisma/` → schema PostgreSQL compartilhado

**Para entender o domínio:** leia `agents/overview.md`
**Para entender a arquitetura:** leia `agents/architecture.md`
**Para entender a stack:** leia `agents/stack.md`
**Para convenções de código:** leia `agents/conventions.md`
**Glossário de entidades:** leia `agents/glossary.md`

---

## As 5 Regras que NÃO se podem quebrar

### 1. Nunca confie em ID sem checar o tenant
`Order.id` é Int autoincrement — enumerável. Toda query que acessa pedido/produto/cupom deve incluir `restaurantId` ou `restaurant: { slug }` no `where` do Prisma.

```ts
// ❌ ERRADO
await db.order.findUnique({ where: { id: orderId } });

// ✅ CERTO
await db.order.findUnique({ where: { id: orderId, restaurantId } });
```

### 2. Rotas de API do admin precisam de auth manual
O middleware só protege `/admin/*` (HTML). Rotas `/api/admin/*` são abertas por padrão — adicione verificação de sessão em toda nova route handler do admin.

### 3. Cupom só é incrementado dentro de transação com condição otimista
```ts
await tx.coupon.updateMany({
  where: { id, isActive: true, usedCount: { lt: maxUses } },
  data: { usedCount: { increment: 1 } },
});
```
Nunca incremente `usedCount` fora de transação ou sem a condição de guarda.

### 4. Dinheiro: não faça aritmética simples em Float para comparação
`Product.price`, `Order.total` são `Float` (IEEE 754). Para exibição use `toFixed(2)`. Para cálculos de desconto, arredonde o resultado final. A migração ideal é para `Decimal` ou inteiro em centavos.

### 5. Atualize os docs ao mudar arquitetura ou banco
- Novo modelo Prisma → atualize `docs/database.md` e `agents/glossary.md`
- Nova rota, serviço ou auth → atualize `agents/architecture.md` e `docs/architecture.md`

---

## Regras de Commit

- Formato: `tipo: descrição curta em português`
- **Apenas título — sem body, sem descrição longa**
- Tipos: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`
- Commits separados por contexto

## Como rodar

```bash
npm run dev           # admin (:3015) + store (:3013) juntos
npm run dev:admin     # só o admin
npm run dev:store     # só a loja
npm run db:push       # aplica schema no banco
npm run db:generate   # gera Prisma client
npm run db:seed       # seed padrão
```
