# PedeFree — Regras do Projeto

## Contexto Rápido

Plataforma de cardápio digital para restaurantes. Monorepo com dois apps Next.js:
- `apps/admin` → painel do dono (porta 3015)
- `apps/store` → loja/cozinha/QR codes (porta 3013)

Leia `docs/architecture.md` para arquitetura completa e `docs/database.md` para o banco de dados.

---

## Regras de Commit

- **Sempre** criar commits com apenas o título (sem body, sem descrição longa)
- Formato: `tipo: descrição curta em português`
- Tipos aceitos: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`
- Exemplos:
  - `feat: adicionar tela de cupons no admin`
  - `fix: corrigir cálculo de desconto no carrinho`
  - `chore: atualizar dependências`
- **Nunca** usar `--amend` em commits já feitos
- **Nunca** pular hooks com `--no-verify`
- Commits separados por contexto — não agrupar mudanças não relacionadas

## Regras de Documentação

- **Sempre** atualizar `docs/architecture.md` ao:
  - Adicionar um novo app ou serviço
  - Mudar porta de desenvolvimento
  - Alterar fluxo de autenticação
  - Adicionar integração externa nova (Firebase, Stripe, etc.)

- **Sempre** atualizar `docs/database.md` ao:
  - Adicionar, remover ou modificar um modelo Prisma
  - Adicionar um novo enum
  - Adicionar índices relevantes

- Ao criar uma nova feature significativa, verificar se os docs precisam de atualização antes de commitar.

## Regras de Código

- Apps Next.js usam App Router — nunca criar rotas no Pages Router
- Sempre usar `@/` para imports dentro de cada app (aponta para `src/`)
- Prisma fica na raiz do monorepo — comandos de DB são rodados da raiz
- Não criar comentários óbvios no código — só quando o "por que" for não-óbvio
- Não adicionar tratamento de erro para cenários impossíveis
- Não criar abstrações antes de ter 3+ usos reais

## Estrutura de Pastas

```
apps/
  admin/    → painel administrativo
  store/    → loja do cliente
docs/       → documentação fixa do projeto (sempre atualizada)
agents/     → skills do Claude Code instaladas localmente
prisma/     → schema e seeds (compartilhado por ambos os apps)
```

## Como Rodar

```bash
npm run dev           # sobe admin (:3015) + store (:3013) juntos
npm run dev:admin     # só o admin
npm run dev:store     # só a loja
npm run db:generate   # gerar Prisma client
npm run db:push       # aplicar schema no banco
npm run db:seed       # seed padrão
```
