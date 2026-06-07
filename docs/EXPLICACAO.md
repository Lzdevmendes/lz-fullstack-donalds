# Explicação do Projeto — PedeFree

## O que é e para quem serve

PedeFree é uma plataforma de **cardápio digital + pedidos por QR code** para restaurantes locais. O dono do restaurante cadastra seus produtos no painel admin; o cliente acessa o cardápio escaneando um QR code na mesa, faz o pedido e acompanha o status em tempo real no celular, sem precisar instalar app.

Há três "usuários" do sistema:
- **Dono do restaurante** — usa o painel admin para criar/editar produtos, ver pedidos e analytics
- **Cozinha** — acessa a visão de cozinha pelo celular/tablet com senha própria; atualiza o status de cada pedido
- **Cliente** — acessa o cardápio pelo QR code na mesa, faz pedido, recebe notificação push quando fica pronto

---

## Como o app se comporta em runtime

### Jornada do Cliente

1. Cliente escaneia o QR code na mesa → abre `pedefree.com/gamboa?consumptionMethod=DINE_IN&table=5`
2. App detecta `consumptionMethod` na URL e vai direto para o cardápio (pula a tela de boas-vindas)
3. Cliente navega pelas categorias, clica em um produto → abre modal com detalhes
4. Clica "Adicionar ao carrinho" → produto entra no carrinho (gerenciado por um Context React)
5. Abre o carrinho → preenche nome, telefone, observações
6. Clica "Fazer pedido":
   - Se tinha cupom válido, o desconto é aplicado
   - Uma `Server Action` cria o pedido no banco atomicamente (com incremento de cupom na mesma transação)
   - Redireciona para `/gamboa/orders/42`
7. Página de confirmação: `OrderStatusPoller` faz requisição `GET /api/orders/42` a cada 10 segundos
8. Quando a cozinha muda o status, o servidor envia push via Firebase → cliente recebe notificação no celular

### Jornada do Dono do Restaurante

1. Acessa `admin.pedefree.com/admin/login` → informa email e senha
2. O servidor compara com `ADMIN_PASSWORD_HASH` (bcrypt) ou `ADMIN_PASSWORD`
3. Se válido, gera um token HMAC-SHA256 e guarda em cookie `admin_session` (8 horas)
4. Pode criar/editar restaurantes, produtos, categorias, cupons e horários de funcionamento
5. Pode ver analytics do restaurante e exportar pedidos como CSV

### Jornada da Cozinha

1. Acessa `/gamboa/kitchen` → é pedida a senha (armazenada como bcrypt hash no banco)
2. Token HMAC de kitchen é guardado em cookie `kitchen_gamboa` (12 horas)
3. KitchenBoard lista todos os pedidos PENDING e IN_PREPARATION em tempo real (polling a cada 10s)
4. Cozinheiro clica "Em preparo" → status atualiza + push notification vai para o cliente
5. Clica "Pronto" → push final é enviado

---

## O papel de cada tecnologia

### Next.js 15 — App Router
O esqueleto de tudo. Usa o modelo de **React Server Components (RSC)**: o servidor renderiza o HTML inicial e envia para o cliente, o que é mais rápido e seguro (dados sensíveis ficam no servidor). As **Server Actions** (`"use server"`) permitem chamar código de banco de dados diretamente de formulários, sem criar endpoints de API manualmente. Se você tirasse o Next.js, precisaria criar um backend separado (Express, Fastify) e um frontend separado (Vite, CRA).

### React 19
UI declarativa. Os componentes "descrevem" como a tela deve parecer dado um estado — o React cuida de atualizar o DOM. React 19 traz melhorias em Server Components e Actions. Sem React, o código de UI seria imperativo e muito mais complexo.

### Prisma ORM
Camada entre o código e o PostgreSQL. Gera tipos TypeScript a partir do schema, então o editor avisa se você tentar acessar um campo que não existe. O singleton `lib/prisma.ts` evita criar uma conexão nova a cada request. Sem Prisma, você escreveria SQL bruto e perderia toda a type-safety.

### Firebase Cloud Messaging (FCM)
Sistema de push notifications do Google. Quando o cliente abre a página de pedido, o browser pede permissão de notificação e registra um Service Worker. O Firebase gera um token único para aquele browser. Esse token é salvo no pedido (`Order.fcmToken`). Quando a cozinha muda o status, o servidor usa o Firebase Admin SDK para enviar uma mensagem para aquele token. Se você tirasse o Firebase, não haveria push notifications — o cliente só saberia do status mudando pelo polling.

### Autenticação HMAC Custom
Em vez de usar NextAuth.js ou Clerk, o projeto tem auth própria com HMAC-SHA256. Um token é gerado assim: `base64("admin:email@x.com:timestamp:assinatura")`. A assinatura é feita com a `NEXTAUTH_SECRET`. O middleware verifica a assinatura e a expiração em cada request. É simples e suficiente para um admin com um único usuário.

### shadcn/ui (Radix + CVA + tailwind-merge)
Biblioteca de componentes copiados para o projeto (não instalada como dependência). Radix UI provê comportamento acessível (modal, dialogs); CVA (class-variance-authority) provê variantes type-safe (`variant="outline"`); tailwind-merge resolve conflitos de classes Tailwind. O resultado são componentes como `<Button variant="ghost">` totalmente customizáveis.

### bcryptjs
Hashing de senhas de forma segura. Usado para `kitchenPassword` e `ADMIN_PASSWORD`. Sem bcryptjs, as senhas ficam em plaintext no banco — se o banco vazar, todas as senhas são expostas.

### qrcode.react
Gera os QR codes na página `/[slug]/qrcode`. A URL embutida no QR code inclui o slug do restaurante e o método de consumo, permitindo que o cliente seja redirecionado direto para o cardápio.

### concurrently
Roda os dois servidores de desenvolvimento (`apps/admin :3015` e `apps/store :3013`) com um único `npm run dev`. Sem ele, você precisaria de dois terminais.
