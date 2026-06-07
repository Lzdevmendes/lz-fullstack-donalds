import { ExternalLinkIcon, PlusIcon, SettingsIcon, StoreIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import { adminLogout, deleteRestaurant } from "./actions";

const AdminPage = async () => {
  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, orders: true } } },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <span className="text-base font-black text-primary-foreground">P</span>
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">PedeFree</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <form action={adminLogout}>
            <Button variant="ghost" size="sm" type="submit" className="rounded-xl text-xs text-muted-foreground">
              Sair
            </Button>
          </form>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Barra de título + ação */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Restaurantes</h2>
            <p className="text-sm text-muted-foreground">
              {restaurants.length === 0
                ? "Nenhum restaurante cadastrado ainda"
                : `${restaurants.length} restaurante${restaurants.length > 1 ? "s" : ""} cadastrado${restaurants.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild className="h-10 rounded-2xl text-sm font-semibold" size="sm">
            <Link href="/admin/restaurants/new">
              <PlusIcon size={16} />
              Novo restaurante
            </Link>
          </Button>
        </div>

        {/* Lista vazia */}
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <StoreIcon size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold">Nenhum restaurante cadastrado</p>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              Comece criando o primeiro restaurante
            </p>
            <Button asChild className="rounded-2xl" size="sm">
              <Link href="/admin/restaurants/new">Criar restaurante</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{r.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono">/{r.slug}</span>
                    <span>{r._count.products} produtos</span>
                    <span>·</span>
                    <span>{r._count.orders} pedidos</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="h-8 rounded-xl border-border text-xs">
                    <Link href={`/admin/restaurants/${r.id}`}>
                      <SettingsIcon size={13} />
                      Gerenciar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8 rounded-xl border-border text-xs">
                    <Link href={`/${r.slug}?consumptionMethod=DINE_IN`} target="_blank">
                      <ExternalLinkIcon size={13} />
                      Ver menu
                    </Link>
                  </Button>
                  <form
                    action={async () => {
                      "use server";
                      await deleteRestaurant(r.id);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      className="h-8 rounded-xl text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      Excluir
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
