# Glossário de Entidades — PedeFree

## Restaurant
Tenant principal do sistema. Cada restaurante tem um `slug` único que aparece na URL.
- `isPaused: Boolean` — quando true, impede criação de pedidos (⚠️ não verificado em createOrder atualmente)
- `kitchenPassword: String` — hash bcrypt da senha da cozinha
- `primaryColor: String` — HSL sem parênteses (ex: `"42 100% 50%"`) usado como CSS custom property

## MenuCategory
Agrupamento de produtos no cardápio (ex: "Lanches", "Bebidas").

## Product
Item do cardápio.
- `isAvailable: Boolean` — toggle sem deletar o produto
- `price: Float` — ⚠️ Float, não Decimal. Risco de imprecisão monetária.
- `ingredients: String[]` — lista de ingredientes
- `badge: String?` — texto livre opcional ("NOVO", "MAIS_PEDIDO", "PROMOCAO")

## Order
Pedido realizado por um cliente.
- `id: Int` (autoincrement) — ⚠️ Enumerável. Não use para controle de acesso sem cruzar tenant.
- `status: OrderStatus` — PENDING | IN_PREPARATION | FINISHED | CANCELLED
- `consumptionMethod: ConsumptionMethod` — DINE_IN | TAKEAWAY
- `fcmToken: String?` — token FCM do browser do cliente para push notification
- `total: Float` — ⚠️ Float. Valor total com desconto de cupom aplicado.

## OrderProduct
Linha de item dentro de um pedido.
- `price: Float` — preço no momento da compra (snapshot — produto pode mudar depois)
- `notes: String?` — observações do cliente

## Rating
Avaliação do pedido (1-5 estrelas). Criada apenas quando `Order.status === FINISHED`. Um por pedido.

## Coupon
Cupom de desconto vinculado a um restaurante.
- `discountPercent: Int` — porcentagem de desconto (1-100)
- `usedCount: Int` — incrementado atomicamente em transação
- `maxUses: Int` — limite de usos
- `isActive: Boolean` — pode ser desativado pelo admin sem deletar
- `expiresAt: DateTime?` — validade opcional

## OpeningHours
Grade de horário de funcionamento por dia da semana.
- `dayOfWeek: Int` — 0 = domingo, 6 = sábado
- `openTime / closeTime: String` — formato "HH:MM"
- `isClosed: Boolean` — marca o dia como fechado

## Enums

```
OrderStatus:       PENDING | IN_PREPARATION | FINISHED | CANCELLED
ConsumptionMethod: TAKEAWAY | DINE_IN
```
