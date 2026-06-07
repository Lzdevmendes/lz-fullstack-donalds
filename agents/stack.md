# Stack e Bibliotecas — PedeFree

## Por que cada lib existe

| Lib | Papel | Remove e quebra |
|-----|-------|----------------|
| **Next.js 15** (App Router) | Framework full-stack — RSC, Server Actions, middleware de edge | Tudo |
| **React 19** | UI declarativa + hooks | Tudo |
| **Prisma 6** | ORM type-safe para PostgreSQL | Queries, migrações, seed |
| **@prisma/client** | Client gerado — tipos de todos os modelos | Type-safety nas queries |
| **firebase** (JS SDK) | `getToken` FCM no browser, registra service worker | Push notifications no cliente |
| **firebase-admin** | Envia push do servidor, inicializa com credenciais seguras | Push do lado do servidor |
| **bcryptjs** | Hash e compare da kitchenPassword e adminPassword | Auth admin e kitchen |
| **lucide-react** | Ícones SVG | Visual dos ícones |
| **qrcode.react** | Geração de QR code SVG/canvas | Página `/[slug]/qrcode` |
| **tailwindcss** | CSS utility-first | Toda a estilização |
| **tailwindcss-animate** | Classes de animação (animate-pulse, etc.) | Animações do status poller |
| **shadcn/ui** (Radix + CVA) | Componentes acessíveis (Button, Input, Sheet, etc.) | UI base dos formulários |
| **class-variance-authority** | Variantes de estilo type-safe nos componentes shadcn | Props `variant`/`size` |
| **tailwind-merge** | Merge de classes sem conflito | `cn()` util |
| **clsx** | Condicional de classes | `cn()` util |
| **concurrently** (root) | Roda admin + store juntos com `npm run dev` | Dev multi-app |
| **ts-node** (root) | Executa seeds Prisma em TypeScript | Scripts de seed |

## Variáveis de Ambiente

### Compartilhadas (ambos os apps leem)
```
DATABASE_URL              PostgreSQL connection string
NEXTAUTH_SECRET           Chave HMAC para tokens de sessão (mín. 32 chars)
```

### Admin (`apps/admin`)
```
ADMIN_EMAIL               E-mail do admin
ADMIN_PASSWORD_HASH       Hash bcrypt da senha (produção)
ADMIN_PASSWORD            Senha plaintext (dev apenas)
```

### Store (`apps/store`)
```
NEXT_PUBLIC_FIREBASE_*    Configuração Firebase client-side
FIREBASE_PROJECT_ID       Admin SDK
FIREBASE_CLIENT_EMAIL     Admin SDK
FIREBASE_PRIVATE_KEY      Admin SDK (com \n escapado)
NEXT_PUBLIC_FIREBASE_VAPID_KEY  Chave VAPID para web push
```
