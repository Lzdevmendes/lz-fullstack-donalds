import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import {
  createCategory,
  createCoupon,
  createProduct,
  deleteCategory,
  deleteCoupon,
  deleteProduct,
  toggleCoupon,
  toggleProductAvailability,
  updateCategory,
  upsertOpeningHours,
} from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const BADGE_OPTIONS = [
  { value: "", label: "Sem badge" },
  { value: "NOVO", label: "Novo" },
  { value: "MAIS_PEDIDO", label: "Mais pedido" },
  { value: "PROMOCAO", label: "Promoção" },
];

const RestaurantDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      menuCategories: {
        include: { products: { orderBy: { name: "asc" } } },
        orderBy: { name: "asc" },
      },
      coupons: { orderBy: { createdAt: "desc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!restaurant) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCategoryForRestaurant = createCategory.bind(null, id, {}) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createProductForRestaurant = createProduct.bind(null, id, {}) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createCouponForRestaurant = createCoupon.bind(null, id, {}) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertHoursForRestaurant = upsertOpeningHours.bind(null, id, {}) as any;

  const hoursMap = Object.fromEntries(
    restaurant.openingHours.map((h) => [h.dayOfWeek, h]),
  );

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* HEADER */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin">← Voltar</Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/restaurants/${id}/edit`}>Editar restaurante</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/restaurants/${id}/analytics`}>Analytics</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ADD CATEGORY */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Nova categoria</h2>
        <form action={createCategoryForRestaurant} className="flex gap-2">
          <input
            name="name"
            required
            placeholder="Nome da categoria"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" size="sm" className="rounded-full">
            Adicionar
          </Button>
        </form>
      </section>

      {/* ADD PRODUCT */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Novo produto</h2>
        <form action={createProductForRestaurant} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Nome *</label>
              <input
                name="name"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Preço (R$) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Categoria *</label>
              <select
                name="menuCategoryId"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione...</option>
                {restaurant.menuCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Badge</label>
              <select
                name="badge"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                {BADGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">URL da imagem *</label>
            <input
              name="imageUrl"
              type="url"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Descrição *</label>
            <textarea
              name="description"
              required
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Ingredientes (um por linha)
            </label>
            <textarea
              name="ingredients"
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" className="w-full rounded-full">
            Adicionar produto
          </Button>
        </form>
      </section>

      {/* CATEGORIES + PRODUCTS LIST */}
      <section className="mb-6 space-y-4">
        <h2 className="font-semibold">Cardápio</h2>
        {restaurant.menuCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria ainda.</p>
        ) : (
          restaurant.menuCategories.map((cat) => (
            <div key={cat.id} className="rounded-xl border bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <p className="font-semibold">{cat.name}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <form action={async (formData: FormData) => {
                    "use server";
                    await updateCategory(cat.id, id, {}, formData);
                  }} className="flex gap-2">
                    <input name="name" defaultValue={cat.name} className="rounded border px-2 py-0.5 text-xs" />
                    <button type="submit" className="text-xs text-green-600 hover:text-green-800">Renomear</button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategory(cat.id, id);
                    }}
                  >
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                      Excluir categoria
                    </button>
                  </form>
                </div>
              </div>
              {cat.products.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Nenhum produto nesta categoria
                </p>
              ) : (
                <ul className="divide-y">
                  {cat.products.map((product) => (
                    <li key={product.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${!product.isAvailable ? "opacity-40 line-through" : ""}`}>
                            {product.name}
                          </p>
                          {!product.isAvailable && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                              Indisponível
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/admin/restaurants/${id}/products/${product.id}/edit`} className="text-xs text-green-600 hover:text-green-800">
                          Editar
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await toggleProductAvailability(product.id, id);
                          }}
                        >
                          <button type="submit" className="text-xs text-blue-500 hover:text-blue-700">
                            {product.isAvailable ? "Desativar" : "Ativar"}
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteProduct(product.id, id);
                          }}
                        >
                          <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                            Excluir
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </section>

      {/* COUPONS */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Cupons de desconto</h2>

        <form action={createCouponForRestaurant} className="mb-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Código *</label>
              <input
                name="code"
                required
                placeholder="EX: PROMO10"
                className="w-full rounded-lg border px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Desconto (%) *</label>
              <input
                name="discountPercent"
                type="number"
                min="1"
                max="100"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Máx. de usos</label>
              <input
                name="maxUses"
                type="number"
                min="1"
                placeholder="100"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Validade (opcional)</label>
            <input
              name="expiresAt"
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" className="w-full rounded-full">
            Criar cupom
          </Button>
        </form>

        {restaurant.coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cupom cadastrado.</p>
        ) : (
          <ul className="divide-y">
            {restaurant.coupons.map((coupon) => (
              <li key={coupon.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!coupon.isActive ? "opacity-40 line-through" : ""}`}>
                      {coupon.code}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {coupon.discountPercent}% off · {coupon.usedCount}/{coupon.maxUses} usos
                    {coupon.expiresAt
                      ? ` · Expira ${new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleCoupon(coupon.id, id);
                    }}
                  >
                    <button type="submit" className="text-xs text-blue-500 hover:text-blue-700">
                      {coupon.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCoupon(coupon.id, id);
                    }}
                  >
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                      Excluir
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* OPENING HOURS */}
      <section className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Horários de funcionamento</h2>
        <form action={upsertHoursForRestaurant} className="space-y-3">
          {DAY_NAMES.map((day, idx) => {
            const hours = hoursMap[idx];
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-20 text-sm font-medium">{day}</span>
                <input
                  type="time"
                  name={`open_${idx}`}
                  defaultValue={hours?.openTime ?? "08:00"}
                  className="rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <input
                  type="time"
                  name={`close_${idx}`}
                  defaultValue={hours?.closeTime ?? "22:00"}
                  className="rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    name={`closed_${idx}`}
                    defaultChecked={hours?.isClosed ?? false}
                    className="rounded"
                  />
                  Fechado
                </label>
              </div>
            );
          })}
          <Button type="submit" size="sm" className="mt-2 w-full rounded-full">
            Salvar horários
          </Button>
        </form>
      </section>
    </div>
  );
};

export default RestaurantDetailPage;
