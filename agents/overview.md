# Domínio e Regras de Negócio — PedeFree

## O que é

SaaS multi-tenant de cardápio digital + pedidos por QR code para restaurantes. Cada restaurante tem sua própria URL (`/:slug`), acessada via QR codes nas mesas.

## Entidades-chave

- **Restaurant** — tenant do sistema. Identificado pelo `slug` (chave de multi-tenancy).
- **MenuCategory / Product** — cardápio. Produto pode ser marcado `isAvailable: false` sem ser deletado.
- **Order** — pedido de um cliente. `id` é Int autoincrement (enumerável — ponto de atenção).
- **OrderProduct** — linha de item dentro de um pedido.
- **Coupon** — desconto percentual com limite de usos e validade. Vinculado ao restaurante.
- **OpeningHours** — grade de horário por dia da semana (0=dom, 6=sáb).
- **Rating** — avaliação do pedido (1-5 estrelas). Só para pedidos FINISHED, 1 por pedido.

## Regras de Negócio Críticas

1. **Multi-tenancy por slug** — toda ação do cliente deve ser validada contra `restaurantId`. Nunca confie só no `orderId` sem verificar o tenant.
2. **Estado do pedido** — fluxo esperado: `PENDING → IN_PREPARATION → FINISHED` ou `PENDING/IN_PREPARATION → CANCELLED`. Não há máquina de estados implementada — transições abertas.
3. **Cupom é atômico** — o `usedCount` é incrementado dentro de uma transação com condição otimista. Nunca incremente fora de transação.
4. **isPaused** — quando `true`, o restaurante não deve aceitar novos pedidos. **ATENÇÃO:** `createOrder` não verifica esse campo atualmente.
5. **OpeningHours** — define quando o restaurante está aberto. **ATENÇÃO:** `createOrder` não verifica esse campo atualmente.
6. **kitchenPassword** — armazenada como bcrypt hash (via admin actions). Registros antigos podem estar em plaintext — o login tem fallback de compatibilidade.
7. **Dinheiro como Float** — `Product.price`, `Order.total`, `OrderProduct.price` são `Float`. Risco de imprecisão acumulada. Migração para `Decimal` ou inteiro em centavos é recomendada.

## Fluxo do Cliente (QR code → pedido)

```
QR code na mesa → /:slug?consumptionMethod=DINE_IN&table=5
  → RestaurantApp (tela de boas-vindas)
  → seleciona método (comer aqui / para levar)
  → menu com categorias e produtos
  → abre produto → adiciona ao carrinho
  → CartSheet → formulário com nome/telefone/mesa
  → createOrder() → cria no banco → redireciona para /:slug/orders/:id
  → OrderStatusPoller faz polling a cada 10s até FINISHED/CANCELLED
  → Cozinha atualiza status → FCM push notifica o cliente
```

## Fluxo da Cozinha

```
/:slug/kitchen → senha (kitchenPassword) → KitchenBoard
  → lista pedidos PENDING e IN_PREPARATION
  → atualiza status → envia FCM push ao cliente
  → pode pausar restaurante e toggle disponibilidade de produto
```

## Fluxo do Admin

```
/admin/login → HMAC session cookie (8h)
  → lista restaurantes
  → cria/edita restaurante (slug, cores, senha cozinha, horários)
  → gerencia produtos, categorias, cupons
  → analytics de vendas
  → exporta pedidos como CSV
```
