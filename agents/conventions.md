# Convenções de Código — PedeFree

## Como adicionar um novo endpoint (Server Action)

1. Crie ou edite o arquivo `actions.ts` na pasta da rota correspondente
2. Marque o arquivo ou a função com `"use server"`
3. Sempre valide o tenant: busque o recurso pelo `id` + `restaurantId` no `where`
4. Use `revalidatePath()` ao final para invalidar o cache da página
5. Use `redirect()` (de next/navigation) para redirecionar após mutação

```ts
// Exemplo correto — valida tenant
export const updateProduct = async (productId: string, restaurantId: string, ...) => {
  await db.product.update({
    where: { id: productId, restaurantId }, // ← sempre inclua o tenant
    data: { ... },
  });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
};
```

## Como adicionar uma rota de API

1. Crie `apps/[admin|store]/src/app/api/[caminho]/route.ts`
2. Se for rota do admin: adicione verificação de sessão manual (o middleware não cobre `/api/*`)
3. Valide e sanitize todos os params
4. Inclua tenant no `where` das queries Prisma

## Como adicionar um novo modelo Prisma

1. Edite `/prisma/schema.prisma` na raiz do monorepo
2. Rode `npm run db:push` para aplicar no banco
3. Rode `npm run db:generate` se necessário (o `db:push` já roda generate)
4. Atualize `docs/database.md` com o novo modelo

## Padrão de lib compartilhada

Cada app tem sua própria cópia dos arquivos de `lib/`. Se mudar `session.ts` em um app, lembre de replicar nos dois.

## Padrão de formulário com Server Action

```tsx
// "use client" no componente
const [state, action, isPending] = useActionState(myAction, {});
return <form action={action}>...</form>;
```

## Padrão de autenticação de rotas

Admin: o middleware protege `/admin/*` automaticamente. Rotas API do admin precisam verificar manualmente:
```ts
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/session";

const session = (await cookies()).get("admin_session");
if (!session?.value || !verifyAdminSession(session.value)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Kitchen: verificação na Server Component da página:
```ts
const token = cookieStore.get(`kitchen_${slug}`)?.value;
const isAuthenticated = !!token && verifyKitchenSession(token) === slug;
```

## Import order (eslint-plugin-simple-import-sort)

```ts
// 1. Externos (node_modules)
import { something } from "next/server";

// linha em branco entre grupos

// 2. Internos (path alias @/)
import { db } from "@/lib/prisma";
```

## Commits

- Formato: `tipo: descrição curta em português`
- Apenas título — sem body
- Tipos: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`
