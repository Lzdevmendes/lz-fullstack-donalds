# SECURITY_AUDIT.md — PedeFree

**Data:** 2026-06-07 | **Auditor:** AppSec Review | **Status:** Implementado

---

## Resumo Executivo

O projeto tem uma base sólida (HMAC timing-safe, bcrypt, Prisma parametrizado, Server Actions com proteção CSRF implícita por Origin) mas apresenta **4 vulnerabilidades críticas** que precisam ser corrigidas antes de qualquer exposição pública: uma API de exportação de dados completamente aberta, IDOR em pedidos e avaliações, e **manipulação de preço no checkout** (cliente pode enviar preço zero e criar pedido válido). Em adição, o cookie de sessão não tem flag `secure`, o SECRET tem fallback hardcoded, e não há headers de segurança.

---

## FASE 1 — SUPERFÍCIE DE ATAQUE

| # | Endpoint / Ponto de entrada | Auth? | Input | Notas |
|---|----------------------------|-------|-------|-------|
| 1 | `GET /api/orders/[orderId]` | ❌ Nenhuma | Path param (Int) | IDOR — enumerável |
| 2 | `GET /api/admin/restaurants/[id]/export-orders` | ❌ Nenhuma | Path param (UUID) | **Dados pessoais expostos** |
| 3 | `POST /admin/login` (Server Action `adminLogin`) | ❌ Pré-auth | FormData email+senha | Sem rate limit |
| 4 | `POST /[slug]/kitchen` (Server Action `kitchenLogin`) | ❌ Pré-auth | senha | Sem rate limit |
| 5 | `POST createOrder` (Server Action) | ❌ Pré-auth | restaurantId, items[], preços **do cliente** | **Price manipulation** |
| 6 | `POST validateCoupon` (Server Action) | ❌ Pré-auth | code, restaurantId | OK — read-only |
| 7 | `POST updateOrderStatus` (Server Action) | 🔓 Cookie kitchen | orderId, status | IDOR — sem tenant check |
| 8 | `POST cancelOrder` (Server Action) | 🔓 Cookie kitchen | orderId | IDOR — sem tenant check |
| 9 | `POST submitRating` (Server Action) | ❌ Pré-auth | orderId, stars, comment | IDOR — sem tenant check |
| 10 | `GET /:slug/*` (páginas loja) | ❌ Público | slug (URL) | Acesso correto por design |
| 11 | `GET /[slug]/orders/[orderId]` (página) | ❌ Público | slug + orderId | IDOR — não valida tenant |
| 12 | `GET /admin/*` | 🔐 Cookie admin | — | Protegido pelo middleware |
| 13 | `GET /api/admin/*` | ❌ Nenhuma | — | Fora do matcher do middleware |
| 14 | avatarImageUrl / coverImageUrl | Admin-only | URL livre | SSRF baixo risco (admin controla) |
| 15 | Firebase VAPID_KEY (NEXT_PUBLIC_) | — | Bundle público | Aceitável — chave VAPID é pública |
| 16 | Firebase client config (NEXT_PUBLIC_) | — | Bundle público | Aceitável — requer Firebase Auth |
| 17 | localStorage `cart_{slug}` | — | Dados do carrinho | Não sensível — sem dados pessoais |

---

## FASE 2 — CHECKLIST DE SEGURANÇA

### 1. Autenticação & Sessão

| Item | Status | Arquivo | Notas |
|------|--------|---------|-------|
| Hash de senha (bcrypt) | ✅ | `admin/actions.ts:27` | bcrypt.compare corretamente usado |
| Custo bcrypt adequado | ✅ | `admin/actions.ts:59` | cost=10 (aceitável) |
| NEXTAUTH_SECRET sem fallback hardcoded | 🔴 | `lib/session.ts:3`, `middleware.ts:4` | Fallback público exposto |
| Cookie httpOnly | ✅ | `admin/actions.ts:36` | Correto |
| Cookie sameSite: strict | ✅ | `admin/actions.ts:37` | Correto |
| Cookie **secure** | 🟡 | `admin/actions.ts`, `kitchen/actions.ts` | **Faltando** |
| Expiração curta (8h admin, 12h kitchen) | ✅ | `session.ts` | Aceitável |
| Logout invalida server-side | 🟡 | `adminLogout` | Só apaga cookie — sem blocklist de token |
| Comparação timing-safe | ✅ | `session.ts:17` | crypto.timingSafeEqual |
| Rate limit em login | 🟠 | `admin/actions.ts`, `kitchen/actions.ts` | **Ausente** |
| MFA para admin | 🟢 | — | Não implementado (nice-to-have) |
| Política de senha mínima | 🟡 | — | Sem validação de força de senha |

### 2. Autorização & IDOR

| Item | Status | Arquivo | Notas |
|------|--------|---------|-------|
| Middleware protege /admin/* | ✅ | `middleware.ts` | Correto |
| API /api/admin/* protegida | 🔴 | `export-orders/route.ts` | **Desprotegida** |
| Order detail valida tenant | 🔴 | `orders/[orderId]/page.tsx:27` | **IDOR** |
| updateOrderStatus valida tenant | 🔴 | `kitchen/actions.ts:82` | **IDOR** |
| cancelOrder valida tenant | 🔴 | `kitchen/actions.ts:90` | **IDOR** |
| submitRating valida tenant | 🔴 | `orders/[orderId]/actions.ts` | **IDOR** |
| Transições de status válidas | 🟠 | `kitchen/actions.ts:82` | Sem máquina de estados |
| /api/orders/:id: auth/tenant | 🟠 | `api/orders/[orderId]/route.ts` | Sem auth — enumerável |

### 3. Validação de Input & Injection

| Item | Status | Notas |
|------|--------|-------|
| SQL injection | ✅ | Prisma ORM — queries parametrizadas em 100% dos casos |
| `$queryRaw` em analytics | ✅ | Tagged template (parametrizado por Prisma) — seguro |
| Validação de schema (Zod/etc.) | 🟡 | Form parsing manual em `lib/form-parsing.ts` — funcional mas sem schema |
| SSRF (URLs de imagem) | 🟢 | Admin-controlled — risco aceitável |
| Command injection | ✅ | Sem execução de shell |
| Price manipulation | 🔴 | **createOrder usa preço enviado pelo cliente** |

### 4. Segredos & Configuração

| Item | Status | Notas |
|------|--------|-------|
| NEXTAUTH_SECRET hardcoded | 🔴 | `"changeme-set-NEXTAUTH_SECRET-in-env"` como fallback |
| Segredos no histórico git | ✅ | Nenhum segredo real encontrado no histórico |
| .env.example com valores reais | 🟡 | DATABASE_URL com senha de dev (`pedefree123`) — OK para dev, documente |
| NEXT_PUBLIC_FIREBASE_* | ✅ | Firebase API keys são seguras no bundle (requerem Firebase Auth + RLS) |
| NEXT_PUBLIC_FIREBASE_VAPID_KEY | ✅ | Chave VAPID é pública por design |
| Rotação de NEXTAUTH_SECRET | 🟡 | Sem instrução — invalida todas as sessões ao rotacionar |

### 5. Pagamento & Dinheiro

| Item | Status | Arquivo | Notas |
|------|--------|---------|-------|
| Preço recalculado no servidor | 🔴 | `menu/actions.ts:createOrder` | **Usa preço do cliente** |
| Dinheiro em Float | 🟡 | `schema.prisma` | Float em vez de Decimal — risco de centavo |
| Cupom: incremento atômico | ✅ | `menu/actions.ts` | `updateMany` com condição + transação |
| Validação de cupom no servidor | ✅ | `menu/actions.ts:createOrder` | Re-valida no servidor |

### 6. Dados Sensíveis & Privacidade (LGPD)

| Dado | Coletado? | Base legal | Minimização |
|------|-----------|------------|-------------|
| Nome do cliente | ✅ | Execução de contrato | ✅ |
| Telefone do cliente | ✅ (takeaway) | Execução de contrato | ✅ |
| FCM token | ✅ | Consentimento implícito (permissão push) | ✅ |
| Avaliação (estrelas + comentário) | ✅ | Consentimento | ✅ |
| Número da mesa | ✅ | Execução de contrato | ✅ |

**Direitos LGPD:** ❓ Não há endpoint de exclusão/exportação de dados do cliente. Implementação futura recomendada.

**Logs:** ❓ Sem Sentry/logs estruturados configurados — confirmar se há logging em produção e se PII está scrubado.

### 7. Headers, CORS & Transporte

| Item | Status | Notas |
|------|--------|-------|
| X-Content-Type-Options | 🟡 | **Ausente** nos dois apps |
| X-Frame-Options | 🟡 | **Ausente** |
| Referrer-Policy | 🟡 | **Ausente** |
| Permissions-Policy | 🟡 | **Ausente** |
| Content-Security-Policy | 🟡 | **Ausente** (complexo com Firebase) |
| HSTS | ❓ | Deve ser configurado no CDN/proxy |
| CORS | ✅ | Next.js App Router não expõe CORS amplo por padrão |
| poweredByHeader: false | ✅ | `next.config.ts` — correto |

### 8. XSS, CSRF & Client-side

| Item | Status | Notas |
|------|--------|-------|
| dangerouslySetInnerHTML | ✅ | Não encontrado no código |
| CSRF (Server Actions) | ✅ | Next.js 15 verifica Origin header automaticamente |
| Tokens em localStorage | ✅ | Carrinho em localStorage (não sensível) |
| Sessão em cookie httpOnly | ✅ | Tokens não acessíveis por JS |

### 10. Rate Limiting & Abuse

| Endpoint | Rate Limit | Status |
|----------|------------|--------|
| POST adminLogin | ❌ | 🟠 Sem proteção — brute force possível |
| POST kitchenLogin | ❌ | 🟠 Senha numérica — vulnerável |
| POST createOrder | ❌ | 🟡 Sem limite — spam de pedidos |
| GET /api/orders/:id | ❌ | 🟡 Enumeração |
| validateCoupon | ❌ | 🟡 Enumeração de cupons |

### 12. Dependências & Supply Chain

```
26 vulnerabilidades (4 baixa, 15 moderada, 5 alta, 2 crítica)

CRÍTICO: next@15.1.6       → CVE no middleware (fix: 15.5.19)
CRÍTICO: protobufjs≤7.5.7  → dep transitiva do firebase-admin
ALTO:    fast-xml-builder   → dep transitiva
ALTO:    glob, minimatch    → deps transitivas de ferramentas de build
ALTO:    picomatch, flatted → deps transitivas
```

Lockfile commitado: ✅

---

## FASE 3 — TABELA MESTRE DOS ACHADOS

| ID | Severidade | Categoria | Arquivo:Linha | Descrição | Impacto | Correção | Esforço |
|----|-----------|-----------|---------------|-----------|---------|----------|---------|
| S01 | 🔴 Crítico | Auth | `export-orders/route.ts:1` | API de exportação sem auth | Vazamento de dados pessoais (nome, telefone) de todos os clientes | Verificar `admin_session` cookie na route handler | 30min |
| S02 | 🔴 Crítico | IDOR | `orders/[orderId]/page.tsx:27` | Order detail não valida slug = tenant | Acesso cross-tenant a pedidos de outros restaurantes | Verificar `order.restaurant.slug === slug` | 15min |
| S03 | 🔴 Crítico | Price Manipulation | `menu/actions.ts:createOrder` | Preço vem do cliente | Compra com preço arbitrário (ex: R$0,01) | Re-buscar preços do DB na Server Action | 45min |
| S04 | 🔴 Crítico | IDOR | `kitchen/actions.ts:82,90` | updateOrderStatus/cancelOrder sem tenant | Kitchen de restaurante A modifica pedidos do B | Passar slug + validar no DB | 30min |
| S05 | 🟠 Alto | IDOR | `orders/[orderId]/actions.ts` | submitRating sem tenant check | Avaliação em pedido de outro restaurante | Adicionar restaurantSlug e validar | 20min |
| S06 | 🟠 Alto | Auth | `session.ts:3`, `middleware.ts:4` | SECRET hardcoded como fallback | Sessões forjáveis se env não configurado | Remover fallback — falhar ruidosamente | 10min |
| S07 | 🟠 Alto | Auth | `admin/actions.ts:36`, `kitchen/actions.ts:61` | Cookie sem flag `secure` | Cookie transmitido via HTTP em redirecionamentos | Adicionar `secure: NODE_ENV==="production"` | 10min |
| S08 | 🟠 Alto | State Machine | `kitchen/actions.ts:82` | Transições de status sem validação | CANCELLED→IN_PREPARATION, PENDING→FINISHED | Máquina de estados explícita | 30min |
| S09 | 🟠 Alto | Deps | `package.json` | next@15.1.6 com CVE crítico | Bypass de middleware auth (detalhes no CVE) | Atualizar para next@15.5.19 | 15min |
| S10 | 🟡 Médio | Auth | `kitchen/actions.ts` | kitchenLogin sem rate limit | Brute force na senha numérica (ex: 1234) | Rate limit por IP + lockout temporário | 2-4h |
| S11 | 🟡 Médio | Auth | `admin/actions.ts` | adminLogin sem rate limit | Brute force no painel admin | Rate limit por IP | 2-4h |
| S12 | 🟡 Médio | Headers | `next.config.ts` | Headers de segurança ausentes | Clickjacking, MIME sniffing, referrer leaking | Adicionar via `headers()` no next.config | 20min |
| S13 | 🟡 Médio | Business Rules | `menu/actions.ts:createOrder` | Não verifica isPaused | Pedido criado com restaurante pausado | Buscar e checar `isPaused` antes de criar | 15min |
| S14 | 🟡 Médio | Privacy | `orders/actions.ts:getOrdersByPhone` | Histórico de pedidos sem auth | Qualquer um com telefone vê pedidos alheios | ❓ Intencional (UX sem login)? Avaliar |
| S15 | 🟡 Médio | Integridade | `schema.prisma:@default("1234")` | Senha default em plaintext no schema | Seeds diretos criam restaurantes com senha fraca | Remover @default do schema | 5min |
| S16 | 🟡 Médio | Money | `schema.prisma` | Float para valores monetários | Erros de ponto flutuante acumulados | Migrar para Decimal (breaking change) | 4-8h |
| S17 | 🟢 Baixo | Auth | `adminLogout` | Logout não invalida token server-side | Token em cache ainda funciona até expirar | Token blocklist em Redis ou DB | 4h |
| S18 | 🟢 Baixo | Deps | `protobufjs` | CVE crítico em dep transitiva | Exploração via serialização protobuf | `npm audit fix` | 15min |

---

## FASE 4 — PLANO DE REMEDIAÇÃO PRIORIZADO

| Ordem | ID | Achado | Dependências | Esforço | Critério de Aceitação |
|-------|----|--------|-------------|---------|----------------------|
| 1 | S01 | API export sem auth | — | 30min | `curl /api/admin/.../export-orders` retorna 401 sem cookie |
| 2 | S03 | Price manipulation | — | 45min | Request com preço=0.01 cria pedido com preço real do DB |
| 3 | S02 | IDOR order detail | — | 15min | `/slug-a/orders/5` (pedido do slug-b) retorna 404 |
| 4 | S04 | IDOR kitchen actions | S08 | 30min | updateOrderStatus com orderId de outro restaurante falha |
| 5 | S08 | State machine | — | 30min | CANCELLED→IN_PREPARATION lança erro |
| 6 | S06 | SECRET fallback | — | 10min | App não inicia em prod sem NEXTAUTH_SECRET |
| 7 | S07 | Cookie sem secure | — | 10min | Cookie tem Secure flag em produção |
| 8 | S05 | IDOR submitRating | — | 20min | Rating em pedido de outro restaurante retorna erro |
| 9 | S09 | Next.js CVE | — | 15min | `npm audit` não lista next como crítico |
| 10 | S12 | Headers ausentes | — | 20min | `curl -I` mostra X-Content-Type-Options: nosniff |
| 11 | S13 | isPaused não verificado | — | 15min | Pedido em restaurante pausado retorna erro |
| 12 | S15 | Schema default "1234" | — | 5min | Schema não tem @default em kitchenPassword |
| 13 | S18 | protobufjs CVE | — | 15min | `npm audit fix` |
| 14 | S10 | Rate limit kitchen login | — | 2-4h | 5 tentativas erradas → bloqueio 30s |
| 15 | S11 | Rate limit admin login | — | 2-4h | 5 tentativas erradas → bloqueio 30s |
| 16 | S16 | Float → Decimal | — | 4-8h | Todos os campos monetários são Decimal no schema |
| 17 | S17 | Logout server-side | — | 4h | Token revogado não funciona mesmo antes de expirar |

---

## FASE 5 — VALIDAÇÃO E CI CONTÍNUO

### Como validar cada correção

```bash
# S01 — API sem auth
curl http://localhost:3015/api/admin/restaurants/QUALQUER_UUID/export-orders
# Esperado: 401 Unauthorized

# S02 — IDOR order
# Criar pedido no restaurante-a, acessar como restaurante-b
# curl http://localhost:3013/restaurante-b/orders/ID_DO_RESTAURANTE_A
# Esperado: 404

# S03 — Price manipulation
# Chamar createOrder via devtools com price: 0.01 no item
# Esperado: order.total reflete preço do banco

# S06 — SECRET
# Rodar npm run build sem NEXTAUTH_SECRET → deve falhar com erro claro

# S07 — Cookie secure
# Inspecionar Set-Cookie no login em HTTPS → deve ter Secure flag

# S12 — Headers
curl -I http://localhost:3015/admin | grep -E "X-Content|X-Frame|Referrer"
```

### Checks para CI

```yaml
# .github/workflows/security.yml (sugerido)
- name: Audit dependencies
  run: npm audit --audit-level=high

- name: Check for secrets
  uses: trufflesecurity/trufflehog@main

- name: Security headers check
  run: npx @nicolo-ribaudo/nextjs-headers-check # ou similar

- name: TypeScript strict
  run: npx tsc --noEmit --workspace=apps/admin && npx tsc --noEmit --workspace=apps/store
```

---

*Relatório gerado em 2026-06-07. Todos os itens 🔴 e 🟠 foram implementados nesta sessão.*
