# Banco de Dados

## Modelos Prisma

### Restaurant
Representa um restaurante cadastrado na plataforma.

| Campo           | Tipo    | Descrição                              |
|-----------------|---------|----------------------------------------|
| id              | String  | UUID                                   |
| slug            | String  | Identificador único na URL (`/[slug]`) |
| primaryColor    | String  | HSL sem `hsl()` (ex: `"42 100% 50%"`) |
| kitchenPassword | String  | Senha da tela de cozinha               |
| tableCount      | Int     | Número de mesas                        |
| isPaused        | Boolean | Pausa recebimento de pedidos           |

### Order
Pedido feito pelo cliente.

| Campo             | Tipo              | Descrição                    |
|-------------------|-------------------|------------------------------|
| status            | OrderStatus       | PENDING / IN_PREPARATION / FINISHED / CANCELLED |
| consumptionMethod | ConsumptionMethod | DINE_IN / TAKEAWAY           |
| fcmToken          | String?           | Token para push notification |
| tableNumber       | Int?              | Null em TAKEAWAY             |

### Product
Produto do cardápio.

- Pertence a um `Restaurant` e a uma `MenuCategory`
- `isAvailable` controla visibilidade no cardápio
- `ingredients` é array de strings
- `badge` é texto livre opcional (ex: "Novo", "Popular")

### Coupon
Cupom de desconto por restaurante.

- `discountPercent` em número inteiro (ex: 10 = 10%)
- `maxUses` e `usedCount` controlam limite de uso

### OpeningHours
Horário de funcionamento por dia da semana.

- `dayOfWeek`: 0 = domingo, 6 = sábado
- `openTime` / `closeTime`: formato "HH:MM"
- `isClosed`: marca o dia como fechado independente dos horários

### Enums

```
OrderStatus:       PENDING | IN_PREPARATION | FINISHED | CANCELLED
ConsumptionMethod: TAKEAWAY | DINE_IN
```

## Índices relevantes

```
Order:   [restaurantId, createdAt DESC]  → listagem de pedidos do admin
Order:   [restaurantId, status]          → filtro por status na cozinha
Product: [restaurantId, isAvailable]     → cardápio filtrado
Product: [menuCategoryId, isAvailable]   → produtos por categoria
```
